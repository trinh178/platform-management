import React from 'react';
import { cn } from '@/shared/lib/utils';

interface SectionPanelProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'title'
> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  contentClassName?: string;
}

export default function SectionPanel({
  title,
  description,
  actions,
  className,
  contentClassName,
  children,
  ...props
}: SectionPanelProps) {
  const hasHeader = title || description || actions;

  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs',
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <div className="flex min-h-11 items-center justify-between gap-3 border-b bg-muted/25 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-5 w-1 shrink-0 rounded-full bg-primary" />
            <div className="min-w-0 space-y-0.5">
              {title && (
                <h2 className="truncate text-sm font-semibold leading-5">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs leading-5 text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn('p-4', contentClassName)}>{children}</div>
    </section>
  );
}
