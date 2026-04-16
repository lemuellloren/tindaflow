'use client';
import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function Settings() {
  const { profileName, setProfileName, storeName, setStoreName } = useAppStore();
  const [name, setName]   = useState(profileName);
  const [store, setStore] = useState(storeName);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim())  setProfileName(name.trim());
    if (store.trim()) setStoreName(store.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-4 md:p-6 max-w-lg space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-semibold">
              {name.trim().charAt(0).toUpperCase() || 'O'}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{name.trim() || 'Owner'}</p>
              <p className="text-xs text-muted-foreground">Seller · {store.trim() || 'My Store'}</p>
            </div>
          </div>
          <Separator />
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="profileName">Your name</Label>
              <Input id="profileName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Juan" />
              <p className="text-xs text-muted-foreground">This name appears on all sales you record.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="storeName">Store name</Label>
              <Input id="storeName" value={store} onChange={(e) => setStore(e.target.value)} placeholder="e.g. Juan's Sari-Sari Store" />
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
            {saved && <p className="text-center text-sm text-primary">Changes saved ✓</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">About</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: 'App',     value: 'TindaFlow' },
            { label: 'Version', value: '1.0.0 MVP' },
            { label: 'Storage', value: 'Local (offline-first)' },
            { label: 'Tagline', value: 'Smooth selling, simplified' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="text-sm text-destructive">Danger Zone</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Clearing data will permanently delete all products, sales, and debt records from this device.
          </p>
          <Button
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={async () => {
              if (confirm('This will delete ALL your data permanently. This cannot be undone. Continue?')) {
                const { db } = await import('@/lib/db');
                await db.products.clear(); await db.sales.clear(); await db.debts.clear();
                alert('All data cleared.');
              }
            }}
          >
            Clear all data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
