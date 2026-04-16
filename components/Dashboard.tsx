'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { useMemo } from 'react';
import { useProductSort, SORT_OPTIONS } from '@/lib/useProductSort';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function getToday() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}

export default function Dashboard() {
  const { profileName, storeName, setActiveTab, setOpenAddProduct } = useAppStore();
  const today = getToday();
  const todaySales  = useLiveQuery(() => db.sales.where('createdAt').aboveOrEqual(today).toArray(), []);
  const products    = useLiveQuery(() => db.products.toArray(), []);
  const unpaidDebts = useLiveQuery(() => db.debts.where('paid').equals(0).toArray(), []);
  const { sort, setSort, sorted } = useProductSort(products);

  const stats = useMemo(() => {
    const sales = todaySales ?? [];
    return {
      totalSales:  sales.reduce((s, x) => s + x.total, 0),
      totalProfit: sales.reduce((s, x) => s + x.profit, 0),
      txCount:     sales.length,
    };
  }, [todaySales]);

  const lowStock  = useMemo(() => (products ?? []).filter((p) => p.stock > 0 && p.stock <= 5), [products]);
  const outOfStock = useMemo(() => (products ?? []).filter((p) => p.stock === 0), [products]);
  const totalDebt  = useMemo(() => (unpaidDebts ?? []).reduce((s, d) => s + d.amount, 0), [unpaidDebts]);

  const insights = useMemo(() => {
    const msgs: string[] = [];
    lowStock.forEach((p)   => msgs.push(`${p.name} is low — only ${p.stock} ${p.unit} left.`));
    outOfStock.forEach((p) => msgs.push(`${p.name} is out of stock.`));
    return msgs;
  }, [lowStock, outOfStock]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <p className="text-base font-semibold text-foreground">{greeting}, {profileName} 👋</p>
        <p className="text-sm text-muted-foreground">
          {storeName} · {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Today</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Revenue',      value: `₱${stats.totalSales.toLocaleString()}`,  highlight: false },
            { label: 'Profit',       value: `₱${stats.totalProfit.toLocaleString()}`, highlight: true  },
            { label: 'Transactions', value: stats.txCount.toString(),                  highlight: false },
            { label: 'Unpaid Debts', value: `₱${totalDebt.toLocaleString()}`,          highlight: false },
          ].map((c) => (
            <Card key={c.label}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                <p className={`text-2xl font-semibold ${c.highlight ? 'text-primary' : 'text-foreground'}`}>
                  {c.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alerts</p>
          {insights.map((msg, i) => (
            <div key={i} className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
              ⚠ {msg}
            </div>
          ))}
        </div>
      )}

      <div className="hidden md:block">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Quick Actions</p>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => setActiveTab('sales')}>+ Record Sale</Button>
          <Button className="flex-1" variant="outline" onClick={() => { setOpenAddProduct(true); setActiveTab('inventory'); }}>+ New Product</Button>
          <Button className="flex-1" variant="outline" onClick={() => setActiveTab('inventory')}>Manage Inventory</Button>
          <Button className="flex-1" variant="outline" onClick={() => setActiveTab('reports')}>View Reports</Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Products</p>
          {(products ?? []).length > 0 && (
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No products yet. Add one in Inventory.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sorted.slice(0, 8).map((p) => (
              <Card key={p.id}>
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">₱{p.price} · {p.stock} {p.unit}</p>
                  </div>
                  <Badge variant={p.stock === 0 ? 'danger' : p.stock <= 5 ? 'warning' : 'success'}>
                    {p.stock === 0 ? 'Out' : p.stock <= 5 ? 'Low' : 'OK'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
