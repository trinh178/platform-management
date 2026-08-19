'use client';

import { useMemo, useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { useEmployeeAuditUserInfo } from '../../services/employee-audit.queries';
import { useEmployeeDelete } from '../../services/employee.mutation';
import {
  useEmployeeFilterOptions,
  useEmployees,
} from '../../services/employee.queries';
import type { EmployeePreview } from '../../types/employee';
import EmployeeDeleteConfirmContent from '../employee-delete-confirm-content';
import Actions from './actions';
import columns from './columns';
import filterFields from './filter-fields';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useAppRouter } from '@/core/router/next';
import routePaths from '@/modules/employee/route-paths';
import { DataTableServer } from '@/shared/components/data-table/server';
import { DataTableFilterOptions } from '@/shared/components/data-table/shared/data-table-filter';
import { defaultListRequest } from '@/shared/constants/pagination';

export function EmployeeDataTable() {
  const t = useTranslations();
  const router = useAppRouter();
  const confirm = useConfirm();
  const canUpdate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE');
  const canDelete = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.DELETE');

  const [listRequest, setListRequest] = useState(defaultListRequest);

  const employees = useEmployees(listRequest, {
    placeholderData: previousData => previousData,
  });

  // Options động cho filter `select` (đơn vị / chức vụ) — 1 API multi-column.
  const filterOptionsQuery = useEmployeeFilterOptions();
  const filterOptions = useMemo<DataTableFilterOptions>(() => {
    const data = filterOptionsQuery.data;
    const options: DataTableFilterOptions = {};
    if (!data) return options;
    options.organizationUnitCode = data.organizationUnits.map(o => ({
      value: o.code,
      label: o.name,
    }));
    options.jobPositionCode = data.jobPositions.map(p => ({
      value: p.code,
      label: p.name,
    }));
    return options;
  }, [filterOptionsQuery.data]);

  const userInfoById = useEmployeeAuditUserInfo(employees.data?.items);

  const deleteMutation = useEmployeeDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const handleView = (row: Row<EmployeePreview>) => {
    router.push(routePaths.employeesDetails, {
      params: {
        id: row.original.id,
        mode: 'READ',
      },
    });
  };

  const handleEdit = (row: Row<EmployeePreview>) => {
    router.push(routePaths.employeesDetails, {
      params: {
        id: row.original.id,
        mode: 'UPDATE',
      },
    });
  };

  const handleDelete = async (row: Row<EmployeePreview>) => {
    const employee = row.original;

    if (!employee.id || !canDelete) return;

    const confirmed = await confirm({
      title: t('employee.deleteConfirm.title'),
      description: t('employee.deleteConfirm.description'),
      content: <EmployeeDeleteConfirmContent employee={employee} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });

    if (confirmed) {
      deleteMutation.mutate(employee.id);
    }
  };

  return (
    <DataTableServer
      columns={columns}
      isFetching={employees.isFetching}
      error={employees.error}
      listResponse={employees.data}
      onChangeListRequest={listRequest => setListRequest(listRequest)}
      searchPlaceholder={t('employee.controls.search')}
      filterFields={filterFields}
      filterOptions={filterOptions}
      enableViewOptions
      actionsRender={() => <Actions />}
      meta={{
        onView: handleView,
        onEdit: canUpdate ? handleEdit : undefined,
        onDelete: canDelete ? handleDelete : undefined,
        userInfoById,
      }}
    />
  );
}
