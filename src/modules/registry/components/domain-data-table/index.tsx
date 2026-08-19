'use client';

import { useMemo, useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useDomainDelete } from '../../services/domain.mutation';
import { useDomains } from '../../services/domain.queries';
import type { Domain } from '../../types/domain';
import DomainDeleteConfirmContent from '../domain-delete-confirm-content';
import Actions from './actions';
import columns from './columns';
import filterFields from './filter-fields';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useAppRouter } from '@/core/router/next';
import routePaths from '@/modules/registry/route-paths';
import { useServiceOptions } from '@/modules/registry/services/service.queries';
import { DataTableServer } from '@/shared/components/data-table/server';
import { DataTableFilterOptions } from '@/shared/components/data-table/shared/data-table-filter';
import { defaultListRequest } from '@/shared/constants/pagination';

export function DomainDataTable() {
  const t = useTranslations();
  const router = useAppRouter();
  const confirm = useConfirm();
  const canUpdate = useHasPermissions('PLM.REGISTRY.DOMAIN.UPDATE');
  const canDelete = useHasPermissions('PLM.REGISTRY.DOMAIN.DELETE');

  const [listRequest, setListRequest] = useState(defaultListRequest);

  const domains = useDomains(listRequest, {
    placeholderData: previousData => previousData,
  });

  // Options động cho filter `serviceId` — chỉ Service đang Active.
  const serviceOptionsQuery = useServiceOptions(undefined);
  const filterOptions = useMemo<DataTableFilterOptions>(() => {
    const data = serviceOptionsQuery.data;
    const options: DataTableFilterOptions = {};
    if (!data) return options;
    options.serviceId = data.map(s => ({
      value: s.id,
      label: `${s.serviceCode} - ${s.name}`,
    }));
    return options;
  }, [serviceOptionsQuery.data]);

  const deleteMutation = useDomainDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const handleView = (row: Row<Domain>) => {
    router.push(routePaths.domainsDetails, {
      params: { id: row.original.id, mode: 'READ' },
    });
  };

  const handleEdit = (row: Row<Domain>) => {
    router.push(routePaths.domainsDetails, {
      params: { id: row.original.id, mode: 'UPDATE' },
    });
  };

  const handleDelete = async (row: Row<Domain>) => {
    const domain = row.original;

    if (!domain.id || !canDelete) return;

    const confirmed = await confirm({
      title: t('registry.domain.deleteConfirm.title'),
      description: t('registry.domain.deleteConfirm.description'),
      content: <DomainDeleteConfirmContent domain={domain} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });

    if (confirmed) {
      deleteMutation.mutate(domain.id);
    }
  };

  return (
    <DataTableServer
      columns={columns}
      isFetching={domains.isFetching}
      error={domains.error}
      listResponse={domains.data}
      onChangeListRequest={listRequest => setListRequest(listRequest)}
      searchPlaceholder={t('registry.domain.controls.search')}
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
