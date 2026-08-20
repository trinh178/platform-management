import employeePermissions from './employee/permissions';
import registryPermissions from './registry/permissions';
import settingsPermissions from './settings/permissions';

export const PERMISSIONS = {
  ...employeePermissions,
  ...registryPermissions,
  ...settingsPermissions,
} as const;

export default PERMISSIONS;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
