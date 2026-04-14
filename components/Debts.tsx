'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useState } from 'react';

const EMPTY_FORM = { customerName: '', amount: '', note: '' };

export default function Debts() {
  const debts = useLiveQuery(
    () => db.debts.orderBy('createdAt').reverse().toArray(),
    [],
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('unpaid');

  const totalUnpaid = (debts ?? [])
    .filter((d) => !d.paid)
    .reduce((s, d) => s + d.amount, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await db.debts.add({
      customerName: form.customerName.trim(),
      amount: parseFloat(form.amount) || 0,
      note: form.note.trim() || undefined,
      paid: false,
      createdAt: new Date(),
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function markPaid(id: number) {
    await db.debts.update(id, { paid: true, paidAt: new Date() });
  }

  async function markUnpaid(id: number) {
    await db.debts.update(id, { paid: false, paidAt: undefined });
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this debt record?')) {
      await db.debts.delete(id);
    }
  }

  const filtered = (debts ?? []).filter((d) => {
    if (filter === 'unpaid') return !d.paid;
    if (filter === 'paid') return d.paid;
    return true;
  });

  return (
    <div className='p-4 space-y-4'>
      {/* Summary */}
      <div className='border border-gray-200 rounded-xl p-4 flex items-center justify-between'>
        <div>
          <p className='text-xs text-gray-500'>Total Unpaid</p>
          <p className='text-2xl font-semibold text-gray-900'>
            ₱{totalUnpaid.toLocaleString()}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className='bg-green-500 text-white rounded-xl px-4 py-2 text-sm font-medium'
        >
          + Add Debt
        </button>
      </div>

      {/* Filter Tabs */}
      <div className='flex gap-2'>
        {(['unpaid', 'paid', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
              filter === f
                ? 'bg-green-500 text-white border-green-500'
                : 'border-gray-200 text-gray-500'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Debt List */}
      {filtered.length === 0 ? (
        <p className='text-sm text-gray-400 text-center py-10'>
          {filter === 'unpaid' ? 'No unpaid debts. Nice! 🎉' : 'No records.'}
        </p>
      ) : (
        <div className='space-y-2'>
          {filtered.map((debt) => (
            <div
              key={debt.id}
              className={`border rounded-xl px-4 py-3 ${
                debt.paid ? 'border-gray-100 bg-gray-50' : 'border-gray-200'
              }`}
            >
              <div className='flex items-start justify-between'>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      debt.paid ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}
                  >
                    {debt.customerName}
                  </p>
                  {debt.note && (
                    <p className='text-xs text-gray-400 mt-0.5 italic'>
                      {debt.note}
                    </p>
                  )}
                  <p className='text-xs text-gray-400 mt-0.5'>
                    {new Date(debt.createdAt).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {debt.paid && debt.paidAt && (
                      <>
                        {' '}
                        · Paid{' '}
                        {new Date(debt.paidAt).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </>
                    )}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    debt.paid ? 'text-gray-400' : 'text-gray-900'
                  }`}
                >
                  ₱{debt.amount.toLocaleString()}
                </p>
              </div>

              <div className='flex gap-2 mt-3'>
                {!debt.paid ? (
                  <button
                    onClick={() => markPaid(debt.id!)}
                    className='text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-1.5'
                  >
                    Mark Paid
                  </button>
                ) : (
                  <button
                    onClick={() => markUnpaid(debt.id!)}
                    className='text-xs border border-gray-200 text-gray-500 rounded-lg px-3 py-1.5'
                  >
                    Undo
                  </button>
                )}
                <button
                  onClick={() => handleDelete(debt.id!)}
                  className='text-xs border border-red-100 text-red-400 rounded-lg px-3 py-1.5'
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Debt Modal */}
      {showForm && (
        <div className='fixed inset-0 bg-black/40 z-50 flex items-end md:items-center md:justify-center'>
          <div className='bg-white w-full max-w-md mx-auto rounded-t-2xl md:rounded-2xl p-5'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='font-semibold text-gray-900'>Add Debt Record</h2>
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
                placeholder='Customer name'
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                className='w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
              />
              <input
                required
                type='number'
                placeholder='Amount (₱)'
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className='w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
              />
              <input
                placeholder='Note (optional)'
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className='w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400'
              />
              <button
                type='submit'
                className='w-full bg-green-500 text-white rounded-xl py-3 text-sm font-medium'
              >
                Add Debt
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
