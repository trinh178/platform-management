'use client';

import { useMemo } from 'react';
import type { EmployeeUserId } from './employee-user.utils';
import { useEmployeePreviewsByUserIds } from './employee.queries';
import type { AuditFields } from '@/shared/types/audit';

export type EmployeeAuditUserInfo = {
  fullName: string;
  avatar?: string;
};

type AuditSource = AuditFields | readonly AuditFields[] | null | undefined;

export function useEmployeeAuditUserInfo(source: AuditSource) {
  const userIds = useMemo<EmployeeUserId[]>(() => {
    const records = Array.isArray(source) ? source : source ? [source] : [];
    return records.flatMap(record => [record.createdBy, record.modifiedBy]);
  }, [source]);

  const users = useEmployeePreviewsByUserIds(userIds);

  return useMemo(() => {
    const userInfoById = new Map<string, EmployeeAuditUserInfo>();
    for (const employee of users.data ?? []) {
      if (employee.userId) {
        userInfoById.set(employee.userId, {
          fullName: employee.fullName,
          avatar: employee.avatar,
        });
      }
    }
    return userInfoById;
  }, [users.data]);
}
