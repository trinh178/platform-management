import _ from 'lodash';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import Script from 'next/script';
import { getLocale } from '@/core/i18n/get-locale';
import Providers from '@/core/Providers';
import modules from '@/modules';
import { joinPath } from '@/shared/utils';
import '@/styles/globals.css';

async function getMetadataBase() {
  for (const value of [process.env.APP_URL, process.env.NEXTAUTH_URL]) {
    if (!value) continue;

    try {
      return new URL('/', value);
    } catch {
      // Try the request origin when an environment URL is invalid.
    }
  }

  const requestHeaders = await headers();
  const host = (
    requestHeaders.get('x-forwarded-host') || requestHeaders.get('host')
  )
    ?.split(',')[0]
    .trim();
  const protocol = requestHeaders
    .get('x-forwarded-proto')
    ?.split(',')[0]
    .trim();

  if (host) {
    return new URL(
      `${protocol || (host.startsWith('localhost') ? 'http' : 'https')}://${host}`,
    );
  }

  return new URL('http://localhost:3000');
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get('locale')?.value || 'en';
  const metadataBase = await getMetadataBase();

  try {
    const app = (
      await import(`@/modules/foundation/app-branding/i18n/${locale}.json`)
    ).app;

    return {
      metadataBase,
      title: {
        default: app.name ?? '--',
        template: `%s | ${app.name ?? '--'}`,
      },
      description: app.description ?? '--',
    };
  } catch {
    return {
      metadataBase,
      title: '--',
      description: '--',
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const wsrBaseUrl = process.env.NEXT_PUBLIC_WEB_SHARED_REMOTE_BASE_URL;
  const wsrScriptSrc = wsrBaseUrl
    ? joinPath(wsrBaseUrl, 'widgets-remote.js')
    : undefined;

  const i18nObjects = await Promise.all(
    modules.flatMap(appModule =>
      appModule.importI18n ? [appModule.importI18n(locale)()] : [],
    ),
  );
  const i18n = _.merge({}, ...i18nObjects);

  return (
    <html lang={locale}>
      <body>
        {wsrScriptSrc ? (
          <Script
            src={wsrScriptSrc}
            strategy="beforeInteractive"
            type="module"
          />
        ) : null}
        <Providers locale={locale} i18n={i18n}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
