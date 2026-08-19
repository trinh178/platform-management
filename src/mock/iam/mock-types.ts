import type { RoleType } from '@/modules/foundation/identity/constants/roles';

export interface IamUserMock {
  /** = employee.userId — giữ đồng bộ với HRM-EM và MockUserSwitcher. */
  id: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  firstName: string;
  lastName: string;
  /** Mock-only: dùng để xác thực sign-in. */
  password: string;
  roles: RoleType[];
  lockoutEnabled: boolean;
  lockoutEnd?: string | null;

  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
}
