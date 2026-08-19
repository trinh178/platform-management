'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppRouter } from '@/core/router/next';
import {
  GrantedPageRouteConfigProps,
  NavMenuItemProps,
} from '@/core/router/router.types';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

function checkIsSelected(
  key: string,
  config?: GrantedPageRouteConfigProps,
): boolean {
  while (config) {
    if (config.key === key) return true;
    config = config.parent;
  }
  return false;
}

type MenuItemProps = {
  item: NavMenuItemProps;
  level?: number;
  currentConfig?: GrantedPageRouteConfigProps;
};

const MenuItem = React.memo(function MenuItem({
  item,
  level = 0,
  currentConfig,
}: MenuItemProps) {
  const t = useTranslations();
  const router = useAppRouter();

  const isSelected = React.useMemo(
    () => checkIsSelected(item.key, currentConfig),
    [item.key, currentConfig],
  );

  const hasChildren = item.items && item.items.length > 0;

  const [open, setOpen] = React.useState(isSelected);

  React.useEffect(() => {
    if (isSelected) React.startTransition(() => setOpen(true));
  }, [isSelected]);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t(item.title)}
        isActive={isSelected}
        onClick={() => {
          if (hasChildren) {
            setOpen(prev => !prev);
          } else if (item.action) {
            router.push(item.action);
          }
        }}
        style={{
          paddingLeft: 12 + level * 12,
        }}
      >
        {item.icon}

        <span className="flex-1">{t(item.title)}</span>

        {hasChildren && (
          <ChevronRight
            size={16}
            className={`ml-auto transition-transform duration-200 ${
              open ? 'rotate-90' : ''
            }`}
          />
        )}
      </SidebarMenuButton>

      {hasChildren && open && (
        <SidebarMenu>
          {item.items!.map(child => (
            <MenuItem
              key={child.key}
              item={child}
              level={level + 1}
              currentConfig={currentConfig}
            />
          ))}
        </SidebarMenu>
      )}
    </SidebarMenuItem>
  );
});

export function NavMain({ items }: { items: NavMenuItemProps[] }) {
  const t = useTranslations();

  const currentGrantedPageRouteConfig = useAppShellStore(
    state => state.currentGrantedPageRouteConfig,
  );

  if (!items || items.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(items[0].groupLabel[0])}</SidebarGroupLabel>

      <SidebarMenu>
        {items.map(item => (
          <MenuItem
            key={item.key}
            item={item}
            currentConfig={currentGrantedPageRouteConfig}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
