'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import appConfig from '@/modules/foundation/app-branding/app-config';
import AppIcon from '@/shared/components/ui/app-icon';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

export function LoginForm({
  onSubmit,
  loading,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onSubmit'> & {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}) {
  const t = useTranslations('identity.auth');
  const tApp = useTranslations('app');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    onSubmit(
      String(data.get('email') ?? ''),
      String(data.get('password') ?? ''),
    );
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl shadow-primary/15 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <Image
                  src={appConfig.logo}
                  alt={tApp('name')}
                  priority
                  className="mb-1 h-20 w-auto object-contain"
                />

                <h1 className="text-2xl font-bold text-foreground">
                  {t('welcome_back')}
                </h1>

                <p className="text-muted-foreground text-sm text-balance">
                  {t('sign_in_subtitle', { appName: tApp('name') })}
                </p>
              </div>

              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                >
                  {t('email')}
                </FieldLabel>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('email_placeholder')}
                  autoComplete="email"
                  disabled={loading}
                  required
                  className="border-border focus-visible:ring-primary/30 focus-visible:border-primary"
                />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="password"
                  className="text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                >
                  {t('password')}
                </FieldLabel>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  className="border-border focus-visible:ring-primary/30 focus-visible:border-primary"
                />
              </Field>

              <Field>
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all duration-200"
                >
                  {t('sign_in')}
                </Button>
              </Field>

              <FieldDescription className="text-center text-xs">
                {t('contact_admin')}
              </FieldDescription>
            </FieldGroup>
          </form>

          <div className="relative hidden md:flex flex-col items-center justify-center overflow-hidden bg-sidebar">
            <div className="relative z-10 flex flex-col items-center gap-5 px-8 text-center">
              <AppIcon src={appConfig.icon} size={56} rounded="2xl" />

              <div>
                <h2 className="text-xl font-bold text-sidebar-foreground">
                  {tApp('shortName')}
                </h2>

                <p className="mt-1.5 text-sm text-sidebar-foreground/60 leading-relaxed max-w-50">
                  {tApp('description')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
