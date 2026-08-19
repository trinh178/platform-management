'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AppDeleteConfirmContent from '../app-delete-confirm-content';
import { useAppCRUDContext } from './context';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import PageContentHeader from '@/core/layout/page-content-header';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export default function ContentHeader() {
  const t = useTranslations();
  const confirm = useConfirm();
  const { data, mode, createLoading, deleteLoading, remove } =
    useAppCRUDContext();
  const canDelete = useHasPermissions('PLM.REGISTRY.APP.DELETE');

  const handleDelete = async () => {
    if (!data?.id || !canDelete) return;

    const confirmed = await confirm({
      title: t('registry.app.deleteConfirm.title'),
      description: t('registry.app.deleteConfirm.description'),
      content: <AppDeleteConfirmContent app={data} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });

    if (confirmed) {
      remove();
    }
  };

  return (
    <PageContentHeader
      title={
        mode === 'CREATE' ? (
          t('registry.app.page.create')
        ) : (
          <div className="flex items-center gap-2 normal-case">
            <span className="text-lg font-bold">{data?.name}</span>
            <span className="text-muted-foreground">{data?.appCode}</span>
          </div>
        )
      }
      actions={
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            className={cn({
              hidden: mode !== 'CREATE',
            })}
            type="submit"
            loading={createLoading}
            icon={<Plus />}
          >
            {t('common.control.create')}
          </Button>

          {mode !== 'CREATE' && data?.id && canDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              loading={deleteLoading}
              icon={<Trash2 />}
              onClick={handleDelete}
            >
              {t('common.control.delete')}
            </Button>
          )}
        </div>
      }
    />
  );
}
