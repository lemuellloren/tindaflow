'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product } from '@/lib/db';
import { useState } from 'react';
import { useProductSort, SORT_OPTIONS } from '@/lib/useProductSort';

const EMPTY_FORM = {
  name: '',
  price: '',
  cost: '',
  stock: '',
  unit: 'pcs',
  category: '',
};

export default function Inventory() {
  const products = useLiveQuery(() => db.products.toArray(), []);
  const { sort, setSort, sorted } = useProductSort(products);

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [restockId, setRestockId] = useState<number | null>(null);
  const [restockQty, setRestockQty] = useState('');

  function openAdd() {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      name: p.name,
      price: String(p.price),
      cost: String(p.cost),
      stock: String(p.stock),
      unit: p.unit,
      category: p.category,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date();
    const data = {
      name: form.name.trim(),
      price: parseFloat(form.price) || 0,
      cost: parseFloat(form.cost) || 0,
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
      category: form.category.trim() || 'Uncategorized',
      updatedAt: now,
    };
    if (editProduct?.id) {
      await db.products.update(editProduct.id, data);
    } else {
      await db.products.add({ ...data, createdAt: now });
    }
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this product?')) {
      await db.products.delete(id);
    }
  }

  async function handleRestock(id: number) {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    await db.products
      .where('id')
      .equals(id)
      .modify((p) => {
        p.stock += qty;
        p.updatedAt = new Date();
      });
    setRestockId(null);
    setRestockQty('');
  }

  const filtered = sorted.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className='p-4 space-y-4'>
      {/* Search + Sort + Add */}
      <div className='flex gap-2'>
        <input
          type='text'
          placeholder='Search products...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-400'
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className='border border-gray-200 rounded-xl px-2 py-2 text-xs outline-none focus:border-green-400 bg-white text-gray-600'
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={openAdd}
          className='bg-green-500 text-white rounded-xl px-4 py-2 text-sm font-medium shrink-0'
        >
          + Add
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className='text-sm text-gray-400 text-center py-10'>
          {(products ?? []).length === 0
            ? 'No products yet. Tap + Add to start.'
            : 'No results.'}
        </p>
      ) : (
        <div className='space-y-2'>
          {filtered.map((p) => (
            <div key={p.id} className='border border-gray-200 rounded-xl p-4'>
              <div className='flex items-start justify-between'>
                <div>
                  <p className='font-medium text-gray-900 text-sm'>{p.name}</p>
                  <p className='text-xs text-gray-500 mt-0.5'>
                    Sell ₱{p.price} · Cost ₱{p.cost}
                  </p>
                  {p.category && (
                    <p className='text-xs text-gray-400 mt-0.5'>{p.category}</p>
                  )}
                </div>
                <div className='text-right'>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : p.stock <= 5
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {p.stock} {p.unit}
                  </span>
                </div>
              </div>

              <div className='flex gap-2 mt-3'>
                <button
                  onClick={() => {
                    setRestockId(p.id!);
                    setRestockQty('');
                  }}
                  className='text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600'
                >
                  Restock
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className='text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600'
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id!)}
                  className='text-xs border border-red-100 rounded-lg px-3 py-1.5 text-red-500'
                >
                  Delete
                </button>
              </div>

              {restockId === p.id && (
                <div className='flex gap-2 mt-2'>
                  <input
                    type='number'
                    placeholder='Qty to add'
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className='flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400'
                  />
                  <button
                    onClick={() => handleRestock(p.id!)}
                    className='bg-green-500 text-white rounded-lg px-3 py-1.5 text-sm'
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setRestockId(null)}
                    className='text-gray-400 text-sm px-2'
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className='fixed inset-0 bg-black/40 z-50 flex items-end md:items-center md:justify-center'>
          <div className='bg-white w-full max-w-md mx-auto rounded-t-2xl md:rounded-2xl p-5'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='font-semibold text-gray-900'>
                {editProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className='text-gray-400 text-xl'
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className='space-y-3'>
              <input
                required
                placeholder='Product name'
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className='w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
              />
              <div className='grid grid-cols-2 gap-3'>
                <input
                  required
                  type='number'
                  placeholder='Selling price (₱)'
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className='border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
                />
                <input
                  required
                  type='number'
                  placeholder='Cost price (₱)'
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className='border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
                />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <input
                  required
                  type='number'
                  placeholder='Stock qty'
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className='border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
                />
                <input
                  placeholder='Unit (pcs, kg...)'
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className='border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
                />
              </div>
              <input
                placeholder='Category (default: Uncategorized)'
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className='w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
              />
              <button
                type='submit'
                className='w-full bg-green-500 text-white rounded-xl py-3 text-sm font-medium'
              >
                {editProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
