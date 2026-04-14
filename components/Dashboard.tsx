'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { useMemo } from 'react';
import { useProductSort, SORT_OPTIONS } from '@/lib/useProductSort';

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Dashboard() {
  const { profileName, storeName, setActiveTab } = useAppStore();
  const today = getToday();

  const todaySales = useLiveQuery(
    () => db.sales.where('createdAt').aboveOrEqual(today).toArray(),
    [],
  );
  const products = useLiveQuery(() => db.products.toArray(), []);
  const unpaidDebts = useLiveQuery(
    () => db.debts.where('paid').equals(0).toArray(),
    [],
  );

  const { sort, setSort, sorted } = useProductSort(products);

  const stats = useMemo(() => {
    const sales = todaySales ?? [];
    const totalSales = sales.reduce((s, sale) => s + sale.total, 0);
    const totalProfit = sales.reduce((s, sale) => s + sale.profit, 0);
    const txCount = sales.length;
    return { totalSales, totalProfit, txCount };
  }, [todaySales]);

  const lowStock = useMemo(
    () => (products ?? []).filter((p) => p.stock > 0 && p.stock <= 5),
    [products],
  );
  const outOfStock = useMemo(
    () => (products ?? []).filter((p) => p.stock === 0),
    [products],
  );
  const totalDebt = useMemo(
    () => (unpaidDebts ?? []).reduce((s, d) => s + d.amount, 0),
    [unpaidDebts],
  );

  const insights = useMemo(() => {
    const msgs: string[] = [];
    lowStock.forEach((p) =>
      msgs.push(`${p.name} is low — only ${p.stock} ${p.unit} left.`),
    );
    outOfStock.forEach((p) => msgs.push(`${p.name} is out of stock.`));
    return msgs;
  }, [lowStock, outOfStock]);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className='p-4 md:p-6 space-y-5'>
      {/* Greeting */}
      <div>
        <p className='text-base font-semibold text-gray-900'>
          {greeting}, {profileName} 👋
        </p>
        <p className='text-sm text-gray-400'>
          {storeName} ·{' '}
          {new Date().toLocaleDateString('en-PH', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Metric Cards */}
      <div>
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
          Today
        </p>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
          <div className='border border-gray-200 rounded-xl p-4 bg-white'>
            <p className='text-xs text-gray-500 mb-1'>Revenue</p>
            <p className='text-2xl font-semibold text-gray-900'>
              ₱{stats.totalSales.toLocaleString()}
            </p>
          </div>
          <div className='border border-gray-200 rounded-xl p-4 bg-white'>
            <p className='text-xs text-gray-500 mb-1'>Profit</p>
            <p className='text-2xl font-semibold text-green-600'>
              ₱{stats.totalProfit.toLocaleString()}
            </p>
          </div>
          <div className='border border-gray-200 rounded-xl p-4 bg-white'>
            <p className='text-xs text-gray-500 mb-1'>Transactions</p>
            <p className='text-2xl font-semibold text-gray-900'>
              {stats.txCount}
            </p>
          </div>
          <div className='border border-gray-200 rounded-xl p-4 bg-white'>
            <p className='text-xs text-gray-500 mb-1'>Unpaid Debts</p>
            <p className='text-2xl font-semibold text-gray-900'>
              ₱{totalDebt.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {insights.length > 0 && (
        <div className='space-y-2'>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            Alerts
          </p>
          {insights.map((msg, i) => (
            <div
              key={i}
              className='bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800'
            >
              ⚠ {msg}
            </div>
          ))}
        </div>
      )}

      {/* Quick actions — desktop */}
      <div className='hidden md:block'>
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-2'>
          Quick Actions
        </p>
        <div className='flex gap-3'>
          <button
            onClick={() => setActiveTab('sales')}
            className='flex-1 bg-green-500 text-white rounded-xl py-3 text-sm font-medium'
          >
            + Record Sale
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className='flex-1 border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium bg-white'
          >
            Manage Inventory
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className='flex-1 border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium bg-white'
          >
            View Reports
          </button>
        </div>
      </div>

      {/* Products */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
            Products
          </p>
          {(products ?? []).length > 0 && (
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className='text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-green-400 bg-white text-gray-600'
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
        {sorted.length === 0 ? (
          <p className='text-sm text-gray-400 text-center py-8'>
            No products yet. Add one in Inventory.
          </p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            {sorted.slice(0, 8).map((p) => (
              <div
                key={p.id}
                className='flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 bg-white'
              >
                <div>
                  <p className='text-sm font-medium text-gray-900'>{p.name}</p>
                  <p className='text-xs text-gray-500'>
                    ₱{p.price} · {p.stock} {p.unit}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    p.stock === 0
                      ? 'bg-red-100 text-red-700'
                      : p.stock <= 5
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {p.stock === 0 ? 'Out' : p.stock <= 5 ? 'Low' : 'OK'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
