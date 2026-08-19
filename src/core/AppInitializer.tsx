'use client';

import React from 'react';
import RouteAuthorizationGuard from './RouteAuthorizationGuard';
import { getGrantedPageRoutesConfigs } from '@/core/router';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';
import { useMe } from '@/modules/foundation/identity/services/users/users.queries';
import { useIdentityStore } from '@/modules/foundation/identity/stores/identity.store';

export default function AppInitializer({ children }: React.PropsWithChildren) {
  // const pathname = usePathname();

  const me = useMe(undefined, {
    meta: {
      notifyError: false,
    },
  });

  const setIsAuthenticated = useIdentityStore(
    state => state.setIsAuthenticated,
  );
  const setUserPermissions = useIdentityStore(
    state => state.setUserPermissions,
  );
  const setGrantedPageRouteConfigs = useAppShellStore(
    state => state.setGrantedPageRouteConfigs,
  );
  const isInitAppFetched = useAppShellStore(state => state.isInitAppFetched);
  const setIsInitAppFetched = useAppShellStore(
    state => state.setIsInitAppFetched,
  );

  React.useEffect(() => {
    if (!me.isFetched) return;

    const permissions = me.data?.permissions || [];

    setIsAuthenticated(me.isSuccess);
    setUserPermissions(permissions);
    setGrantedPageRouteConfigs(
      getGrantedPageRoutesConfigs(me.isSuccess, permissions),
    );
    setIsInitAppFetched(true);
  }, [
    me.data?.permissions,
    me.isFetched,
    me.isSuccess,
    setGrantedPageRouteConfigs,
    setIsAuthenticated,
    setIsInitAppFetched,
    setUserPermissions,
  ]);

  /*
    After init fetch:
      isAuthenticated ?
      userPermissions ?
      grantedPageRoutesConfigs based on the two above
  */
  if (!me.isFetched || !isInitAppFetched) return null;

  // if (me.isError) {
  //   if (pathname !== routerConfig.signInRoute.path) {
  //     return <Redirect to={routerConfig.signInRoute.path} />;
  //   }
  // }

  return <RouteAuthorizationGuard>{children}</RouteAuthorizationGuard>;
}
