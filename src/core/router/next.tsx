/* eslint-disable no-restricted-imports */
import type { UrlObject } from 'url';
import React, { ComponentProps } from 'react';
import {
  AppRouterInstance,
  NavigateOptions,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import nprogress from 'nprogress';
import { AppPath } from '@/modules/route-paths';
import { joinPath } from '@/shared/utils';
import { comparePathname } from '@/shared/utils/path-tools';

type AppLinkHref = AppPath | (string & {}) | UrlObject;
type QueryParams = NavigateOptions['params'] | UrlObject['query'];
type AppLinkNavigateEvent = Parameters<
  NonNullable<ComponentProps<typeof Link>['onNavigate']>
>[0];

function getQueryString(params?: QueryParams) {
  if (!params) return '';

  if (typeof params === 'string') return new URLSearchParams(params).toString();

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(key, String(item)));
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

function appendParams(href: string, params?: QueryParams) {
  const query = getQueryString(params);
  if (!query) return href;

  const hashIndex = href.indexOf('#');
  const pathWithSearch = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
  const separator = pathWithSearch.includes('?') ? '&' : '?';
  const path = `${pathWithSearch}${separator}${query}`;

  return `${path}${hash}`;
}

function getHrefString(href: AppLinkHref) {
  if (typeof href === 'string') return href;

  const path = href.pathname?.toString() ?? href.href?.toString() ?? '';
  const search = href.search?.toString() ?? '';
  const hash = href.hash?.toString() ?? '';

  if (href.query) {
    return `${appendParams(path, href.query as QueryParams)}${hash}`;
  }

  return `${path}${search}${hash}`;
}

function getProcessedHref(
  pathname: string,
  href: string,
  options?: NavigateOptions,
) {
  href = options?.relative ? joinPath(pathname, href) : href;
  return appendParams(href, options?.params);
}

function getNextNavigateOptions(options?: NavigateOptions) {
  if (!options) return undefined;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { params, relative, ...nextOptions } = options;
  return nextOptions;
}

export function useAppRouter() {
  const router = useRouter();
  const pathname = usePathname();

  const r = React.useMemo(
    () =>
      ({
        ...router,
        push(href, options) {
          try {
            href = getProcessedHref(pathname, href, options);

            if (!comparePathname(pathname, href)) {
              nprogress.start();
            }
          } catch (e) {
            console.error(e);
          } finally {
            router.push(href, getNextNavigateOptions(options));
          }
        },
        replace(href, options) {
          try {
            href = getProcessedHref(pathname, href, options);

            if (!comparePathname(pathname, href)) {
              nprogress.start();
            }
          } catch (e) {
            console.error(e);
          } finally {
            router.replace(href, getNextNavigateOptions(options));
          }
        },
      }) as AppRouterInstance,
    [router, pathname],
  );

  React.useEffect(() => {
    nprogress.done();
    return () => {
      nprogress.done();
    };
  }, [pathname]);

  return r;
}

export function AppLink({
  href,
  relative,
  params,
  onClick,
  onNavigate,
  ...props
}: Omit<ComponentProps<typeof Link>, 'href'> &
  NavigateOptions & {
    href: AppLinkHref;
  }) {
  const pathname = usePathname();

  const _href = React.useMemo(() => {
    if (!href) return href;
    let path = getHrefString(href);
    path = relative ? joinPath(pathname, path) : path;
    return appendParams(path, params);
  }, [href, params, pathname, relative]);

  const handleNavigate = React.useCallback(
    (event: AppLinkNavigateEvent) => {
      let navigationPrevented = false;
      const preventDefault = event.preventDefault;
      const wrappedEvent = {
        ...event,
        preventDefault() {
          navigationPrevented = true;
          preventDefault();
        },
      };

      try {
        onNavigate?.(wrappedEvent);

        if (!navigationPrevented && !comparePathname(pathname, _href)) {
          nprogress.start();
        }
      } catch (e) {
        console.error(e);
      }
    },
    [_href, onNavigate, pathname],
  );

  React.useEffect(() => {
    nprogress.done();
    return () => {
      nprogress.done();
    };
  }, [pathname]);

  return (
    <Link
      {...props}
      href={_href}
      onClick={onClick}
      onNavigate={handleNavigate}
    />
  );
}
