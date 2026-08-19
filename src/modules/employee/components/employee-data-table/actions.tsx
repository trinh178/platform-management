'use client';

import { IconPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import routePaths from '../../route-paths';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { AppLink } from '@/core/router/next';
import { Button } from '@/shared/components/ui/button';

export default function Actions() {
  const t = useTranslations();
  const canCreate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.CREATE');

  if (!canCreate) return null;

  return (
    <AppLink href={routePaths.create} relative>
      <Button size="sm">
        <IconPlus />
        <span className="hidden lg:inline">{t('common.control.create')}</span>
      </Button>
    </AppLink>
  );
}
