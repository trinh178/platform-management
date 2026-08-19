import { TranslationsKey } from '@/core/i18n/types';
import { PermissionType } from '@/modules/permissions';

export type RouteKey = string;

export type PermissionsCondition = 'ALL' | 'ANY';

export interface PermissionOptions {
  allowAnyone?: boolean;
  onlyGuest?: boolean;
  permissions?: PermissionType[];
  permissionsCondition?: PermissionsCondition;
  handleUnGuest?: string | React.ReactNode;
  handleUnauthenticated?: string | React.ReactNode;
  handleNoPermission?: string | React.ReactNode;
}

export interface NavMenuOptions {
  enable: boolean;
  groupLabel: TranslationsKey[];
}

export interface PageRouteConfigProps {
  path: string;
  key: RouteKey;
  title: TranslationsKey;
  Component?: React.ComponentType<unknown>;
  icon?: React.ReactNode;
  // hideNavMenu?: boolean; // default is inherit
  disableLayout?: boolean; // default is inherit
  permission?: PermissionOptions; // default is inherit
  children?: PageRouteConfigProps[];
  childrenHandleNotFound?: string | React.ReactNode; // default is inherit
  navMenu?: NavMenuOptions;
}

export type GrantedInheritPageRouteConfig = Pick<
  PageRouteConfigProps,
  'disableLayout' | 'permission' | 'childrenHandleNotFound'
>;

export interface GrantedPageRouteConfigProps extends Omit<
  PageRouteConfigProps,
  'children'
> {
  missingRequiredAccess:
    | 'NONE'
    | 'GUEST'
    | 'AUTHENTICATED_USER'
    | 'AUTHORIZED_USER';
  children?: GrantedPageRouteConfigProps[];
  level: number;
  parent?: Omit<GrantedPageRouteConfigProps, 'children'>;
}

/*
   Navigation menu
*/
export interface NavMenuItemProps {
  key: string;
  title: TranslationsKey;
  icon?: React.ReactNode;
  action: string; // TODO: function
  groupLabel: TranslationsKey[];
  items?: NavMenuItemProps[];
}
