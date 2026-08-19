'use client';

import React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  InitialTableState,
  PaginationState,
  SortingState,
  TableMeta,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import DataTableFilter, {
  DataTableFilterField,
  DataTableFilterOptions,
} from '@/shared/components/data-table/shared/data-table-filter';
import DataTableFilterGlobal from '@/shared/components/data-table/shared/data-table-filter-global';
import DataTablePagination from '@/shared/components/data-table/shared/data-table-pagination';
import DataTableTable from '@/shared/components/data-table/shared/data-table-table';
import DataTableViewOptions from '@/shared/components/data-table/shared/data-table-view-options';
import { dataTableFilterFn } from '@/shared/components/data-table/shared/filters/client-filter-fn';
import {
  DataTableRowClickHandler,
  DataTableState,
} from '@/shared/components/data-table/shared/types';
import { defaultListRequest } from '@/shared/constants/pagination';

export type { DataTableState } from '@/shared/components/data-table/shared/types';

function deriveColumnPinning<TData>(
  cols: ColumnDef<TData, unknown>[],
): ColumnPinningState {
  const left: string[] = [];
  const right: string[] = [];
  for (const col of cols) {
    const sticky = col.meta?.sticky;
    if (!sticky) continue;
    const id =
      col.id ?? ('accessorKey' in col ? String(col.accessorKey) : undefined);
    if (!id) continue;
    (sticky === 'left' ? left : right).push(id);
  }
  return { left, right };
}

export type DataTableStaticProps<TData> = {
  data: TData[];
  isFetching?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  meta?: TableMeta<TData>;
  initialState?: InitialTableState;
  searchPlaceholder?: string;
  filterFields?: DataTableFilterField[];
  filterOptions?: DataTableFilterOptions;
  enableViewOptions?: boolean;
  enablePagination?: boolean;
  hiddenToolbar?: boolean;
  /** Same signature as server table — receives table state, returns action nodes. */
  actionsRender?: (state: DataTableState<TData>) => React.ReactNode;
  /** Fire when user clicks a row body (ignores clicks on buttons/links inside cells). */
  onRowClick?: DataTableRowClickHandler<TData>;
  /** Custom node shown when there is no data and not loading. */
  emptyState?: React.ReactNode;
};

export function DataTableStatic<TData>({
  data,
  isFetching,
  columns,
  meta,
  initialState,
  searchPlaceholder,
  filterFields,
  filterOptions,
  enableViewOptions,
  enablePagination,
  hiddenToolbar,
  actionsRender,
  onRowClick,
  emptyState,
}: DataTableStaticProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: defaultListRequest.pageIndex ?? 0,
    pageSize: defaultListRequest.pageSize ?? 10,
  });
  const [columnPinning] = React.useState<ColumnPinningState>(() =>
    deriveColumnPinning(columns),
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data,
    columns,
    defaultColumn: { filterFn: dataTableFilterFn },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(enablePagination
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          onPaginationChange: setPagination,
        }
      : {}),
    state: {
      sorting,
      globalFilter,
      columnFilters,
      columnPinning,
      ...(enablePagination ? { pagination } : {}),
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    meta,
    initialState,
  });

  const hasToolbar =
    !hiddenToolbar &&
    !!(
      searchPlaceholder ||
      filterFields?.length ||
      enableViewOptions ||
      actionsRender
    );

  return (
    <div className="flex-1">
      {hasToolbar && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            {searchPlaceholder && (
              <DataTableFilterGlobal
                table={table}
                isLoading={isFetching}
                searchPlaceholder={searchPlaceholder}
              />
            )}
            <DataTableFilter
              table={table}
              filterFields={filterFields}
              filterOptions={filterOptions}
            />
          </div>
          <div className="flex items-center gap-2">
            {enableViewOptions && <DataTableViewOptions table={table} />}
            {actionsRender?.({ table, isLoading: isFetching })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <DataTableTable
          table={table}
          isLoading={isFetching}
          onRowClick={onRowClick}
          emptyState={emptyState}
        />
      </div>

      {enablePagination && (
        <div className="mt-4">
          <DataTablePagination table={table} isLoading={isFetching} />
        </div>
      )}
    </div>
  );
}
