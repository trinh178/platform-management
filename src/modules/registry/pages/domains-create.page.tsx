'use client';

import DomainCRUD from '../components/domain-crud';
import PageContent from '@/core/layout/page-content';

export default function DomainsCreatePage() {
  return (
    <PageContent>
      <DomainCRUD defaultMode="CREATE" />
    </PageContent>
  );
}
