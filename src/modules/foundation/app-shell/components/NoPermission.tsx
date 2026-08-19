'use client';

import { House, ShieldOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppRouter } from '@/core/router/next';
import { Button } from '@/shared/components/ui/button';

export default function NoPermission() {
  const t = useTranslations('app_shell.no_permission');
  const router = useAppRouter();

  return (
    <main className="flex min-h-[calc(100vh-var(--spacing)*16)] items-center justify-center bg-muted/40 px-4 py-12 sm:px-6">
      <section className="w-full max-w-lg text-center">
        <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 shadow-xs">
          <ShieldOff className="size-9 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2.5">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="mt-7 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            icon={<House className="size-4" />}
          >
            {t('back_home')}
          </Button>
        </div>
      </section>
    </main>
  );
}
