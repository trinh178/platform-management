import React from 'react';
import { PageContentContext } from './page-content-context';
import { PageContentSkeleton } from './page-content-skeleton';
import { cn } from '@/shared/lib/utils';

interface PageContentProps extends React.ComponentPropsWithoutRef<'div'> {
  fixed?: boolean;
  fullScreen?: boolean;
  loading?: boolean;
}
const PageContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<PageContentProps>
>(({ children, fixed, fullScreen, loading, className, ...props }, ref) => {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const isLoading = loading ?? internalLoading;
  const contextValue = React.useMemo(
    () => ({
      loading: isLoading,
      setLoading: setInternalLoading,
    }),
    [isLoading],
  );

  return (
    <PageContentContext.Provider value={contextValue}>
      <div
        ref={ref}
        aria-busy={isLoading}
        {...props}
        className={cn(
          'animate-in fade-in-0 duration-700 flex flex-col p-4 has-[.page-content-header]:pt-0 relative overflow-x-auto',
          fullScreen ? 'min-h-screen' : 'min-h-0 flex-1',
          {
            'h-screen overflow-hidden': fullScreen && (fixed || isLoading),
            'overflow-hidden': !fullScreen && (fixed || isLoading),
          },
          className,
        )}
      >
        {children}
        {isLoading && (
          <div
            aria-hidden="true"
            className="bg-sidebar-content pointer-events-auto absolute inset-0 z-50 p-4"
          >
            <PageContentSkeleton />
          </div>
        )}
      </div>
    </PageContentContext.Provider>
  );
});

PageContent.displayName = 'PageContent';

export default PageContent;
