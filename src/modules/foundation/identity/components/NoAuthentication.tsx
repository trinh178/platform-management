'use client';

import { LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppRouter } from '@/core/router/next';
import { Button } from '@/shared/components/ui/button';

export default function NoAuthentication() {
  const t = useTranslations('identity.no_authentication');
  const router = useAppRouter();

  return (
    <main className="flex min-h-[calc(100vh-var(--spacing)*16)] items-center justify-center bg-muted/40 px-4 py-12 sm:px-6">
      <section className="w-full max-w-lg text-center">
        <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-xs">
          <LogIn className="size-9 text-primary/80" />
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
            onClick={() => router.push('/auth/sign-in')}
            icon={<LogIn className="size-4" />}
          >
            {t('sign_in')}
          </Button>
        </div>
      </section>
    </main>
  );
}
