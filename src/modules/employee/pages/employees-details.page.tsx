'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import EmployeeCRUD from '../components/employee-crud';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import PageContent from '@/core/layout/page-content';
import { useAppRouter } from '@/core/router/next';
import type { CRUDMode } from '@/shared/types/crud';

export default function EmployeesDetailsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || undefined;
  const mode = searchParams.get('mode');
  const canUpdate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE');

  const router = useAppRouter();

  React.useEffect(() => {
    if (!id) router.push('/employees');
  }, [id, router]);

  const defaultMode: CRUDMode =
    mode === 'UPDATE' && canUpdate ? 'UPDATE' : 'READ';

  return (
    <PageContent>
      <EmployeeCRUD
        key={`${id}-${defaultMode}`}
        defaultMode={defaultMode}
        id={id}
      />
    </PageContent>
  );
}
