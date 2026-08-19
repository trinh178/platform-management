import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Resource } from '../../types/resource';
import { constGet } from '@/core/constants';
import { gT } from '@/core/i18n';
import { TranslationsKey } from '@/core/i18n/types';
import { AppLink } from '@/core/router/next';
import { CONST_RESOURCE_STATUS } from '@/modules/registry/constants/resource';
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

const columnHelper = getColumnHelper<Resource>();

const columns = [
  createRowNumberColumn<Resource>(),

  columnHelper.accessor('resourceCode', {
    header: 'registry.resource.fields.resourceCode' satisfies TranslationsKey,
    meta: { sticky: 'left' },
    cell: ({ row }) => (
      <AppLink
        href={routePaths.resourceDetail}
        relative
        params={{ id: row.original.id }}
        className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
      >
        {row.original.resourceCode}
      </AppLink>
    ),
  }),

  columnHelper.accessor('name', {
    header: 'registry.resource.fields.name' satisfies TranslationsKey,
  }),

  columnHelper.accessor('domain.domainCode', {
    id: 'domainId',
    header: 'registry.resource.fields.domainId' satisfies TranslationsKey,
    cell: ({ row }) =>
      row.original.domain ? (
        <AppLink
          href={routePaths.domainsDetails}
          params={{ id: row.original.domainId }}
          className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
        >
          {row.original.domain.domainCode}
        </AppLink>
      ) : (
        '-'
      ),
  }),

  createStatusColumn<Resource>({
    accessor: 'status',
    header: 'registry.resource.fields.status' satisfies TranslationsKey,
    status: row =>
      gT(
        constGet(
          CONST_RESOURCE_STATUS,
          row.original.status,
          'label',
        ) as TranslationsKey,
      ),
    statusClassName: row =>
      constGet(CONST_RESOURCE_STATUS, row.original.status, 'className'),
  }),

  createDateColumn<Resource>({
    accessor: 'createdOnUtc',
    header: 'registry.resource.fields.createdOnUtc' satisfies TranslationsKey,
  }),

  createActionsColumn<Resource>((row, table) => {
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
