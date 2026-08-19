'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import DomainCRUD from '../components/domain-crud';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import PageContent from '@/core/layout/page-content';
import { useAppRouter } from '@/core/router/next';
import type { CRUDMode } from '@/shared/types/crud';

export default function DomainsDetailsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || undefined;
  const mode = searchParams.get('mode');
  const router = useAppRouter();
  const canUpdate = useHasPermissions('PLM.REGISTRY.DOMAIN.UPDATE');

  // Không có id → quay về list
  React.useEffect(() => {
    if (!id) router.push('/registry/domains');
  }, [id, router]);

  const defaultMode: CRUDMode =
    mode === 'UPDATE' && canUpdate ? 'UPDATE' : 'READ';

  return (
    <PageContent>
      {/* key remount để reset form khi id/mode đổi */}
      <DomainCRUD
        key={`${id}-${defaultMode}`}
        defaultMode={defaultMode}
        id={id}
      />
    </PageContent>
  );
}
