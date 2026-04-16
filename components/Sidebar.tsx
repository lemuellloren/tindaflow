'use client';
import { useAppStore, Tab } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Package, Plus, Lock, BarChart2, Settings } from 'lucide-react';

interface NavItem { key: Tab; label: string; icon: React.ReactNode; }

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: 'inventory', label: 'Inventory',   icon: <Package className="w-4 h-4" /> },
  { key: 'sales',     label: 'Record Sale', icon: <Plus className="w-4 h-4" /> },
  { key: 'debts',     label: 'Debts',       icon: <Lock className="w-4 h-4" /> },
  { key: 'reports',   label: 'Reports',     icon: <BarChart2 className="w-4 h-4" /> },
  { key: 'settings',  label: 'Settings',    icon: <Settings className="w-4 h-4" /> },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, profileName } = useAppStore();
  const regularItems = navItems.filter((i) => i.key !== 'sales');

  return (
    <nav className="flex flex-col flex-1 px-3 py-4 gap-1">
      <Button
        onClick={() => setActiveTab('sales')}
        className={cn('w-full justify-center gap-2 mb-2', activeTab === 'sales' && 'bg-brand-600')}
      >
        <Plus className="w-4 h-4" />
        Record Sale
      </Button>

      <ul className="space-y-0.5 flex-1">
        {regularItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <li key={item.key}>
              <button
                onClick={() => setActiveTab(item.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      <Separator className="my-2" />
      <button
        onClick={() => setActiveTab('settings')}
        className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent transition-colors w-full text-left"
      >
        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
          {profileName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{profileName}</p>
          <p className="text-xs text-muted-foreground">Seller</p>
        </div>
      </button>
    </nav>
  );
}
