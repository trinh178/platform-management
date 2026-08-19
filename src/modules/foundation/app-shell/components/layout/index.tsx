'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppShellStore } from '../../stores/app-shell.store';
import { AppHeader } from './app-header';
import { AppSidebar } from './app-sidebar';
import { Button } from '@/shared/components/ui/button';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';

const MockUserSwitcher =
  process.env.NEXT_PUBLIC_MOCK_API === 'true'
    ? React.lazy(() => import('@/mock/MockUserSwitcher'))
    : null;

export default function Layout({ children }: React.PropsWithChildren) {
  const sidebarOpen = useAppShellStore(state => state.sidebarOpen);
  const appHeaderVisible = useAppShellStore(state => state.appHeaderVisible);
  const openSidebar = useAppShellStore(state => state.openSidebar);
  const closeSidebar = useAppShellStore(state => state.closeSidebar);
  const showAppHeader = useAppShellStore(state => state.showAppHeader);

  const setSidebarOpen = React.useCallback(
    (open: boolean) => {
      if (open) openSidebar();
      else closeSidebar();
    },
    [closeSidebar, openSidebar],
  );

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <AppSidebar className="z-60" />
      <SidebarInset className="relative bg-sidebar-content min-w-0">
        {appHeaderVisible ? (
          <AppHeader />
        ) : (
          <Button
            aria-label="Hiện header"
            title="Hiện header"
            variant="default"
            size="icon-xs"
            className="fixed top-0 left-1/2 z-70 h-5 w-10 -translate-x-1/2 animate-in fade-in slide-in-from-top-1 rounded-t-none rounded-b-full border border-t-0 border-primary/25 bg-primary pt-0 text-primary-foreground shadow-sm shadow-primary/20 transition-[height,background-color,box-shadow,transform] duration-200 ease-out hover:h-6 hover:bg-primary/90 hover:shadow-md"
            onClick={showAppHeader}
          >
            <ChevronDown className="size-4 stroke-[2.75]" />
          </Button>
        )}
        {children}
      </SidebarInset>
      {MockUserSwitcher && (
        <React.Suspense>
          <MockUserSwitcher />
        </React.Suspense>
      )}
    </SidebarProvider>
  );
}
