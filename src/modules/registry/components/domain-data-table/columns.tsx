import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Domain } from '../../types/domain';
import { constGet } from '@/core/constants';
import { gT } from '@/core/i18n';
import { TranslationsKey } from '@/core/i18n/types';
import { AppLink } from '@/core/router/next';
import { CONST_DOMAIN_STATUS } from '@/modules/registry/constants/domain';
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

const columnHelper = getColumnHelper<Domain>();

const columns = [
  createRowNumberColumn<Domain>(),

  columnHelper.accessor('domainCode', {
    header: 'registry.domain.fields.domainCode' satisfies TranslationsKey,
    meta: { sticky: 'left' },
    cell: ({ row }) => (
      <AppLink
        href={routePaths.domainDetail}
        relative
        params={{ id: row.original.id }}
        className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
      >
        {row.original.domainCode}
      </AppLink>
    ),
  }),

  columnHelper.accessor('name', {
    header: 'registry.domain.fields.name' satisfies TranslationsKey,
  }),

  columnHelper.accessor('service.serviceCode', {
    id: 'serviceId',
    header: 'registry.domain.fields.serviceId' satisfies TranslationsKey,
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

  createStatusColumn<Domain>({
    accessor: 'status',
    header: 'registry.domain.fields.status' satisfies TranslationsKey,
    status: row =>
      gT(
        constGet(
          CONST_DOMAIN_STATUS,
          row.original.status,
          'label',
        ) as TranslationsKey,
      ),
    statusClassName: row =>
      constGet(CONST_DOMAIN_STATUS, row.original.status, 'className'),
  }),

  createDateColumn<Domain>({
    accessor: 'createdOnUtc',
    header: 'registry.domain.fields.createdOnUtc' satisfies TranslationsKey,
  }),

  createActionsColumn<Domain>((row, table) => {
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
