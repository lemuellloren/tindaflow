'use client';
import { useAppStore, Tab } from '@/lib/store';

interface NavItem {
  key: Tab;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.8}
        viewBox='0 0 24 24'
      >
        <rect x='3' y='3' width='7' height='7' rx='1.5' />
        <rect x='14' y='3' width='7' height='7' rx='1.5' />
        <rect x='3' y='14' width='7' height='7' rx='1.5' />
        <rect x='14' y='14' width='7' height='7' rx='1.5' />
      </svg>
    ),
  },
  {
    key: 'inventory',
    label: 'Inventory',
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.8}
        viewBox='0 0 24 24'
      >
        <path d='M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z' />
        <path d='M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2' />
      </svg>
    ),
  },
  {
    key: 'sales',
    label: 'Record Sale',
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.8}
        viewBox='0 0 24 24'
      >
        <path d='M12 5v14M5 12h14' strokeLinecap='round' />
      </svg>
    ),
  },
  {
    key: 'debts',
    label: 'Debts',
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.8}
        viewBox='0 0 24 24'
      >
        <path d='M17 9V7a5 5 0 00-10 0v2' />
        <rect x='3' y='9' width='18' height='13' rx='2' />
      </svg>
    ),
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.8}
        viewBox='0 0 24 24'
      >
        <path d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: (
      <svg
        className='w-4 h-4'
        fill='none'
        stroke='currentColor'
        strokeWidth={1.8}
        viewBox='0 0 24 24'
      >
        <circle cx='12' cy='12' r='3' />
        <path d='M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, profileName } = useAppStore();

  const ctaItem = navItems.find((i) => i.key === 'sales')!;
  const regularItems = navItems.filter((i) => i.key !== 'sales');

  return (
    <nav className='flex flex-col flex-1 px-3 py-4'>
      {/* Record Sale CTA */}
      <button
        onClick={() => setActiveTab('sales')}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold mb-3 transition-colors ${
          activeTab === 'sales'
            ? 'bg-green-600 text-white'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='white'
          strokeWidth={2.5}
          viewBox='0 0 24 24'
        >
          <path d='M12 5v14M5 12h14' strokeLinecap='round' />
        </svg>
        Record Sale
      </button>

      <ul className='space-y-0.5 flex-1'>
        {regularItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <li key={item.key}>
              <button
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                  isActive
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={isActive ? 'text-green-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Profile pill at bottom */}
      <button
        onClick={() => setActiveTab('settings')}
        className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left mt-2 border-t border-gray-100 pt-4'
      >
        <div className='w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold shrink-0'>
          {profileName.charAt(0).toUpperCase()}
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-gray-900 truncate'>
            {profileName}
          </p>
          <p className='text-xs text-gray-400'>Seller</p>
        </div>
      </button>
    </nav>
  );
}
