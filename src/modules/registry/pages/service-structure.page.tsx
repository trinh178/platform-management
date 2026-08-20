'use client';

import { useSearchParams } from 'next/navigation';
import { ServiceStructure } from '../components/service-structure';
import PageContent from '@/core/layout/page-content';

export default function ServiceStructurePage() {
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('id') || undefined;

  return (
    <PageContent fixed>
      <ServiceStructure initialServiceId={initialServiceId} />
    </PageContent>
  );
}
