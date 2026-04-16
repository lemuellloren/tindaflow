'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Product } from '@/lib/db';
import { useState, useEffect } from 'react';
import { useProductSort, SORT_OPTIONS } from '@/lib/useProductSort';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EMPTY_FORM = { name: '', price: '', cost: '', stock: '', unit: 'pcs', category: '' };

export default function Inventory() {
  const products = useLiveQuery(() => db.products.toArray(), []);
  const { sort, setSort, sorted } = useProductSort(products);
  const { openAddProduct, setOpenAddProduct } = useAppStore();

  const [showForm, setShowForm]       = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [search, setSearch]           = useState('');
  const [restockId, setRestockId]     = useState<number | null>(null);
  const [restockQty, setRestockQty]   = useState('');

  useEffect(() => {
    if (openAddProduct) { setEditProduct(null); setForm(EMPTY_FORM); setShowForm(true); setOpenAddProduct(false); }
  }, [openAddProduct, setOpenAddProduct]);

  function openAdd()      { setEditProduct(null); setForm(EMPTY_FORM); setShowForm(true); }
  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({ name: p.name, price: String(p.price), cost: String(p.cost), stock: String(p.stock), unit: p.unit, category: p.category });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date();
    const data = {
      name: form.name.trim(), price: parseFloat(form.price)||0, cost: parseFloat(form.cost)||0,
      stock: parseInt(form.stock)||0, unit: form.unit,
      category: form.category.trim() || 'Uncategorized', updatedAt: now,
    };
    if (editProduct?.id) await db.products.update(editProduct.id, data);
    else await db.products.add({ ...data, createdAt: now });
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this product?')) await db.products.delete(id);
  }

  async function handleRestock(id: number) {
    const qty = parseInt(restockQty);
    if (!qty || qty <= 0) return;
    await db.products.where('id').equals(id).modify((p) => { p.stock += qty; p.updatedAt = new Date(); });
    setRestockId(null); setRestockQty('');
  }

  const filtered = sorted.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="w-44 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="shrink-0">+ Add</Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          {(products ?? []).length === 0 ? 'No products yet. Tap + Add to start.' : 'No results.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Sell ₱{p.price} · Cost ₱{p.cost}</p>
                    {p.category && <p className="text-xs text-muted-foreground mt-0.5">{p.category}</p>}
                  </div>
                  <Badge variant={p.stock === 0 ? 'danger' : p.stock <= 5 ? 'warning' : 'success'}>
                    {p.stock} {p.unit}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => { setRestockId(p.id!); setRestockQty(''); }}>Restock</Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(p.id!)}>Delete</Button>
                </div>

                {restockId === p.id && (
                  <div className="flex gap-2 mt-2">
                    <Input type="number" placeholder="Qty to add" value={restockQty} onChange={(e) => setRestockQty(e.target.value)} className="h-9" />
                    <Button size="sm" onClick={() => handleRestock(p.id!)}>Add</Button>
                    <Button size="sm" variant="ghost" onClick={() => setRestockId(null)}>✕</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Product name</Label>
              <Input id="name" required placeholder="e.g. Coca-Cola 1.5L" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Selling price (₱)</Label>
                <Input id="price" required type="number" placeholder="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cost">Cost price (₱)</Label>
                <Input id="cost" required type="number" placeholder="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock qty</Label>
                <Input id="stock" required type="number" placeholder="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" placeholder="pcs, kg, pack..." value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category <span className="text-muted-foreground font-normal">(default: Uncategorized)</span></Label>
              <Input id="category" placeholder="e.g. Beverages" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">
              {editProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
