export type EmployeeUserId = string | null | undefined;

export function normalizeEmployeeUserIds(
  userIds: readonly EmployeeUserId[],
): string[] {
  return Array.from(
    new Set(
      userIds.filter(
        (userId): userId is string =>
          !!userId && userId.toLowerCase() !== 'system',
      ),
    ),
  ).sort();
}
