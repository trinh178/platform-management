'use client';

import React from 'react';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { generateNavMenuFromGrantedPageRouteConfig } from '@/core/router/nav-menu';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import AppSwitcher from '@/shared/wsr/widgets/app-switcher';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const grantedPageRouteConfigs = useAppShellStore(
    state => state.grantedPageRouteConfigs,
  );

  const itemsGroups = React.useMemo(() => {
    const items = generateNavMenuFromGrantedPageRouteConfig(
      grantedPageRouteConfigs,
    );
    return [...new Set(items.map(e => e.groupLabel[0]))].map(e =>
      items.filter(item => item.groupLabel[0] === e),
    );
  }, [grantedPageRouteConfigs]);

  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <AppSwitcher
                key={open ? 'app-switcher-full' : 'app-switcher-icon'}
                appKey={process.env.NEXT_PUBLIC_APP_KEY}
                triggerVariant={open ? 'full' : 'icon'}
                triggerOnly={process.env.NEXT_PUBLIC_SINGLE_APP === 'true'}
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {itemsGroups.map(items => (
          <NavMain key={items[0]?.groupLabel[0]} items={items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
