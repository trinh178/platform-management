import { TranslationsFn } from '@/core/i18n/types';
import { GrantedPageRouteConfigProps } from '@/core/router/router.types';

export type SidebarMode = 'persistent' | 'temporary';

export interface AppShellState {
  isInitAppFetched: boolean;
  grantedPageRouteConfigs: GrantedPageRouteConfigProps[];
  currentGrantedPageRouteConfig?: GrantedPageRouteConfigProps;

  sidebarOpen?: boolean;
  sidebarMode?: SidebarMode;
  appHeaderVisible: boolean;

  translations?: TranslationsFn;
}

export interface AppShellActions {
  setIsInitAppFetched: (isInitAppFetched: boolean) => void;
  setGrantedPageRouteConfigs: (configs: GrantedPageRouteConfigProps[]) => void;
  setCurrentGrantedPageRouteConfig: (
    config?: GrantedPageRouteConfigProps,
  ) => void;

  openSidebar: () => void;
  closeSidebar: () => void;
  setSidebarMode: (mode: SidebarMode | undefined) => void;
  showAppHeader: () => void;
  hideAppHeader: () => void;
  setAppHeaderVisible: (visible: boolean) => void;

  setTranslations: (t: TranslationsFn) => void;
  resetAppShell: () => void;
}
