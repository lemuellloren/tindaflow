'use client';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const EMPTY_FORM = { customerName: '', amount: '', note: '' };
type Filter = 'unpaid' | 'paid' | 'all';

export default function Debts() {
  const debts      = useLiveQuery(() => db.debts.orderBy('createdAt').reverse().toArray(), []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [filter, setFilter]     = useState<Filter>('unpaid');

  const totalUnpaid = (debts ?? []).filter((d) => !d.paid).reduce((s, d) => s + d.amount, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await db.debts.add({ customerName: form.customerName.trim(), amount: parseFloat(form.amount)||0, note: form.note.trim()||undefined, paid: false, createdAt: new Date() });
    setForm(EMPTY_FORM); setShowForm(false);
  }

  const filtered = (debts ?? []).filter((d) => filter === 'all' ? true : filter === 'paid' ? d.paid : !d.paid);

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total Unpaid</p>
            <p className="text-2xl font-semibold text-foreground">₱{totalUnpaid.toLocaleString()}</p>
          </div>
          <Button onClick={() => setShowForm(true)}>+ Add Debt</Button>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {(['unpaid','paid','all'] as Filter[]).map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} className="flex-1" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          {filter === 'unpaid' ? 'No unpaid debts. Nice! 🎉' : 'No records.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((debt) => (
            <Card key={debt.id} className={cn(debt.paid && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={cn('text-sm font-medium text-foreground', debt.paid && 'line-through text-muted-foreground')}>{debt.customerName}</p>
                    {debt.note && <p className="text-xs text-muted-foreground italic mt-0.5">{debt.note}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(debt.createdAt).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' })}
                      {debt.paid && debt.paidAt && <> · Paid {new Date(debt.paidAt).toLocaleDateString('en-PH', { month:'short', day:'numeric' })}</>}
                    </p>
                  </div>
                  <p className={cn('text-sm font-semibold', debt.paid ? 'text-muted-foreground' : 'text-foreground')}>₱{debt.amount.toLocaleString()}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  {!debt.paid
                    ? <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10" onClick={() => db.debts.update(debt.id!, { paid: true, paidAt: new Date() })}>Mark Paid</Button>
                    : <Button size="sm" variant="outline" onClick={() => db.debts.update(debt.id!, { paid: false, paidAt: undefined })}>Undo</Button>
                  }
                  <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => confirm('Delete this debt record?') && db.debts.delete(debt.id!)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Debt Record</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Customer name</Label>
              <Input required placeholder="e.g. Maria Santos" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (₱)</Label>
              <Input required type="number" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input placeholder="e.g. Rice and canned goods" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <Button type="submit" className="w-full">Add Debt</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
