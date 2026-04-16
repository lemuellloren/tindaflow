'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Range = 'today' | 'week' | 'month' | 'all';

function rangeStart(range: Range): Date {
  const d = new Date(); d.setHours(0,0,0,0);
  if (range === 'today') return d;
  if (range === 'week')  { d.setDate(d.getDate() - 6); return d; }
  if (range === 'month') { d.setDate(1); return d; }
  return new Date(0);
}

export default function Reports() {
  const [range, setRange]   = useState<Range>('today');
  const allSales            = useLiveQuery(() => db.sales.orderBy('createdAt').reverse().toArray(), []);
  const allProducts         = useLiveQuery(() => db.products.toArray(), []);

  const filteredSales = useMemo(() => {
    const from = rangeStart(range);
    return (allSales ?? []).filter((s) => new Date(s.createdAt) >= from);
  }, [allSales, range]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((s, x) => s + x.total, 0);
    const totalProfit  = filteredSales.reduce((s, x) => s + x.profit, 0);
    const txCount      = filteredSales.length;
    const avgSale      = txCount > 0 ? totalRevenue / txCount : 0;
    const margin       = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    const productTotals: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredSales.forEach((sale) => sale.items.forEach((item) => {
      if (!productTotals[item.productName]) productTotals[item.productName] = { name: item.productName, qty: 0, revenue: 0 };
      productTotals[item.productName].qty     += item.quantity;
      productTotals[item.productName].revenue += item.quantity * item.price;
    }));
    const topProducts = Object.values(productTotals).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const sellerTotals: Record<string, { name: string; revenue: number; txCount: number }> = {};
    filteredSales.forEach((sale) => {
      const s = sale.sellerName || 'Unknown';
      if (!sellerTotals[s]) sellerTotals[s] = { name: s, revenue: 0, txCount: 0 };
      sellerTotals[s].revenue += sale.total;
      sellerTotals[s].txCount += 1;
    });
    const sellers = Object.values(sellerTotals).sort((a, b) => b.revenue - a.revenue);
    return { totalRevenue, totalProfit, txCount, avgSale, margin, topProducts, sellers };
  }, [filteredSales]);

  const lowStockCount = (allProducts ?? []).filter((p) => p.stock <= 5 && p.stock > 0).length;
  const outCount      = (allProducts ?? []).filter((p) => p.stock === 0).length;
  const rangeLabels: Record<Range, string> = { today: 'Today', week: 'This week', month: 'This month', all: 'All time' };

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex gap-2">
        {(['today','week','month','all'] as Range[]).map((r) => (
          <Button key={r} variant={range === r ? 'default' : 'outline'} className="flex-1 text-xs" onClick={() => setRange(r)}>
            {rangeLabels[r]}
          </Button>
        ))}
      </div>

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Summary</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Revenue',          value: `₱${stats.totalRevenue.toLocaleString()}`,              cls: '' },
            { label: 'Profit',           value: `₱${stats.totalProfit.toLocaleString()}`,               cls: 'text-primary' },
            { label: 'Transactions',     value: stats.txCount.toString(),                               cls: '' },
            { label: 'Avg. Sale',        value: `₱${Math.round(stats.avgSale).toLocaleString()}`,       cls: '' },
            { label: 'Margin',           value: `${stats.margin.toFixed(1)}%`,                          cls: '' },
            { label: 'Low Stock Items',  value: `${lowStockCount + outCount}`,                          cls: outCount > 0 ? 'text-yellow-600' : '' },
          ].map((c) => (
            <Card key={c.label}>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                <p className={cn('text-xl font-semibold text-foreground', c.cls)}>{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {stats.topProducts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Top Products</p>
          <div className="space-y-2">
            {stats.topProducts.map((p, i) => (
              <Card key={p.name}>
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground w-4">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.qty} units sold</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">₱{p.revenue.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {stats.sellers.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Sales by Seller</p>
          <div className="space-y-2">
            {stats.sellers.map((s) => (
              <Card key={s.name}>
                <CardContent className="py-3 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.txCount} transaction{s.txCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">₱{s.revenue.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Sales Log</p>
        {filteredSales.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No sales in this period.</p>
        ) : (
          <div className="space-y-2">
            {filteredSales.map((sale) => (
              <Card key={sale.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{sale.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}</p>
                      {sale.note && <p className="text-xs text-muted-foreground italic mt-0.5">"{sale.note}"</p>}
                      <p className="text-xs text-muted-foreground mt-1">{new Date(sale.createdAt).toLocaleString('en-PH', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Seller: {sale.sellerName || 'Unknown'}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
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
