'use client';

import React from 'react';
import _ from 'lodash';
import { ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import SelectLanguage from './select-language';
import { AppLink } from '@/core/router/next';
import { GrantedPageRouteConfigProps } from '@/core/router/router.types';
import { useAppShellStore } from '@/modules/foundation/app-shell/stores/app-shell.store';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { cn } from '@/shared/lib/utils';

export function AppHeader() {
  const t = useTranslations();
  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const [isHiding, setIsHiding] = React.useState(false);
  const currentGrantedPageRouteConfig = useAppShellStore(
    state => state.currentGrantedPageRouteConfig,
  );
  const hideAppHeader = useAppShellStore(state => state.hideAppHeader);

  React.useEffect(() => {
    return () => {
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleHideAppHeader = React.useCallback(() => {
    setIsHiding(true);
    hideTimerRef.current = setTimeout(() => {
      hideAppHeader();
    }, 180);
  }, [hideAppHeader]);

  const breadcrumbs = React.useMemo(() => {
    let config = currentGrantedPageRouteConfig;
    const list: GrantedPageRouteConfigProps[] = [];
    while (!_.isEmpty(config)) {
      list.push(config);
      config = config.parent;
    }
    return list.reverse();
  }, [currentGrantedPageRouteConfig]);

  return (
    <header
      className={cn(
        'flex justify-between pe-4 h-16 shrink-0 items-center gap-2 animate-in fade-in slide-in-from-top-2 border-b border-border bg-sidebar-content transition-[width,height,opacity,transform] duration-200 ease-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12',
        {
          '-translate-y-full opacity-0': isHiding,
        },
      )}
    >
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1 hover:bg-accent hover:text-primary transition-colors" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((e, i) => (
              <React.Fragment key={e.key}>
                <BreadcrumbSeparator className="hidden md:block first:hidden" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <AppLink
                      href={e.path}
                      className={cn({
                        'text-primary hover:underline hover:underline-offset-3 transition-colors':
                          i < breadcrumbs.length - 1,
                        'pointer-events-none font-medium':
                          i === breadcrumbs.length - 1,
                      })}
                    >
                      {t(e.title)}
                    </AppLink>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <Button
          aria-label="Ẩn header"
          title="Ẩn header"
          variant="outline"
          size="icon-xs"
          className="h-7 w-8 rounded-full border-primary/25 bg-primary/5 text-primary shadow-sm shadow-primary/10 transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/10 hover:text-primary hover:shadow-md hover:shadow-primary/15"
          disabled={isHiding}
          onClick={handleHideAppHeader}
        >
          <ChevronUp className="size-4 stroke-[2.75]" />
        </Button>
        <SelectLanguage />
      </div>
    </header>
  );
}
