'use client';

import React from 'react';
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useAppSignOut from '@/core/auth/signOut';
import type { User } from '@/modules/foundation/identity/services/users/users.api';
import { useMe } from '@/modules/foundation/identity/services/users/users.queries';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { getFullName } from '@/shared/utils';

function getDisplayName(user: User | undefined, fallback: string) {
  if (!user) return fallback;

  const fullName = getFullName(user);
  return fullName === '-' ? user.username || user.email || fallback : fullName;
}

function getUserSubtitle(user: User | undefined, fallback: string) {
  return user?.email || user?.username || fallback;
}

function getInitials(user: User | undefined) {
  const initials = [user?.firstName?.trim()[0], user?.lastName?.trim()[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase();

  if (initials) return initials;

  return (user?.username || user?.email || 'U').slice(0, 2).toUpperCase();
}

export function NavUser() {
  const t = useTranslations('app_shell.user_menu');
  const { isMobile } = useSidebar();
  const me = useMe(undefined, { meta: { notifyError: false } });
  const signOut = useAppSignOut();

  const displayName = getDisplayName(me.data, t('unknown_user'));
  const subtitle = getUserSubtitle(me.data, t('unknown_email'));
  const initials = getInitials(me.data);

  const handleLogout = () => {
    if (signOut.isPending) return;
    void signOut.mutate();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{subtitle}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{subtitle}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled>
                <BadgeCheck />
                {t('account')}
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Bell />
                {t('notifications')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              disabled={signOut.isPending}
            >
              <LogOut />
              {t('log_out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
