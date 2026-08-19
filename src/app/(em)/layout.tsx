'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { findGrantedPageRouteConfigByPath } from '@/core/router/utils';
import EMLayout from '@/modules/foundation/app-shell/components/layout';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';

export default function Layout({ children }: React.PropsWithChildren) {
  const pathname = usePathname();
  const grantedPageRouteConfigs = useAppShellStore(
    state => state.grantedPageRouteConfigs,
  );

  const currentGrantedPageRouteConfig = React.useMemo(
    () => findGrantedPageRouteConfigByPath(grantedPageRouteConfigs, pathname),
    [grantedPageRouteConfigs, pathname],
  );

  if (currentGrantedPageRouteConfig?.permission?.allowAnyone) return children;

  return <EMLayout>{children}</EMLayout>;
}
