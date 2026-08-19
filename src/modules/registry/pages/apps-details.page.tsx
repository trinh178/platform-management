'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import AppCRUD from '../components/app-crud';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import PageContent from '@/core/layout/page-content';
import { useAppRouter } from '@/core/router/next';
import type { CRUDMode } from '@/shared/types/crud';

export default function AppsDetailsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || undefined;
  const mode = searchParams.get('mode');
  const router = useAppRouter();
  const canUpdate = useHasPermissions('PLM.REGISTRY.APP.UPDATE');

  // Không có id → quay về list
  React.useEffect(() => {
    if (!id) router.push('/registry/apps');
  }, [id, router]);

  const defaultMode: CRUDMode =
    mode === 'UPDATE' && canUpdate ? 'UPDATE' : 'READ';

  return (
    <PageContent>
      {/* key remount để reset form khi id/mode đổi */}
      <AppCRUD key={`${id}-${defaultMode}`} defaultMode={defaultMode} id={id} />
    </PageContent>
  );
}
