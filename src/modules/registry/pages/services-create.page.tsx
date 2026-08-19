'use client';

import ServiceCRUD from '../components/service-crud';
import PageContent from '@/core/layout/page-content';

export default function ServicesCreatePage() {
  return (
    <PageContent>
      <ServiceCRUD defaultMode="CREATE" />
    </PageContent>
  );
}
