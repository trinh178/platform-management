'use client';

import React, { use } from 'react';
import { findGrantedPageRouteConfigByPath } from '@/core/router/utils';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';

export default function Page(props: PageProps<'/[...slug]'>) {
  const currentPath = '/' + use(props.params).slug.join('/');

  const grantedPageRouteConfigs = useAppShellStore(
    state => state.grantedPageRouteConfigs,
  );

  const render = React.useMemo(() => {
    const config = findGrantedPageRouteConfigByPath(
      grantedPageRouteConfigs,
      currentPath,
    );
    return config?.Component && <config.Component />;
  }, [currentPath, grantedPageRouteConfigs]);

  return render;
}
