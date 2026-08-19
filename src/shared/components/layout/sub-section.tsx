'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';

interface SubSectionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  'title'
> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  contentClassName?: string;
}

export default function SubSection({
  title,
  description,
  actions,
  className,
  contentClassName,
  children,
  ...props
}: SubSectionProps) {
  const hasHeader = title || description || actions;

  return (
    <section
      className={cn('rounded-md border border-dashed', className)}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-start justify-between gap-3 border-b border-dashed px-4 py-2">
          <div className="min-w-0 space-y-0.5">
            {title && (
              <h3 className="truncate text-sm font-semibold leading-5 text-primary">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs leading-5 text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn('p-4', contentClassName)}>{children}</div>
    </section>
  );
}
