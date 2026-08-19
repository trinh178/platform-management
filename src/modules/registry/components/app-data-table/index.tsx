'use client';

import { useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useAppDelete } from '../../services/app.mutation';
import { useApps } from '../../services/app.queries';
import type { App } from '../../types/app';
import AppDeleteConfirmContent from '../app-delete-confirm-content';
import Actions from './actions';
import columns from './columns';
import filterFields from './filter-fields';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useAppRouter } from '@/core/router/next';
import routePaths from '@/modules/registry/route-paths';
import { DataTableServer } from '@/shared/components/data-table/server';
import { defaultListRequest } from '@/shared/constants/pagination';

export function AppDataTable() {
  const t = useTranslations();
  const router = useAppRouter();
  const confirm = useConfirm();
  const canUpdate = useHasPermissions('PLM.REGISTRY.APP.UPDATE');
  const canDelete = useHasPermissions('PLM.REGISTRY.APP.DELETE');

  const [listRequest, setListRequest] = useState(defaultListRequest);

  const apps = useApps(listRequest, {
    placeholderData: previousData => previousData,
  });

  const deleteMutation = useAppDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const handleView = (row: Row<App>) => {
    router.push(routePaths.appsDetails, {
      params: { id: row.original.id, mode: 'READ' },
    });
  };

  const handleEdit = (row: Row<App>) => {
    router.push(routePaths.appsDetails, {
      params: { id: row.original.id, mode: 'UPDATE' },
    });
  };

  const handleDelete = async (row: Row<App>) => {
    const app = row.original;

    if (!app.id || !canDelete) return;

    const confirmed = await confirm({
      title: t('registry.app.deleteConfirm.title'),
      description: t('registry.app.deleteConfirm.description'),
      content: <AppDeleteConfirmContent app={app} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });

    if (confirmed) {
      deleteMutation.mutate(app.id);
    }
  };

  return (
    <DataTableServer
      columns={columns}
      isFetching={apps.isFetching}
      error={apps.error}
      listResponse={apps.data}
      onChangeListRequest={listRequest => setListRequest(listRequest)}
      searchPlaceholder={t('registry.app.controls.search')}
      filterFields={filterFields}
      enableViewOptions
      actionsRender={() => <Actions />}
      meta={{
        onView: handleView,
        onEdit: canUpdate ? handleEdit : undefined,
        onDelete: canDelete ? handleDelete : undefined,
      }}
    />
  );
}
