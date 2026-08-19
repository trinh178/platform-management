'use client';

import { AppServiceMappingTable } from '../components/app-service-mapping-table';
import PageContent from '@/core/layout/page-content';

export default function AppServiceMappingPage() {
  return (
    <PageContent>
      <AppServiceMappingTable />
    </PageContent>
  );
}
