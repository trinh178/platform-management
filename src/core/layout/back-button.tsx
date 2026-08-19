'use client';

import { ComponentProps } from 'react';
import { ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAppRouter } from '@/core/router/next';
import type { AppPath } from '@/modules/route-paths';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

function BackButton({
  backPath,
  backPathParams,
  ...props
}: ComponentProps<typeof Button> & {
  backPath?: AppPath;
  backPathParams?: Record<string, string>;
}) {
  const pathname = usePathname();
  const router = useAppRouter();

  return (
    <Button
      variant="ghost"
      {...props}
      className={cn('size-10', props.className)}
      onClick={() => {
        if (backPath) {
          router.replace(backPath, {
            params: backPathParams,
          });
        } else if (window.history.length > 0) {
          router.back();
        } else {
          router.replace(
            new URL('../', `https://example.com${pathname}/`).pathname,
          );
        }
      }}
    >
      <ArrowLeft className="size-6" />
    </Button>
  );
}

export { BackButton };
