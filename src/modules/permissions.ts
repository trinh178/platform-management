import employeePermissions from './employee/permissions';

export const PERMISSIONS = {
  ...employeePermissions,
} as const;

export default PERMISSIONS;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
