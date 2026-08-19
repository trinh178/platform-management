import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { App } from '../../types/app';
import { constGet } from '@/core/constants';
import { gT } from '@/core/i18n';
import { TranslationsKey } from '@/core/i18n/types';
import { AppLink } from '@/core/router/next';
import { CONST_APP_STATUS } from '@/modules/registry/constants/app';
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

const columnHelper = getColumnHelper<App>();

const columns = [
  createRowNumberColumn<App>(),

  columnHelper.accessor('appCode', {
    header: 'registry.app.fields.appCode' satisfies TranslationsKey,
    meta: { sticky: 'left' },
    cell: ({ row }) => (
      <AppLink
        href={routePaths.details}
        relative
        params={{ id: row.original.id }}
        className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
      >
        {row.original.appCode}
      </AppLink>
    ),
  }),

  columnHelper.accessor('name', {
    header: 'registry.app.fields.name' satisfies TranslationsKey,
  }),

  columnHelper.accessor('version', {
    header: 'registry.app.fields.version' satisfies TranslationsKey,
  }),

  createStatusColumn<App>({
    accessor: 'status',
    header: 'registry.app.fields.status' satisfies TranslationsKey,
    status: row =>
      gT(
        constGet(
          CONST_APP_STATUS,
          row.original.status,
          'label',
        ) as TranslationsKey,
      ),
    statusClassName: row =>
      constGet(CONST_APP_STATUS, row.original.status, 'className'),
  }),

  createDateColumn<App>({
    accessor: 'createdOnUtc',
    header: 'registry.app.fields.createdOnUtc' satisfies TranslationsKey,
  }),

  createActionsColumn<App>((row, table) => {
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
