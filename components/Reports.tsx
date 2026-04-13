'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useMemo, useState } from 'react';

type Range = 'today' | 'week' | 'month' | 'all';

function rangeStart(range: Range): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (range === 'today') return d;
  if (range === 'week') {
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (range === 'month') {
    d.setDate(1);
    return d;
  }
  return new Date(0);
}

export default function Reports() {
  const [range, setRange] = useState<Range>('today');

  const allSales = useLiveQuery(
    () => db.sales.orderBy('createdAt').reverse().toArray(),
    [],
  );
  const allProducts = useLiveQuery(() => db.products.toArray(), []);

  const filteredSales = useMemo(() => {
    const from = rangeStart(range);
    return (allSales ?? []).filter((s) => new Date(s.createdAt) >= from);
  }, [allSales, range]);

  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((s, x) => s + x.total, 0);
    const totalProfit = filteredSales.reduce((s, x) => s + x.profit, 0);
    const txCount = filteredSales.length;
    const avgSale = txCount > 0 ? totalRevenue / txCount : 0;
    const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Top products by qty sold
    const productTotals: Record<
      string,
      { name: string; qty: number; revenue: number }
    > = {};
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productTotals[item.productName]) {
          productTotals[item.productName] = {
            name: item.productName,
            qty: 0,
            revenue: 0,
          };
        }
        productTotals[item.productName].qty += item.quantity;
        productTotals[item.productName].revenue += item.quantity * item.price;
      });
    });
    const topProducts = Object.values(productTotals)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Seller leaderboard
    const sellerTotals: Record<
      string,
      { name: string; revenue: number; txCount: number }
    > = {};
    filteredSales.forEach((sale) => {
      const s = sale.sellerName || 'Unknown';
      if (!sellerTotals[s])
        sellerTotals[s] = { name: s, revenue: 0, txCount: 0 };
      sellerTotals[s].revenue += sale.total;
      sellerTotals[s].txCount += 1;
    });
    const sellers = Object.values(sellerTotals).sort(
      (a, b) => b.revenue - a.revenue,
    );

    return {
      totalRevenue,
      totalProfit,
      txCount,
      avgSale,
      margin,
      topProducts,
      sellers,
    };
  }, [filteredSales]);

  const lowStockCount = (allProducts ?? []).filter(
    (p) => p.stock <= 5 && p.stock > 0,
  ).length;
  const outCount = (allProducts ?? []).filter((p) => p.stock === 0).length;

  const rangeLabels: Record<Range, string> = {
    today: 'Today',
    week: 'This week',
    month: 'This month',
    all: 'All time',
  };

  return (
    <div className='p-4 md:p-6 space-y-5'>
      {/* Range selector */}
      <div className='flex gap-2'>
        {(['today', 'week', 'month', 'all'] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
              range === r
                ? 'bg-green-500 text-white border-green-500'
                : 'border-gray-200 text-gray-500 bg-white'
            }`}
          >
            {rangeLabels[r]}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div>
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
          Summary
        </p>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {[
            {
              label: 'Revenue',
              value: `₱${stats.totalRevenue.toLocaleString()}`,
            },
            {
              label: 'Profit',
              value: `₱${stats.totalProfit.toLocaleString()}`,
              highlight: true,
            },
            { label: 'Transactions', value: stats.txCount.toString() },
            {
              label: 'Avg. Sale',
              value: `₱${Math.round(stats.avgSale).toLocaleString()}`,
            },
            { label: 'Margin', value: `${stats.margin.toFixed(1)}%` },
            {
              label: 'Low Stock Items',
              value: `${lowStockCount + outCount}`,
              warn: outCount > 0,
            },
          ].map((card) => (
            <div
              key={card.label}
              className='border border-gray-200 rounded-xl p-4 bg-white'
            >
              <p className='text-xs text-gray-500 mb-1'>{card.label}</p>
              <p
                className={`text-xl font-semibold ${
                  card.highlight
                    ? 'text-green-600'
                    : card.warn
                      ? 'text-yellow-600'
                      : 'text-gray-900'
                }`}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      {stats.topProducts.length > 0 && (
        <div>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
            Top Products
          </p>
          <div className='space-y-2'>
            {stats.topProducts.map((p, i) => (
              <div
                key={p.name}
                className='flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white'
              >
                <div className='flex items-center gap-3'>
                  <span className='text-xs font-semibold text-gray-400 w-4'>
                    {i + 1}
                  </span>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      {p.name}
                    </p>
                    <p className='text-xs text-gray-400'>{p.qty} units sold</p>
                  </div>
                </div>
                <p className='text-sm font-semibold text-gray-900'>
                  ₱{p.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seller breakdown */}
      {stats.sellers.length > 0 && (
        <div>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
            Sales by Seller
          </p>
          <div className='space-y-2'>
            {stats.sellers.map((s) => (
              <div
                key={s.name}
                className='flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white'
              >
                <div className='flex items-center gap-3'>
                  <div className='w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold shrink-0'>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>
                      {s.name}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {s.txCount} transaction{s.txCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className='text-sm font-semibold text-gray-900'>
                  ₱{s.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales log */}
      <div>
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
          Sales Log
        </p>
        {filteredSales.length === 0 ? (
          <p className='text-sm text-gray-400 text-center py-8'>
            No sales in this period.
          </p>
        ) : (
          <div className='space-y-2'>
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className='border border-gray-200 rounded-xl px-4 py-3 bg-white'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-gray-900'>
                      {sale.items
                        .map((i) => `${i.productName} ×${i.quantity}`)
                        .join(', ')}
                    </p>
                    {sale.note && (
                      <p className='text-xs text-gray-400 italic mt-0.5'>
                        "{sale.note}"
                      </p>
                    )}
                    <p className='text-xs text-gray-400 mt-1'>
                      {new Date(sale.createdAt).toLocaleString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      Seller: {sale.sellerName || 'Unknown'}
                    </p>
                  </div>
                  <div className='text-right shrink-0 ml-4'>
                    <p className='text-sm font-semibold text-gray-900'>
                      ₱{sale.total.toLocaleString()}
                    </p>
                    <p className='text-xs text-green-600'>
                      +₱{sale.profit.toLocaleString()}
                    </p>
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
