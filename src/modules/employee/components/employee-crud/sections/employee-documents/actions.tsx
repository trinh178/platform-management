'use client';

import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEmployeeCRUDContext } from '../../context';
import { Button } from '@/shared/components/ui/button';

export default function Actions({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations();
  const { inlineEdit } = useEmployeeCRUDContext();

  if (!inlineEdit) return;

  return (
    <Button
      variant="link"
      size="sm"
      className="text-primary"
      onClick={onCreate}
    >
      <Plus />
      {t('common.control.add')}
    </Button>
  );
}
