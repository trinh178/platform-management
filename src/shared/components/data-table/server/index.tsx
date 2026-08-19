'use client';

import React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  InitialTableState,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  TableMeta,
  Table as TanStackTable,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DataTableFilterType } from '../shared/data-table-filter';
import { DataTableFilterGlobalType } from '../shared/data-table-filter-global';
import DataTablePagination from '../shared/data-table-pagination';
import DataTableTable, {
  DataTableTableRenderHelpers,
} from '../shared/data-table-table';
import { DataTableRowClickHandler } from '../shared/types';
import { DataTableActionsType } from './data-table-actions';
import { DataTableToolbar } from './data-table-toolbar';
import {
  transformColumnFiltersForApi,
  transformColumnFiltersFromApi,
  transformSortForApi,
  transformSortFromApi,
} from './filter-utils';
import { defaultListRequest } from '@/shared/constants/pagination';
import { ListRequest, ListResponse } from '@/shared/types/pagination';

export type { DataTableState } from '../shared/types';

export type DataTableServerProps<TData> = {
  listResponse?: ListResponse<TData>;
  isFetching?: boolean;
  /** Render an error banner above the table when set. */
  error?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  onChangeListRequest: (listRequest: ListRequest) => void;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  hiddenToolbar?: boolean;
  meta?: TableMeta<TData>;
  initialState?: InitialTableState;
  initialListRequest?: ListRequest;
  /** Allow selecting multiple rows. Default: false (single-row select). */
  enableMultiRowSelection?: boolean;
  /** How to derive a stable row id. Default: `row.id`, else falls back to row index (warned). */
  getRowId?: (row: TData, index: number) => string;
  /** Fire when user clicks a row body (ignores clicks on buttons/links inside cells). */
  onRowClick?: DataTableRowClickHandler<TData>;
  /** Custom node shown when there is no data and not loading. */
  emptyState?: React.ReactNode;
  /** Optional footer rendered inside the table footer, useful for server summaries/totals. */
  footerRender?: (
    table: TanStackTable<TData>,
    helpers: DataTableTableRenderHelpers<TData>,
  ) => React.ReactNode;
  /** Optional rows rendered at the top of the table body, directly under the header. */
  topRowsRender?: (
    table: TanStackTable<TData>,
    helpers: DataTableTableRenderHelpers<TData>,
  ) => React.ReactNode;
} & DataTableFilterGlobalType &
  DataTableFilterType &
  DataTableActionsType<TData>;

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

const defaultGetRowId = <TData,>(row: TData, index: number): string => {
  const id = (row as { id?: string | number } | undefined)?.id;
  return id != null ? String(id) : String(index);
};

export function DataTableServer<TData>({
  listResponse,
  isFetching,
  error,
  columns,
  onChangeListRequest,
  searchPlaceholder,
  filterFields,
  filterOptions,
  enableViewOptions,
  actionsRender,
  onSelectedRowsChange,
  hiddenToolbar,
  meta,
  initialState,
  initialListRequest,
  enableMultiRowSelection = false,
  getRowId = defaultGetRowId,
  onRowClick,
  emptyState,
  footerRender,
  topRowsRender,
}: DataTableServerProps<TData>) {
  // ─── Local table state (source of truth) ──────────────────────────────────
  // Initialize from listResponse if present (e.g. cached data), else defaults.
  const [pagination, setPagination] = React.useState<PaginationState>(() =>
    listResponse
      ? {
          pageIndex: listResponse.pageIndex,
          pageSize: listResponse.pageSize,
        }
      : initialListRequest
        ? {
            pageIndex:
              initialListRequest.pageIndex ?? defaultListRequest.pageIndex ?? 0,
            pageSize:
              initialListRequest.pageSize ?? defaultListRequest.pageSize ?? 10,
          }
        : {
            pageIndex: defaultListRequest.pageIndex ?? 0,
            pageSize: defaultListRequest.pageSize ?? 10,
          },
  );
  const [globalFilter, setGlobalFilter] = React.useState<string>(
    () => listResponse?.searchTerm ?? initialListRequest?.searchTerm ?? '',
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    () =>
      listResponse?.filters
        ? transformColumnFiltersFromApi(listResponse.filters)
        : initialListRequest?.filters
          ? transformColumnFiltersFromApi(initialListRequest.filters)
          : [],
  );
  const [sorting, setSorting] = React.useState<SortingState>(() =>
    transformSortFromApi(listResponse?.sorts ?? initialListRequest?.sorts),
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnPinning] = React.useState<ColumnPinningState>(() =>
    deriveColumnPinning(columns),
  );

  // ─── Notify parent on state changes (skipping initial mount) ─────────────
  const onChangeListRequestRef = React.useRef(onChangeListRequest);
  onChangeListRequestRef.current = onChangeListRequest;
  const isMountedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    onChangeListRequestRef.current({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      searchTerm: globalFilter || undefined,
      filters: transformColumnFiltersForApi(columnFilters),
      sorts: transformSortForApi(sorting),
    });
  }, [pagination, globalFilter, columnFilters, sorting]);

  // ─── React Table instance ────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<TData>({
    data: listResponse?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
      globalFilter,
      columnFilters,
      sorting,
      rowSelection,
      columnPinning,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableMultiRowSelection,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    pageCount: listResponse?.totalPages ?? 0,
    getRowId,
    meta,
    initialState,
  });

  // ─── onSelectedRowsChange callback (stable deps via ref) ─────────────────
  const onSelectedRowsChangeRef = React.useRef(onSelectedRowsChange);
  onSelectedRowsChangeRef.current = onSelectedRowsChange;
  const tableRef = React.useRef(table);
  tableRef.current = table;

  React.useEffect(() => {
    if (!onSelectedRowsChangeRef.current) return;
    const rows = tableRef.current
      .getSelectedRowModel()
      .rows.map((r: Row<TData>) => r.original);
    onSelectedRowsChangeRef.current(rows);
  }, [rowSelection]);

  return (
    <div className="flex-1">
      {!hiddenToolbar && (
        <div className="mb-4">
          <DataTableToolbar
            table={table}
            isLoading={isFetching}
            searchPlaceholder={searchPlaceholder}
            filterFields={filterFields}
            filterOptions={filterOptions}
            enableViewOptions={enableViewOptions}
            actionsRender={actionsRender}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <DataTableTable
          table={table}
          isLoading={isFetching}
          error={error}
          onRowClick={onRowClick}
          emptyState={emptyState}
          footer={
            footerRender ? helpers => footerRender(table, helpers) : undefined
          }
          topRows={
            topRowsRender ? helpers => topRowsRender(table, helpers) : undefined
          }
        />
      </div>

      <div className="mt-4">
        <DataTablePagination
          table={table}
          isLoading={isFetching}
          enableMultiRowSelection={enableMultiRowSelection}
        />
      </div>
    </div>
  );
}
