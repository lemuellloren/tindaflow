import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tab = 'dashboard' | 'inventory' | 'sales' | 'debts' | 'reports' | 'settings';

interface AppState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  profileName: string;
  setProfileName: (name: string) => void;
  storeName: string;
  setStoreName: (name: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      profileName: 'Owner',
      setProfileName: (name) => set({ profileName: name }),
      storeName: 'My Store',
      setStoreName: (name) => set({ storeName: name }),
    }),
    {
      name: 'tindaflow-settings',
      partialize: (state) => ({
        profileName: state.profileName,
        storeName: state.storeName,
      }),
    }
  )
);
