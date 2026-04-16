'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, SaleItem } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SalesRecorder() {
  const { profileName } = useAppStore();
  const products    = useLiveQuery(() => db.products.orderBy('name').toArray(), []);
  const recentSales = useLiveQuery(() => db.sales.orderBy('createdAt').reverse().limit(30).toArray(), []);

  const [cart, setCart]             = useState<SaleItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty]               = useState('1');
  const [note, setNote]             = useState('');
  const [success, setSuccess]       = useState(false);

  function addToCart() {
    const product = (products ?? []).find((p) => p.id === parseInt(selectedId));
    if (!product) return;
    const q = parseInt(qty) || 1;
    if (q > product.stock) { alert(`Not enough stock. Only ${product.stock} ${product.unit} available.`); return; }
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) return prev.map((i) => i.productId === product.id ? { ...i, quantity: i.quantity + q } : i);
      return [...prev, { productId: product.id!, productName: product.name, quantity: q, price: product.price, cost: product.cost }];
    });
    setSelectedId(''); setQty('1');
  }

  const total  = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const profit = cart.reduce((s, i) => s + (i.price - i.cost) * i.quantity, 0);

  async function recordSale() {
    if (cart.length === 0) return;
    const now = new Date();
    await db.transaction('rw', db.sales, db.products, async () => {
      for (const item of cart) {
        await db.products.where('id').equals(item.productId).modify((p) => { p.stock -= item.quantity; p.updatedAt = now; });
      }
      await db.sales.add({ items: cart, total, profit, note: note.trim()||undefined, sellerName: profileName, createdAt: now });
    });
    setCart([]); setNote(''); setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  }

  return (
    <div className="p-4 md:p-6 md:grid md:grid-cols-2 md:gap-6 md:items-start">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
            {profileName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-muted-foreground">
            Recording as <span className="font-medium text-foreground">{profileName}</span>
          </p>
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Add item</p>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
              <SelectContent>
                {(products ?? []).filter((p) => p.stock > 0).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} — {p.stock} left (₱{p.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" className="w-24" />
              <Button variant="outline" className="flex-1" disabled={!selectedId} onClick={addToCart}>Add to cart</Button>
            </div>
          </CardContent>
        </Card>

        {cart.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Cart</p>
            {cart.map((item) => (
              <Card key={item.productId}>
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.quantity} × ₱{item.price} = ₱{(item.quantity * item.price).toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setCart((prev) => prev.filter((i) => i.productId !== item.productId))}>✕</Button>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardContent className="py-3 px-4 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-semibold text-foreground">₱{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Profit</span><span className="font-medium text-primary">₱{profit.toLocaleString()}</span></div>
              </CardContent>
            </Card>
            <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button className="w-full" onClick={recordSale}>Record Sale 💰</Button>
          </div>
        )}

        {success && (
          <div className="bg-brand-50 border border-brand-200 rounded-lg px-4 py-3 text-sm text-brand-700 text-center">
            Sale recorded ✓
          </div>
        )}
      </div>

      <div className="mt-6 md:mt-0 space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recent Sales</p>
        {(recentSales ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No sales yet.</p>
        ) : (
          <div className="space-y-2">
            {(recentSales ?? []).map((sale) => (
              <Card key={sale.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{sale.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}</p>
                      {sale.note && <p className="text-xs text-muted-foreground italic mt-0.5">"{sale.note}"</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(sale.createdAt).toLocaleString('en-PH', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Seller: {sale.sellerName || 'Unknown'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">₱{sale.total.toLocaleString()}</p>
                      <p className="text-xs text-primary">+₱{sale.profit.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
