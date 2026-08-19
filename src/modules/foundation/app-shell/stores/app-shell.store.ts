import { create } from 'zustand';
import { AppShellActions, AppShellState } from './app-shell.types';

export const initialState: AppShellState = {
  isInitAppFetched: false,
  grantedPageRouteConfigs: [],

  sidebarOpen: true,
  appHeaderVisible: true,
};

export const useAppShellStore = create<AppShellState & AppShellActions>(
  set => ({
    ...initialState,
    setIsInitAppFetched: isInitAppFetched => set({ isInitAppFetched }),
    setGrantedPageRouteConfigs: configs =>
      set({ grantedPageRouteConfigs: configs }),
    setCurrentGrantedPageRouteConfig: config =>
      set({ currentGrantedPageRouteConfig: config }),

    openSidebar: () => set({ sidebarOpen: true }),
    closeSidebar: () => set({ sidebarOpen: false }),
    setSidebarMode: mode => set({ sidebarMode: mode }),
    showAppHeader: () => set({ appHeaderVisible: true }),
    hideAppHeader: () => set({ appHeaderVisible: false }),
    setAppHeaderVisible: visible => set({ appHeaderVisible: visible }),

    setTranslations: t => set({ translations: t }),
    resetAppShell: () => set(initialState),
  }),
);
