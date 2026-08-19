import React from 'react';
import { IconDotsVertical } from '@tabler/icons-react';
import {
  ColumnHelper,
  ColumnMeta,
  Row,
  Table,
  createColumnHelper,
} from '@tanstack/react-table';
import { CircleCheck, CircleX } from 'lucide-react';
import { TranslationsKey, TranslationsKeyOrString } from '@/core/i18n/types';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { EmptyAvatar } from '@/shared/components/ui/empty-avatar';
import { defaultFormatDateTime } from '@/shared/constants/date';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils';

/**
 * Returns a typed ColumnHelper that auto-sets `meta.isCustomCell = true`
 * whenever a `cell` renderer is provided — so DataTableTable knows to call
 * flexRender instead of the default renderValue path.
 *
 * A fresh helper is created per call to avoid singleton-mutation bugs.
 */
export function getColumnHelper<T>(): ColumnHelper<T> {
  const helper = createColumnHelper<T>();

  const origAccessor = helper.accessor.bind(helper);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (helper as any).accessor = (accessor: any, column: any) =>
    origAccessor(accessor, {
      ...column,
      meta: { isCustomCell: !!column?.cell, ...column?.meta },
    });

  const origDisplay = helper.display.bind(helper);
  helper.display = column =>
    origDisplay({
      ...column,
      meta: { isCustomCell: !!column.cell, ...column?.meta },
    });

  const origGroup = helper.group.bind(helper);
  helper.group = column =>
    origGroup({
      ...column,
      meta: { isCustomCell: !!column.cell, ...column?.meta },
    });

  return helper;
}

// ─── Prebuilt column factories ────────────────────────────────────────────────

export function createSelectColumn<T>() {
  return getColumnHelper<T>().display({
    id: 'select',
    enableSorting: false,
    meta: { align: 'center', sticky: 'left' },
    header: ({ table }) =>
      table.options.enableMultiRowSelection !== false ? (
        <Checkbox
          aria-label="Select all rows"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        />
      ) : null,
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={value => row.toggleSelected(!!value)}
      />
    ),
  });
}

export function createRowNumberColumn<T>() {
  return getColumnHelper<T>().display({
    id: 'rowNumber',
    header: 'common.label.no' satisfies TranslationsKey,
    enableSorting: false,
    enableHiding: false,
    meta: {
      align: 'center',
      sticky: 'left',
      headerClassName: 'w-16',
      className: 'text-muted-foreground tabular-nums',
    },
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  });
}

export function createStatusColumn<T>({
  accessor,
  header,
  status,
  statusClassName,
  ...props
}: {
  accessor: Parameters<ColumnHelper<T>['accessor']>[0];
  header: TranslationsKeyOrString;
  status: (row: Row<T>) => string | undefined;
  statusClassName?: (row: Row<T>) => string | undefined;
} & Omit<Parameters<ColumnHelper<T>['accessor']>[1], 'accessor' | 'header'>) {
  return getColumnHelper<T>().accessor(accessor, {
    ...props,
    header,
    cell: ({ row, getValue }) =>
      getValue() != null ? (
        <Badge
          variant="outline"
          className={cn('text-muted-foreground px-2', statusClassName?.(row))}
        >
          {status(row)}
        </Badge>
      ) : (
        '-'
      ),
  });
}

/**
 * A trigger-only actions column. Pass `render` to supply the dropdown items;
 * omit it to render an empty menu (useful as a placeholder during development).
 */
export function createActionsColumn<T>(
  render?: (row: Row<T>, table: Table<T>) => React.ReactNode,
) {
  return getColumnHelper<T>().display({
    id: 'actions',
    enableSorting: false,
    meta: { align: 'center', sticky: 'right' },
    cell: ({ row, table }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {render?.(row, table)}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  });
}

export function createTickColumn<T>({
  accessor,
  header,
  getTicked,
  meta,
  ...props
}: {
  accessor: Parameters<ColumnHelper<T>['accessor']>[0];
  header: TranslationsKeyOrString;
  getTicked?: (row: Row<T>) => boolean;
  meta?: ColumnMeta<T, unknown>;
} & Omit<
  Parameters<ColumnHelper<T>['accessor']>[1],
  'accessor' | 'header' | 'meta'
>) {
  return getColumnHelper<T>().accessor(accessor, {
    ...props,
    header,
    meta: { align: 'center', ...meta },
    cell: ({ row, getValue }) => {
      const ticked = getTicked ? getTicked(row) : !!getValue();
      return (
        <div className="flex justify-center">
          {ticked ? (
            <CircleCheck size={16} className="text-green-600" />
          ) : (
            <CircleX size={16} className="text-destructive" />
          )}
        </div>
      );
    },
  });
}

/**
 * Cột audit dạng user (createdBy/modifiedBy): giá trị là userId, hiển thị
 * avatar + tên resolve qua `table.options.meta.userInfoById` (consumer build map
 * từ API by-users). Fallback `userId` khi chưa resolve, `'-'` khi rỗng.
 */
export function createUserColumn<T>({
  accessor,
  header,
  ...props
}: {
  accessor: Parameters<ColumnHelper<T>['accessor']>[0];
  header: TranslationsKeyOrString;
} & Omit<Parameters<ColumnHelper<T>['accessor']>[1], 'accessor' | 'header'>) {
  return getColumnHelper<T>().accessor(accessor, {
    ...props,
    header,
    cell: ({ getValue, table }) => {
      const userId = getValue() as string | null | undefined;
      if (!userId) return '-';
      const info = table.options.meta?.userInfoById?.get(userId);
      if (!info) return userId;
      return (
        <div className="flex flex-row items-center gap-2">
          <Avatar>
            <AvatarImage src={info.avatar} alt={info.fullName} />
            <AvatarFallback>
              <EmptyAvatar />
            </AvatarFallback>
          </Avatar>
          <span>{info.fullName}</span>
        </div>
      );
    },
  });
}

export function createDateColumn<T>({
  accessor,
  header,
  ...props
}: {
  accessor: Parameters<ColumnHelper<T>['accessor']>[0];
  header: TranslationsKeyOrString;
} & Omit<Parameters<ColumnHelper<T>['accessor']>[1], 'accessor' | 'header'>) {
  return getColumnHelper<T>().accessor(accessor, {
    ...props,
    header,
    cell: ({ getValue }) => {
      const value = getValue();
      return value != null ? formatDate(value as Date) : '-';
    },
  });
}

export function createDateTimeColumn<T>({
  accessor,
  header,
  ...props
}: {
  accessor: Parameters<ColumnHelper<T>['accessor']>[0];
  header: TranslationsKeyOrString;
} & Omit<Parameters<ColumnHelper<T>['accessor']>[1], 'accessor' | 'header'>) {
  return getColumnHelper<T>().accessor(accessor, {
    ...props,
    header,
    cell: ({ getValue }) => {
      const value = getValue();
      return value != null
        ? formatDate(value as Date, defaultFormatDateTime)
        : '-';
    },
  });
}
