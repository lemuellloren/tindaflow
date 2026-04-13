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
    sales: <SalesRecorder />,
    debts: <Debts />,
    reports: <Reports />,
    settings: <Settings />,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="hidden md:flex md:flex-col md:w-56 md:border-r md:border-gray-200 md:bg-white md:shrink-0">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            TF
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">TindaFlow</p>
            <p className="text-xs text-gray-400 truncate">{storeName}</p>
          </div>
        </div>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 h-screen">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
          <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center text-white text-xs font-bold">
            TF
          </div>
          <span className="font-semibold text-gray-900">TindaFlow</span>
          <span className="text-gray-400 text-sm ml-1">· {storeName}</span>
        </header>

        {/* Desktop page title bar */}
        <div className="hidden md:flex items-center px-6 py-4 border-b border-gray-200 bg-white shrink-0">
          <h1 className="text-base font-semibold text-gray-900 capitalize">
            {activeTab === 'sales' ? 'Record Sale' : activeTab}
          </h1>
        </div>

        <main className="flex-1 overflow-y-auto">
          {content[activeTab]}
        </main>

        {/* Mobile bottom nav */}
        <div className="md:hidden shrink-0">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
