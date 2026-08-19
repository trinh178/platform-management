'use client';

import { DomainDataTable } from '../components/domain-data-table';
import PageContent from '@/core/layout/page-content';

export default function DomainsPage() {
  return (
    <PageContent>
      <DomainDataTable />
    </PageContent>
  );
}
