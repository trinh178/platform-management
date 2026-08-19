'use client';

import { useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useServiceDelete } from '../../services/service.mutation';
import { useServices } from '../../services/service.queries';
import type { Service } from '../../types/service';
import ServiceDeleteConfirmContent from '../service-delete-confirm-content';
import Actions from './actions';
import columns from './columns';
import filterFields from './filter-fields';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useAppRouter } from '@/core/router/next';
import routePaths from '@/modules/registry/route-paths';
import { DataTableServer } from '@/shared/components/data-table/server';
import { defaultListRequest } from '@/shared/constants/pagination';

export function ServiceDataTable() {
  const t = useTranslations();
  const router = useAppRouter();
  const confirm = useConfirm();
  const canUpdate = useHasPermissions('PLM.REGISTRY.SERVICE.UPDATE');
  const canDelete = useHasPermissions('PLM.REGISTRY.SERVICE.DELETE');

  const [listRequest, setListRequest] = useState(defaultListRequest);

  const services = useServices(listRequest, {
    placeholderData: previousData => previousData,
  });

  const deleteMutation = useServiceDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const handleView = (row: Row<Service>) => {
    router.push(routePaths.servicesDetails, {
      params: { id: row.original.id, mode: 'READ' },
    });
  };

  const handleEdit = (row: Row<Service>) => {
    router.push(routePaths.servicesDetails, {
      params: { id: row.original.id, mode: 'UPDATE' },
    });
  };

  const handleDelete = async (row: Row<Service>) => {
    const service = row.original;

    if (!service.id || !canDelete) return;

    const confirmed = await confirm({
      title: t('registry.service.deleteConfirm.title'),
      description: t('registry.service.deleteConfirm.description'),
      content: <ServiceDeleteConfirmContent service={service} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });

    if (confirmed) {
      deleteMutation.mutate(service.id);
    }
  };

  return (
    <DataTableServer
      columns={columns}
      isFetching={services.isFetching}
      error={services.error}
      listResponse={services.data}
      onChangeListRequest={listRequest => setListRequest(listRequest)}
      searchPlaceholder={t('registry.service.controls.search')}
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
