/**
 * User id mock — nguồn duy nhất. `user.id === employee.userId` (xem IAM userStore),
 * dùng cho cả employee.userId lẫn audit createdBy/modifiedBy của mọi mock data.
 */
export const MOCK_USER_ID = {
  EMP_001: 'f7f65cf6-7dc4-4ff4-8b4c-6ddd2046d736',
  EMP_002: 'a9b8c7d6-0002-4e00-9f00-000000000002',
  EMP_003: 'a9b8c7d6-0003-4e00-9f00-000000000003',
  EMP_004: 'a9b8c7d6-0004-4e00-9f00-000000000004',
  EMP_005: 'a9b8c7d6-0005-4e00-9f00-000000000005',
  EMP_006: 'a9b8c7d6-0006-4e00-9f00-000000000006',
  EMP_007: 'a9b8c7d6-0007-4e00-9f00-000000000007',
} as const;

export const CURRENT_USER_ID = MOCK_USER_ID.EMP_001;
export const CURRENT_EMPLOYEE_ID = 'fbed7e14-dc85-4ac6-9a2b-db4cc349d771';
