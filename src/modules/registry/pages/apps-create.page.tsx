'use client';

import AppCRUD from '../components/app-crud';
import PageContent from '@/core/layout/page-content';

export default function AppsCreatePage() {
  return (
    <PageContent>
      <AppCRUD defaultMode="CREATE" />
    </PageContent>
  );
}
