'use client';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';

export default function Settings() {
  const { profileName, setProfileName, storeName, setStoreName } = useAppStore();
  const [name, setName] = useState(profileName);
  const [store, setStore] = useState(storeName);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) setProfileName(name.trim());
    if (store.trim()) setStoreName(store.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-4 md:p-6 max-w-lg space-y-6">
      {/* Profile section */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profile</p>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-semibold">
              {name.trim().charAt(0).toUpperCase() || 'O'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{name.trim() || 'Owner'}</p>
              <p className="text-xs text-gray-400">Seller · {store.trim() || 'My Store'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Juan"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                This name appears on all sales you record.
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Store name</label>
              <input
                value={store}
                onChange={(e) => setStore(e.target.value)}
                placeholder="e.g. Juan's Sari-Sari Store"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white rounded-xl py-2.5 text-sm font-medium"
          >
            Save Changes
          </button>

          {saved && (
            <p className="text-center text-sm text-green-600">Changes saved ✓</p>
          )}
        </form>
      </div>

      {/* App info */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">About</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">App</span>
            <span className="text-sm font-medium text-gray-900">TindaFlow</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm text-gray-400">1.0.0 MVP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Storage</span>
            <span className="text-sm text-gray-400">Local (offline-first)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Tagline</span>
            <span className="text-sm text-gray-400 italic">Smooth selling, simplified</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b border-red-100 bg-red-50">
          <p className="text-xs font-medium text-red-500 uppercase tracking-wide">Danger Zone</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-3">
            Clearing data will permanently delete all products, sales, and debt records from this device.
          </p>
          <button
            onClick={async () => {
              if (
                confirm(
                  'This will delete ALL your data permanently. This cannot be undone. Continue?'
                )
              ) {
                const { db } = await import('@/lib/db');
                await db.products.clear();
                await db.sales.clear();
                await db.debts.clear();
                alert('All data cleared.');
              }
            }}
            className="border border-red-200 text-red-500 rounded-xl px-4 py-2 text-sm"
          >
            Clear all data
          </button>
        </div>
      </div>
    </div>
  );
}
