function extractPathname(pathname: string) {
  try {
    return new URL(pathname, 'http://app.local').pathname;
  } catch {
    return pathname.split(/[?#]/)[0];
  }
}

function normalizePathname(pathname: string) {
  pathname = extractPathname(pathname);
  pathname = pathname.replaceAll('//', '/');
  if (pathname[0] === '/') pathname = pathname.slice(1);
  if (pathname[pathname.length - 1] === '/')
    pathname = pathname.slice(0, pathname.length - 1);
  return pathname;
}
export function comparePathname(pathname1: string, pathname2: string) {
  return normalizePathname(pathname1) === normalizePathname(pathname2);
}
