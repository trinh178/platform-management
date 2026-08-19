import { usePathname } from 'next/navigation';
import { GrantedPageRouteConfigProps } from './router.types';

export function compareUrlPath(url1: string, url2: string) {
  const u1 = new URL(url1, window.location.origin);
  const u2 = new URL(url2, window.location.origin);

  const normalize = (path: string) => path.replace(/\/+$/, '').toLowerCase();

  return normalize(u1.pathname) === normalize(u2.pathname);
}

type MatchOptions = {
  path: string | RegExp;
  end?: boolean;
};

export function useMatch(options: MatchOptions) {
  const { end = false } = options;
  const pathname = usePathname();

  if (!pathname) return false;

  if (options.path instanceof RegExp) {
    return options.path.test(pathname);
  }

  if (end) {
    return pathname === options.path;
  }

  if (options.path === '/') {
    return pathname === '/';
  }

  return pathname === options.path || pathname.startsWith(options.path + '/');
}

export function findGrantedPageRouteConfigByPath(
  grantedPageRouteConfigs: GrantedPageRouteConfigProps[],
  path: string,
): GrantedPageRouteConfigProps | undefined {
  for (const p of grantedPageRouteConfigs) {
    if (compareUrlPath(p.path, path)) {
      return p;
    }

    if (p.children && p.children.length > 0) {
      const found = findGrantedPageRouteConfigByPath(p.children, path);
      if (found) return found;
    }
  }
  return undefined;
}
