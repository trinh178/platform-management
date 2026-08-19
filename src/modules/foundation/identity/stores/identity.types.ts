import { PermissionType } from '@/modules/permissions';

export interface IdentityState {
  isAuthenticated: boolean;
  userPermissions: PermissionType[];
}

export interface IdentityActions {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUserPermissions: (userPermissions: PermissionType[]) => void;
  resetIdentity: () => void;
}
