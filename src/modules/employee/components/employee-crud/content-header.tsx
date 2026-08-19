'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import EmployeeDeleteConfirmContent from '../employee-delete-confirm-content';
import { useEmployeeCRUDContext } from './context';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import PageContentHeader from '@/core/layout/page-content-header';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { EmptyAvatar } from '@/shared/components/ui/empty-avatar';
import { cn } from '@/shared/lib/utils';

export default function ContentHeader() {
  const t = useTranslations();
  const confirm = useConfirm();
  const { data, mode, createLoading, deleteLoading, remove } =
    useEmployeeCRUDContext();
  const canDelete = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.DELETE');

  const handleDelete = async () => {
    if (!data?.id || !canDelete) return;

    const confirmed = await confirm({
      title: t('employee.deleteConfirm.title'),
      description: t('employee.deleteConfirm.description'),
      content: <EmployeeDeleteConfirmContent employee={data} />,
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
          t('employee.page.create')
        ) : (
          <div className="flex gap-2 normal-case">
            <Avatar>
              <AvatarImage
                src={data?.avatar}
                alt={data?.fullName}
                className="rounded-full"
              />
              <AvatarFallback>
                <EmptyAvatar />
              </AvatarFallback>
            </Avatar>

            <div className="flex justify-center items-center gap-2">
              <div className="font-bold text-lg text-nowrap">
                {data?.fullName}
              </div>
              <div className="text-muted-foreground">{data?.employeeCode}</div>
            </div>
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
