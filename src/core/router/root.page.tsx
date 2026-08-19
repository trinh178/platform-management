'use client';

import React from 'react';
import GlobalAppLoading from '../loading/GlobalAppLoading';
import { routerConfig } from './config';
import { useAppRouter } from './next';
import { GrantedPageRouteConfigProps } from '@/core/router/router.types';
import NoAccessibleRoutes from '@/modules/foundation/app-shell/components/NoAccessibleRoutes';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';

function findFirstAccessibleRoute(
  routes: GrantedPageRouteConfigProps[] | undefined,
) {
  return routes?.find(
    config =>
      config.missingRequiredAccess === 'NONE' &&
      !config.permission?.allowAnyone &&
      config.path !== routerConfig.signInRoute.path,
  );
}

export default function RootPage() {
  const router = useAppRouter();
  const isInitAppFetched = useAppShellStore(state => state.isInitAppFetched);
  const grantedPageRouteConfigs = useAppShellStore(
    state => state.grantedPageRouteConfigs,
  );
  const firstAccessibleRoute = React.useMemo(
    () => findFirstAccessibleRoute(grantedPageRouteConfigs[0]?.children),
    [grantedPageRouteConfigs],
  );

  React.useEffect(() => {
    if (!isInitAppFetched) return;
    if (firstAccessibleRoute) {
      router.push(firstAccessibleRoute.path);
    }
  }, [firstAccessibleRoute, isInitAppFetched, router]);

  if (isInitAppFetched && !firstAccessibleRoute) {
    return <NoAccessibleRoutes />;
  }

  return <GlobalAppLoading />;
}
