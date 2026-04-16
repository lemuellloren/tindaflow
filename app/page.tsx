'use client';
import { useAppStore } from '@/lib/store';
import Dashboard from '@/components/Dashboard';
import Inventory from '@/components/Inventory';
import SalesRecorder from '@/components/SalesRecorder';
import Debts from '@/components/Debts';
import Reports from '@/components/Reports';
import Settings from '@/components/Settings';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const { activeTab, storeName } = useAppStore();

  const content: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    inventory: <Inventory />,
    sales:     <SalesRecorder />,
    debts:     <Debts />,
    reports:   <Reports />,
    settings:  <Settings />,
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden md:flex md:flex-col md:w-56 md:border-r md:border-border md:bg-card md:shrink-0">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">TF</div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight truncate">TindaFlow</p>
            <p className="text-xs text-muted-foreground truncate">{storeName}</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-border bg-card shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">TF</div>
          <span className="font-semibold text-foreground">TindaFlow</span>
          <span className="text-muted-foreground text-sm ml-1">· {storeName}</span>
        </header>

        <div className="hidden md:flex items-center px-6 py-4 border-b border-border bg-card shrink-0">
          <h1 className="text-base font-semibold text-foreground capitalize">
            {activeTab === 'sales' ? 'Record Sale' : activeTab}
          </h1>
        </div>

        <main className="flex-1 overflow-y-auto bg-background">
          {content[activeTab]}
        </main>

        <div className="md:hidden shrink-0">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
