'use client';

import { EmployeeDataTable } from '../components/employee-data-table';
import PageContent from '@/core/layout/page-content';

export default function EmployeesPage() {
  return (
    <PageContent>
      <EmployeeDataTable />
    </PageContent>
  );
}
