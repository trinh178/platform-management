'use client';

import EmployeeCRUD from '../components/employee-crud';
import PageContent from '@/core/layout/page-content';

export default function EmployeesCreatePage() {
  return (
    <PageContent>
      <EmployeeCRUD defaultMode="CREATE" />
    </PageContent>
  );
}
