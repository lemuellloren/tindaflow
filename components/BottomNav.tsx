'use client';
import { useAppStore, Tab } from '@/lib/store';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, Plus, BarChart2, Settings } from 'lucide-react';

interface TabDef {
  key: Tab;
  label: string;
  special?: boolean;
  icon: React.ReactNode;
}

const tabs: TabDef[] = [
  { key: 'dashboard', label: 'Home',      icon: <LayoutDashboard className="w-5 h-5" /> },
  { key: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
  { key: 'sales',     label: 'Sale',      special: true, icon: <Plus className="w-5 h-5 text-primary-foreground" /> },
  { key: 'reports',   label: 'Reports',   icon: <BarChart2 className="w-5 h-5" /> },
  { key: 'settings',  label: 'Settings',  icon: <Settings className="w-5 h-5" /> },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();
  const regularTabs = tabs.filter((t) => !t.special);
  const saleTabs    = tabs.filter((t) => t.special);

  return (
    <nav className="border-t border-border bg-card">
      {saleTabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
            activeTab === tab.key ? 'bg-brand-600 text-white' : 'bg-primary text-primary-foreground hover:bg-brand-600'
          )}
        >
          <Plus className="w-4 h-4" />
          Record Sale
        </button>
      ))}
      <div className="flex">
        {regularTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
