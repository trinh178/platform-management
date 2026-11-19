import { CellContext } from '@tanstack/react-table';
import { ArrowLeftRight, Link2Off } from 'lucide-react';
import type { AppServiceMapping } from '../../types/app-service-mapping';
import { constGet } from '@/core/constants';
import { gT } from '@/core/i18n';
import { TranslationsKey } from '@/core/i18n/types';
import { AppLink } from '@/core/router/next';
import { CONST_APP_SERVICE_ROLE } from '@/modules/registry/constants/app-service-mapping';
import routePaths from '@/modules/registry/route-paths';
import {
  createDateColumn,
  createRowNumberColumn,
  createStatusColumn,
  getColumnHelper,
} from '@/shared/components/data-table/shared/column-utils';
import { Button } from '@/shared/components/ui/button';

const columnHelper = getColumnHelper<AppServiceMapping>();

const columns = [
  createRowNumberColumn<AppServiceMapping>(),

  columnHelper.accessor('app.appCode', {
    id: 'appId',
    header: 'registry.appServiceMapping.fields.appId' satisfies TranslationsKey,
    meta: { sticky: 'left' },
    cell: ({ row }) =>
      row.original.app ? (
        <AppLink
          href={routePaths.appsDetails}
          params={{ id: row.original.appId }}
          className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
        >
          {row.original.app.appCode}
        </AppLink>
      ) : (
        '-'
      ),
  }),

  columnHelper.accessor('service.serviceCode', {
    id: 'serviceId',
    header:
      'registry.appServiceMapping.fields.serviceId' satisfies TranslationsKey,
    cell: ({ row }) =>
      row.original.service ? (
        <AppLink
          href={routePaths.serviceStructure}
          params={{ id: row.original.serviceId }}
          className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
        >
          {row.original.service.serviceCode}
        </AppLink>
      ) : (
        '-'
      ),
  }),

  createStatusColumn<AppServiceMapping>({
    accessor: 'role',
    header: 'registry.appServiceMapping.fields.role' satisfies TranslationsKey,
    status: row =>
      gT(
        constGet(
          CONST_APP_SERVICE_ROLE,
          row.original.role,
          'label',
        ) as TranslationsKey,
      ),
    statusClassName: row =>
      constGet(CONST_APP_SERVICE_ROLE, row.original.role, 'className'),
  }),

  createDateColumn<AppServiceMapping>({
    accessor: 'createdOnUtc',
    header:
      'registry.appServiceMapping.fields.createdOnUtc' satisfies TranslationsKey,
  }),

  columnHelper.display({
    id: 'actions',
    enableSorting: false,
    meta: { align: 'center', sticky: 'right', headerClassName: 'w-24' },
    cell: ActionCell,
  }),
];

export default columns;

function ActionCell({ row, table }: CellContext<AppServiceMapping, unknown>) {
  const meta = table.options.meta;

  if (!meta?.onEdit && !meta?.onDelete) return null;

  return (
    <div className="flex justify-center gap-1">
      {meta.onEdit && (
        <Button
          size="icon-sm"
          type="button"
          variant="ghost"
          title={gT(
            'registry.appServiceMapping.controls.changeRole' as TranslationsKey,
          )}
          onClick={() => meta.onEdit?.(row)}
        >
          <ArrowLeftRight />
        </Button>
      )}
      {meta.onDelete && (
        <Button
          size="icon-sm"
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          title={gT(
            'registry.appServiceMapping.controls.unassign' as TranslationsKey,
          )}
          onClick={() => meta.onDelete?.(row)}
        >
          <Link2Off />
        </Button>
      )}
    </div>
  );
}
