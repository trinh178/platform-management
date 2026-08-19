'use client';

import { useMemo, useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAppServiceMappingUnassign } from '../../services/app-service-mapping.mutation';
import { useAppServiceMappings } from '../../services/app-service-mapping.queries';
import type { AppServiceMapping } from '../../types/app-service-mapping';
import AppServiceMappingAssignDialog from '../app-service-mapping-assign-dialog';
import AppServiceMappingUnassignConfirmContent from '../app-service-mapping-unassign-confirm-content';
import columns from './columns';
import filterFields from './filter-fields';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useAppOptions } from '@/modules/registry/services/app.queries';
import { useServiceOptions } from '@/modules/registry/services/service.queries';
import { DataTableServer } from '@/shared/components/data-table/server';
import { DataTableFilterOptions } from '@/shared/components/data-table/shared/data-table-filter';
import { Button } from '@/shared/components/ui/button';
import { defaultListRequest } from '@/shared/constants/pagination';

export function AppServiceMappingTable() {
  const t = useTranslations();
  const confirm = useConfirm();
  const canAssign = useHasPermissions(
    'PLM.REGISTRY.APP_SERVICE_MAPPING.ASSIGN',
  );
  const canUnassign = useHasPermissions(
    'PLM.REGISTRY.APP_SERVICE_MAPPING.UNASSIGN',
  );

  const [listRequest, setListRequest] = useState(defaultListRequest);
  const mappings = useAppServiceMappings(listRequest, {
    placeholderData: previousData => previousData,
  });

  // Options động cho filter `appId`/`serviceId` — chỉ App/Service đang Active.
  const appOptionsQuery = useAppOptions(undefined);
  const serviceOptionsQuery = useServiceOptions(undefined);
  const filterOptions = useMemo<DataTableFilterOptions>(() => {
    const options: DataTableFilterOptions = {};
    if (appOptionsQuery.data) {
      options.appId = appOptionsQuery.data.map(a => ({
        value: a.id,
        label: `${a.appCode} - ${a.name}`,
      }));
    }
    if (serviceOptionsQuery.data) {
      options.serviceId = serviceOptionsQuery.data.map(s => ({
        value: s.id,
        label: `${s.serviceCode} - ${s.name}`,
      }));
    }
    return options;
  }, [appOptionsQuery.data, serviceOptionsQuery.data]);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  const unassign = useAppServiceMappingUnassign({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const handleUnassign = async (row: Row<AppServiceMapping>) => {
    const mapping = row.original;
    if (!mapping.id || !canUnassign) return;

    const confirmed = await confirm({
      title: t('registry.appServiceMapping.unassignConfirm.title'),
      description: t('registry.appServiceMapping.unassignConfirm.description'),
      content: <AppServiceMappingUnassignConfirmContent mapping={mapping} />,
      variant: 'danger',
      confirmText: t('registry.appServiceMapping.controls.unassign'),
      cancelText: t('common.control.cancel'),
    });

    if (confirmed) unassign.mutate(mapping.id);
  };

  return (
    <>
      <DataTableServer
        columns={columns}
        isFetching={mappings.isFetching}
        error={mappings.error}
        listResponse={mappings.data}
        onChangeListRequest={setListRequest}
        searchPlaceholder={t('registry.appServiceMapping.controls.search')}
        filterFields={filterFields}
        filterOptions={filterOptions}
        enableViewOptions
        actionsRender={() =>
          canAssign && (
            <Button size="sm" onClick={() => setAssignDialogOpen(true)}>
              <Plus />
              <span className="hidden lg:inline">
                {t('registry.appServiceMapping.controls.assign')}
              </span>
            </Button>
          )
        }
        meta={{
          onDelete: canUnassign ? handleUnassign : undefined,
        }}
      />

      <AppServiceMappingAssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />
    </>
  );
}
