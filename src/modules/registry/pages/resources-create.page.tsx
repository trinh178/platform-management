'use client';

import ResourceCRUD from '../components/resource-crud';
import PageContent from '@/core/layout/page-content';

export default function ResourcesCreatePage() {
  return (
    <PageContent>
      <ResourceCRUD defaultMode="CREATE" />
    </PageContent>
  );
}
