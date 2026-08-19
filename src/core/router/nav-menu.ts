import { GrantedPageRouteConfigProps, NavMenuItemProps } from './router.types';

export function generateNavMenuFromGrantedPageRouteConfig(
  configs: GrantedPageRouteConfigProps[],
): NavMenuItemProps[] {
  const list =
    configs?.[0]?.key === 'root' ? configs[0].children || [] : configs;

  return list
    .filter(c => c.navMenu?.enable && c.missingRequiredAccess === 'NONE')
    .map(
      ({ key, title, icon, path, navMenu, children }) =>
        ({
          key,
          title,
          icon,
          action: path,
          groupLabel: navMenu?.groupLabel,
          items: generateNavMenuFromGrantedPageRouteConfig(children || []),
        }) as NavMenuItemProps,
    );
}
