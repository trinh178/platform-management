'use client';

import { ServiceDataTable } from '../components/service-data-table';
import PageContent from '@/core/layout/page-content';

export default function ServicesPage() {
  return (
    <PageContent>
      <ServiceDataTable />
    </PageContent>
  );
}
