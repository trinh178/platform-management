import type { IamUserMock } from './mock-types';
import { CURRENT_USER_ID } from '@/mock/constants';
import { employeeStore } from '@/mock/hrmem/employee';
import type { RoleType } from '@/modules/foundation/identity/constants/roles';

/** Map chức danh employee → role IAM (mock). */
function resolveRole(jobPositionCode: string): RoleType {
  if (jobPositionCode === 'DIRECTOR') return 'ADMIN';
  if (jobPositionCode === 'HR_MANAGER') return 'HR_MANAGER';
  if (jobPositionCode === 'HR_STAFF') return 'HR_STAFF';
  if (jobPositionCode.endsWith('_MANAGER')) return 'LINE_MANAGER';
  return 'EMPLOYEE';
}

/**
 * User store của IAM — quan hệ 1-1 với employee qua `employee.userId`.
 * `user.id === employee.userId` và **khác** `employee.id` (user và employee là 2
 * thực thể riêng). Nhờ đó `GET /users/me` + switch-user (theo employee.userId) +
 * `GET /profiles/me` (tra employee theo userId) luôn nhất quán.
 */
export const userStore: IamUserMock[] = employeeStore
  .filter(e => !!e.userId)
  .map(e => {
    const username = e.employeeCode.toLowerCase();
    return {
      id: e.userId!,
      username,
      email: e.contact?.officeEmail ?? `${username}@hva.example`,
      phoneNumber: e.contact?.personalPhoneNumber ?? null,
      firstName: e.firstName,
      lastName: e.lastName,
      password: 'password',
      roles: [resolveRole(e.jobInfo.jobPositionCode)],
      lockoutEnabled: false,
      lockoutEnd: null,
      createdBy: CURRENT_USER_ID,
      createdOnUtc: e.createdOnUtc,
      modifiedBy: CURRENT_USER_ID,
      modifiedOnUtc: e.modifiedOnUtc,
    };
  });
