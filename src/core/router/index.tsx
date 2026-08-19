import path from 'path-browserify';
import rootRoute from './rootRoute';
import {
  GrantedInheritPageRouteConfig,
  GrantedPageRouteConfigProps,
  PageRouteConfigProps,
  PermissionsCondition,
} from './router.types';
import modules from '@/modules';
import { PermissionType } from '@/modules/permissions';

const prcs = modules.map(m => m.route);
const pageRouteConfigs: PageRouteConfigProps[] = [
  {
    ...rootRoute,
    children: prcs.reduce<PageRouteConfigProps[]>(
      (rpc, cpc) => rpc.concat(cpc),
      [],
    ),
  },
];

function isGranted(
  condition: PermissionsCondition,
  userPermissions: PermissionType[],
  routePermission: PermissionType[],
) {
  for (const p of routePermission) {
    if ((!condition || condition === 'ALL') && !userPermissions.includes(p))
      return false;
    else if (condition === 'ANY' && userPermissions.includes(p)) return true;
  }
  return condition !== 'ANY';
}

function grantPageRoutesConfig(
  pageRouteConfig: PageRouteConfigProps,
  isAuthenticated: boolean,
  userPermissions: PermissionType[],
  parentGrantedPageRouteConfig?: GrantedPageRouteConfigProps,
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { permission, children, ...config } = pageRouteConfig;

  const inheritFromParent: GrantedInheritPageRouteConfig = {
    // hideNavMenu: parentGrantedPageRouteConfig?.hideNavMenu,
    disableLayout: parentGrantedPageRouteConfig?.disableLayout,
    permission: parentGrantedPageRouteConfig?.permission,
    childrenHandleNotFound:
      parentGrantedPageRouteConfig?.childrenHandleNotFound,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: parentChildren, ...parentWithoutChildrent } =
    parentGrantedPageRouteConfig || {};

  const grantedPageRouteConfig: GrantedPageRouteConfigProps = {
    ...inheritFromParent,
    ...config,
    permission: {
      ...inheritFromParent?.permission,
      ...permission,
    },
    missingRequiredAccess: 'NONE',
    path: path.join(parentGrantedPageRouteConfig?.path || '', config.path),
    level: parentGrantedPageRouteConfig
      ? parentGrantedPageRouteConfig.level + 1
      : 0,
    parent: parentWithoutChildrent as Omit<
      GrantedPageRouteConfigProps,
      'children'
    >,
  };

  // if (grantedPageRouteConfig.permission === undefined) {
  //   return grantedPageRouteConfig;
  // }

  if (grantedPageRouteConfig.permission!.onlyGuest) {
    if (isAuthenticated) {
      grantedPageRouteConfig.missingRequiredAccess = 'GUEST';
    }
    return grantedPageRouteConfig;
  }

  if (
    !isGranted(
      grantedPageRouteConfig.permission!.permissionsCondition || 'ALL',
      userPermissions,
      grantedPageRouteConfig.permission!.permissions || [],
    )
  ) {
    if (isAuthenticated) {
      grantedPageRouteConfig.missingRequiredAccess = 'AUTHORIZED_USER';
    } else {
      grantedPageRouteConfig.missingRequiredAccess = 'AUTHENTICATED_USER';
    }
    return grantedPageRouteConfig;
  }

  // TODO: case kiểm tra granted ok nhưng chưa authentication, khó xảy ra vì chưa authentication thì permission rỗng nên kiểm tra granted sẽ false

  return grantedPageRouteConfig;
}

function grantPageRoutesConfigs(
  pageRouteConfigs: PageRouteConfigProps[],
  isAuthenticated: boolean,
  userPermissions: PermissionType[],
  parentGrantedPageRouteConfig?: GrantedPageRouteConfigProps,
) {
  const list: GrantedPageRouteConfigProps[] = [];
  for (const pageRouteConfig of pageRouteConfigs) {
    const granted = grantPageRoutesConfig(
      pageRouteConfig,
      isAuthenticated,
      userPermissions,
      parentGrantedPageRouteConfig,
    );
    if (
      pageRouteConfig?.children?.length &&
      pageRouteConfig?.children.length > 0
    ) {
      granted.children = grantPageRoutesConfigs(
        pageRouteConfig.children,
        isAuthenticated,
        userPermissions,
        granted,
      );
    }
    list.push(granted);
  }
  return list;
}

export function getGrantedPageRoutesConfigs(
  isAuthenticated: boolean,
  userPermissions: PermissionType[],
) {
  return grantPageRoutesConfigs(
    pageRouteConfigs,
    isAuthenticated,
    userPermissions,
  );
}
