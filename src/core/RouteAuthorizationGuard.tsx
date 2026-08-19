import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppRouter } from '@/core/router/next';
import Redirect from '@/core/router/Redirect';
import rootRoute from '@/core/router/rootRoute';
import { GrantedPageRouteConfigProps } from '@/core/router/router.types';
import { findGrantedPageRouteConfigByPath } from '@/core/router/utils';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';

function AuthorizationHandler({
  children,
  config,
}: React.PropsWithChildren<{ config: GrantedPageRouteConfigProps }>) {
  switch (config.missingRequiredAccess) {
    case 'GUEST':
      if (typeof config.permission?.handleUnGuest === 'string') {
        return <Redirect to={config.permission.handleUnGuest} />;
      }
      return config.permission!.handleUnGuest;

    case 'AUTHENTICATED_USER':
      if (typeof config.permission?.handleUnauthenticated === 'string') {
        return <Redirect to={config.permission.handleUnauthenticated} />;
      }
      return config.permission!.handleUnauthenticated;

    case 'AUTHORIZED_USER':
      if (typeof config.permission?.handleNoPermission === 'string') {
        return <Redirect to={config.permission.handleNoPermission} />;
      }
      return config.permission!.handleNoPermission;

    default:
      return children;
  }
}

export default function RouteAuthorizationGuard({
  children,
}: React.PropsWithChildren) {
  const router = useAppRouter();

  const currentGrantedPageRouteConfig = useAppShellStore(
    state => state.currentGrantedPageRouteConfig,
  );
  const grantedPageRouteConfigs = useAppShellStore(
    state => state.grantedPageRouteConfigs,
  );
  const setCurrentGrantedPageRouteConfig = useAppShellStore(
    state => state.setCurrentGrantedPageRouteConfig,
  );

  const pathname = usePathname();

  React.useEffect(() => {
    const config = findGrantedPageRouteConfigByPath(
      grantedPageRouteConfigs,
      pathname,
    );
    setCurrentGrantedPageRouteConfig(config);

    // Không tìm thấy path hiện tại nằm trong page route configs, redirect to root
    if (!config) {
      router.push(rootRoute.path);
    }
  }, [
    grantedPageRouteConfigs,
    pathname,
    router,
    setCurrentGrantedPageRouteConfig,
  ]);

  if (!currentGrantedPageRouteConfig) return null;

  return (
    <AuthorizationHandler config={currentGrantedPageRouteConfig}>
      {children}
    </AuthorizationHandler>
  );
}
