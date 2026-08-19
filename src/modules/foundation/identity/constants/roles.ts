export const ROLES = {
  ADMIN: 'ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  HR_STAFF: 'HR_STAFF',
  LINE_MANAGER: 'LINE_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];
