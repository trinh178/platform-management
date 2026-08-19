import employeePermissions from './employee/permissions';
import registryPermissions from './registry/permissions';

export const PERMISSIONS = {
  ...employeePermissions,
  ...registryPermissions,
} as const;

export default PERMISSIONS;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
