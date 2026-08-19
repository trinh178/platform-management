import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Service } from '../../types/service';
import { constGet } from '@/core/constants';
import { gT } from '@/core/i18n';
import { TranslationsKey } from '@/core/i18n/types';
import { AppLink } from '@/core/router/next';
import { CONST_SERVICE_STATUS } from '@/modules/registry/constants/service';
import routePaths from '@/modules/registry/route-paths';
import {
  createActionsColumn,
  createDateColumn,
  createRowNumberColumn,
  createStatusColumn,
  getColumnHelper,
} from '@/shared/components/data-table/shared/column-utils';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';

const columnHelper = getColumnHelper<Service>();

const columns = [
  createRowNumberColumn<Service>(),

  columnHelper.accessor('serviceCode', {
    header: 'registry.service.fields.serviceCode' satisfies TranslationsKey,
    meta: { sticky: 'left' },
    cell: ({ row }) => (
      <AppLink
        href={routePaths.serviceDetail}
        relative
        params={{ id: row.original.id }}
        className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
      >
        {row.original.serviceCode}
      </AppLink>
    ),
  }),

  columnHelper.accessor('name', {
    header: 'registry.service.fields.name' satisfies TranslationsKey,
  }),

  columnHelper.accessor('version', {
    header: 'registry.service.fields.version' satisfies TranslationsKey,
  }),

  createStatusColumn<Service>({
    accessor: 'status',
    header: 'registry.service.fields.status' satisfies TranslationsKey,
    status: row =>
      gT(
        constGet(
          CONST_SERVICE_STATUS,
          row.original.status,
          'label',
        ) as TranslationsKey,
      ),
    statusClassName: row =>
      constGet(CONST_SERVICE_STATUS, row.original.status, 'className'),
  }),

  createDateColumn<Service>({
    accessor: 'createdOnUtc',
    header: 'registry.service.fields.createdOnUtc' satisfies TranslationsKey,
  }),

  createActionsColumn<Service>((row, table) => {
    const meta = table.options.meta;
    return (
      <>
        {meta?.onView && (
          <DropdownMenuItem onClick={() => meta.onView?.(row)}>
            <Eye />
            {gT('common.control.view' as TranslationsKey)}
          </DropdownMenuItem>
        )}
        {meta?.onEdit && (
          <DropdownMenuItem onClick={() => meta.onEdit?.(row)}>
            <Pencil />
            {gT('common.control.edit' as TranslationsKey)}
          </DropdownMenuItem>
        )}
        {meta?.onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => meta.onDelete?.(row)}
            >
              <Trash2 />
              {gT('common.control.delete' as TranslationsKey)}
            </DropdownMenuItem>
          </>
        )}
      </>
    );
  }),
];

export default columns;
