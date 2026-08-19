'use client';

import { KeyRound, LogOut, ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useAppSignOut from '@/core/auth/signOut';
import { routerConfig } from '@/core/router/config';
import { useAppRouter } from '@/core/router/next';
import { useIdentityStore } from '@/modules/foundation/identity/stores/identity.store';
import { Button } from '@/shared/components/ui/button';

export default function NoAccessibleRoutes() {
  const t = useTranslations('app_shell.no_accessible_routes');
  const router = useAppRouter();
  const isAuthenticated = useIdentityStore(state => state.isAuthenticated);
  const signOut = useAppSignOut();

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      void signOut.mutate({
        callbackUrl: routerConfig.signInRoute.externalPath,
      });
      return;
    }

    router.push(routerConfig.signInRoute.externalPath);
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-12 sm:px-6">
      <section className="w-full max-w-lg text-center">
        <div className="mx-auto mb-7 flex size-20 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 shadow-xs">
          <ShieldAlert className="size-9 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-primary">{t('eyebrow')}</p>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {isAuthenticated
              ? t('authenticated_title')
              : t('unauthenticated_title')}
          </h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground">
            {isAuthenticated
              ? t('authenticated_description')
              : t('unauthenticated_description')}
          </p>
        </div>

        <div className="mx-auto mt-7 flex max-w-md gap-3 rounded-lg border border-border/80 bg-card/90 px-4 py-3.5 text-left shadow-xs">
          <KeyRound className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {t('permission_title')}
            </p>
            <p className="text-xs leading-5 text-muted-foreground">
              {t('permission_description')}
            </p>
          </div>
        </div>

        <div className="mt-7 flex justify-center">
          <Button
            loading={signOut.isPending}
            onClick={handlePrimaryAction}
            icon={
              isAuthenticated ? (
                <LogOut className="size-4" />
              ) : (
                <KeyRound className="size-4" />
              )
            }
          >
            {isAuthenticated ? t('sign_out') : t('sign_in')}
          </Button>
        </div>
      </section>
    </main>
  );
}
