import { useMemo } from 'react';
import { useIdentityStore } from '@/modules/foundation/identity/stores/identity.store';
import { PermissionType } from '@/modules/permissions';

export function useHasPermissions(
  permissions: PermissionType | PermissionType[],
  checkType: 'every' | 'any' = 'every',
) {
  const permissionsArray = Array.isArray(permissions)
    ? permissions
    : [permissions];

  const userPermissions = useIdentityStore(state => state.userPermissions);

  const userPermissionsSet = useMemo(
    () => new Set(userPermissions),
    [userPermissions],
  );

  if (checkType === 'every') {
    return permissionsArray.every(permission =>
      userPermissionsSet.has(permission),
    );
  } else {
    return permissionsArray.some(permission =>
      userPermissionsSet.has(permission),
    );
  }
}
