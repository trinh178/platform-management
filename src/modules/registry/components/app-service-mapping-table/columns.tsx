import { CellContext } from '@tanstack/react-table';
import { Link2Off } from 'lucide-react';
import type { AppServiceMapping } from '../../types/app-service-mapping';
import { TranslationsKey } from '@/core/i18n/types';
import { AppLink } from '@/core/router/next';
import routePaths from '@/modules/registry/route-paths';
import {
  createDateColumn,
  createRowNumberColumn,
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
          href={routePaths.servicesDetails}
          params={{ id: row.original.serviceId }}
          className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
        >
          {row.original.service.serviceCode}
        </AppLink>
      ) : (
        '-'
      ),
  }),

  columnHelper.accessor('note', {
    header: 'registry.appServiceMapping.fields.note' satisfies TranslationsKey,
  }),

  createDateColumn<AppServiceMapping>({
    accessor: 'createdOnUtc',
    header:
      'registry.appServiceMapping.fields.createdOnUtc' satisfies TranslationsKey,
  }),

  columnHelper.display({
    id: 'actions',
    enableSorting: false,
    meta: { align: 'center', sticky: 'right', headerClassName: 'w-16' },
    cell: ActionCell,
  }),
];

export default columns;

function ActionCell({ row, table }: CellContext<AppServiceMapping, unknown>) {
  const meta = table.options.meta;

  if (!meta?.onDelete) return null;

  return (
    <div className="flex justify-center">
      <Button
        size="icon-sm"
        type="button"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        onClick={() => meta.onDelete?.(row)}
      >
        <Link2Off />
      </Button>
    </div>
  );
}
