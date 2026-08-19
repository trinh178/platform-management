'use client';

import { useMemo, useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useResourceDelete } from '../../services/resource.mutation';
import { useResources } from '../../services/resource.queries';
import type { Resource } from '../../types/resource';
import ResourceDeleteConfirmContent from '../resource-delete-confirm-content';
import Actions from './actions';
import columns from './columns';
import filterFields from './filter-fields';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useAppRouter } from '@/core/router/next';
import routePaths from '@/modules/registry/route-paths';
import { useDomainOptions } from '@/modules/registry/services/domain.queries';
import { DataTableServer } from '@/shared/components/data-table/server';
import { DataTableFilterOptions } from '@/shared/components/data-table/shared/data-table-filter';
import { defaultListRequest } from '@/shared/constants/pagination';

export function ResourceDataTable() {
  const t = useTranslations();
  const router = useAppRouter();
  const confirm = useConfirm();
  const canUpdate = useHasPermissions('PLM.REGISTRY.RESOURCE.UPDATE');
  const canDelete = useHasPermissions('PLM.REGISTRY.RESOURCE.DELETE');

  const [listRequest, setListRequest] = useState(defaultListRequest);

  const resources = useResources(listRequest, {
    placeholderData: previousData => previousData,
  });

  // Options động cho filter `domainId` — chỉ Domain đang Active.
  const domainOptionsQuery = useDomainOptions(undefined);
  const filterOptions = useMemo<DataTableFilterOptions>(() => {
    const data = domainOptionsQuery.data;
    const options: DataTableFilterOptions = {};
    if (!data) return options;
    options.domainId = data.map(d => ({
      value: d.id,
      label: `${d.domainCode} - ${d.name}`,
    }));
    return options;
  }, [domainOptionsQuery.data]);

  const deleteMutation = useResourceDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const handleView = (row: Row<Resource>) => {
    router.push(routePaths.resourcesDetails, {
      params: { id: row.original.id, mode: 'READ' },
    });
  };

  const handleEdit = (row: Row<Resource>) => {
    router.push(routePaths.resourcesDetails, {
      params: { id: row.original.id, mode: 'UPDATE' },
    });
  };

  const handleDelete = async (row: Row<Resource>) => {
    const resource = row.original;

    if (!resource.id || !canDelete) return;

    const confirmed = await confirm({
      title: t('registry.resource.deleteConfirm.title'),
      description: t('registry.resource.deleteConfirm.description'),
      content: <ResourceDeleteConfirmContent resource={resource} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });

    if (confirmed) {
      deleteMutation.mutate(resource.id);
    }
  };

  return (
    <DataTableServer
      columns={columns}
      isFetching={resources.isFetching}
      error={resources.error}
      listResponse={resources.data}
      onChangeListRequest={listRequest => setListRequest(listRequest)}
      searchPlaceholder={t('registry.resource.controls.search')}
      filterFields={filterFields}
      filterOptions={filterOptions}
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
