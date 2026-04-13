'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SaleItem } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';

export default function SalesRecorder() {
  const { profileName } = useAppStore();
  const products = useLiveQuery(() => db.products.orderBy('name').toArray(), []);
  const recentSales = useLiveQuery(
    () => db.sales.orderBy('createdAt').reverse().limit(30).toArray(),
    []
  );

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState('1');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);

  function addToCart() {
    const product = (products ?? []).find((p) => p.id === parseInt(selectedId));
    if (!product) return;
    const q = parseInt(qty) || 1;
    if (q > product.stock) {
      alert(`Not enough stock. Only ${product.stock} ${product.unit} available.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + q } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id!,
          productName: product.name,
          quantity: q,
          price: product.price,
          cost: product.cost,
        },
      ];
    });
    setSelectedId('');
    setQty('1');
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const profit = cart.reduce((s, i) => s + (i.price - i.cost) * i.quantity, 0);

  async function recordSale() {
    if (cart.length === 0) return;
    const now = new Date();

    await db.transaction('rw', db.sales, db.products, async () => {
      for (const item of cart) {
        await db.products.where('id').equals(item.productId).modify((p) => {
          p.stock -= item.quantity;
          p.updatedAt = now;
        });
      }
      await db.sales.add({
        items: cart,
        total,
        profit,
        note: note.trim() || undefined,
        sellerName: profileName,
        createdAt: now,
      });
    });

    setCart([]);
    setNote('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  }

  return (
    <div className="p-4 md:p-6 md:grid md:grid-cols-2 md:gap-6 md:items-start">
      {/* Left col: recorder */}
      <div className="space-y-4">
        {/* Seller badge */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold">
            {profileName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-gray-500">
            Recording as <span className="font-medium text-gray-900">{profileName}</span>
          </p>
        </div>

        {/* Product picker */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
          <p className="text-xs text-gray-500 font-medium">Add item</p>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400 bg-white"
          >
            <option value="">Select product...</option>
            {(products ?? [])
              .filter((p) => p.stock > 0)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.stock} left (₱{p.price})
                </option>
              ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="Qty"
              className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
            />
            <button
              onClick={addToCart}
              disabled={!selectedId}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-2.5 text-sm font-medium disabled:opacity-40"
            >
              Add to cart
            </button>
          </div>
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Cart</p>
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × ₱{item.price} = ₱{(item.quantity * item.price).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => removeFromCart(item.productId)} className="text-red-400 text-sm px-2">✕</button>
              </div>
            ))}

            <div className="border border-gray-200 rounded-xl px-4 py-3 bg-white space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">₱{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Profit</span>
                <span className="font-medium text-green-600">₱{profit.toLocaleString()}</span>
              </div>
            </div>

            <input
              placeholder="Note (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
            />

            <button
              onClick={recordSale}
              className="w-full bg-green-500 text-white rounded-xl py-3 text-sm font-semibold"
            >
              Record Sale 💰
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 text-center">
            Sale recorded ✓
          </div>
        )}
      </div>

      {/* Right col: recent sales log */}
      <div className="mt-6 md:mt-0 space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Sales</p>
        {(recentSales ?? []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No sales yet.</p>
        ) : (
          <div className="space-y-2">
            {(recentSales ?? []).map((sale) => (
              <div
                key={sale.id}
                className="border border-gray-200 rounded-xl px-4 py-3 bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold shrink-0 mt-0.5">
                      {(sale.sellerName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sale.sellerName || 'Unknown'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sale.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                      </p>
                      {sale.note && (
                        <p className="text-xs text-gray-400 italic mt-0.5">"{sale.note}"</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {new Date(sale.createdAt).toLocaleString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">₱{sale.total.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+₱{sale.profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
