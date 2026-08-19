'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TranslationsKey } from '@/core/i18n/types';
import { BackButton } from '@/core/layout/back-button';
import { AppPath } from '@/modules/route-paths';
import { cn } from '@/shared/lib/utils';

interface PageContentHeaderProps {
  backPath?: AppPath;
  title: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PageContentHeader({
  backPath,
  title,
  actions,
}: PageContentHeaderProps) {
  const t = useTranslations();
  const stickySentinelRef = React.useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = React.useState(false);

  React.useEffect(() => {
    const stickySentinel = stickySentinelRef.current;
    if (!stickySentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 1 },
    );

    observer.observe(stickySentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={stickySentinelRef} aria-hidden="true" className="h-px -mb-px" />
      <div
        className={cn(
          'page-content-header',
          'flex flex-row items-center justify-between sticky top-0 bg-sidebar-content/95 backdrop-blur-sm z-50 py-3',
          isSticky &&
            '-mx-4 border-b border-border/70 px-4 shadow-[0_10px_24px_-18px_hsl(var(--foreground))]',
        )}
      >
        <div className="flex items-center gap-3">
          <BackButton backPath={backPath} />
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-5 rounded-full bg-primary" />
            <div className="text-base font-bold tracking-wide uppercase text-foreground">
              {typeof title === 'string' ? t(title as TranslationsKey) : title}
            </div>
          </div>
        </div>
        <div className="flex gap-2">{actions}</div>
      </div>
    </>
  );
}
