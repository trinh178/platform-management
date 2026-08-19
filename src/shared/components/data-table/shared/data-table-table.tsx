import React from 'react';
import { Column, flexRender } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DataTableRowClickHandler, DataTableState } from './types';
import { TranslationsKey } from '@/core/i18n/types';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { cn } from '@/shared/lib/utils';
import { renderValue } from '@/shared/utils';

export interface DataTableTableProps<TData> extends DataTableState<TData> {
  onRowClick?: DataTableRowClickHandler<TData>;
  emptyState?: React.ReactNode;
  footer?: (helpers: DataTableTableRenderHelpers<TData>) => React.ReactNode;
  topRows?: (helpers: DataTableTableRenderHelpers<TData>) => React.ReactNode;
}

export interface DataTableTableRenderHelpers<TData> {
  getPinnedCellProps: (
    column: Column<TData>,
    options?: {
      backgroundClassName?: string;
      zIndexClassName?: string;
      style?: React.CSSProperties;
    },
  ) => {
    className?: string;
    style?: React.CSSProperties;
  };
}

const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [role="button"], [role="menuitem"], [role="checkbox"]';

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

function pinnedStyle(
  pinned: false | 'left' | 'right',
  offset: number,
): React.CSSProperties | undefined {
  if (!pinned) return undefined;
  return {
    left: pinned === 'left' ? `${offset}px` : undefined,
    right: pinned === 'right' ? `${offset}px` : undefined,
  };
}

/** Compute sticky offsets from actual rendered <th> widths. */
function computeOffsets(
  leftCols: Column<unknown>[],
  rightCols: Column<unknown>[],
  refs: Map<string, HTMLTableCellElement>,
): Record<string, number> {
  const offsets: Record<string, number> = {};
  let left = 0;
  for (const col of leftCols) {
    offsets[col.id] = left;
    left += refs.get(col.id)?.offsetWidth ?? col.getSize();
  }
  let right = 0;
  for (let i = rightCols.length - 1; i >= 0; i--) {
    offsets[rightCols[i].id] = right;
    right += refs.get(rightCols[i].id)?.offsetWidth ?? rightCols[i].getSize();
  }
  return offsets;
}

export default function DataTableTable<TData>({
  table,
  isLoading,
  error,
  onRowClick,
  emptyState,
  footer,
  topRows,
}: DataTableTableProps<TData>) {
  const t = useTranslations();
  const visibleColumnCount = table.getVisibleFlatColumns().length;
  const rows = table.getRowModel().rows;
  const hasRows = rows.length > 0;

  // Measure actual <th> widths to compute sticky offsets accurately.
  // Falls back to column.getSize() (default 150) on the first paint.
  const thRefs = React.useRef<Map<string, HTMLTableCellElement>>(new Map());
  const [stickyOffsets, setStickyOffsets] = React.useState<
    Record<string, number>
  >({});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(() => {
    const leftCols = table.getLeftLeafColumns() as Column<unknown>[];
    const rightCols = table.getRightLeafColumns() as Column<unknown>[];
    if (!leftCols.length && !rightCols.length) return;
    const next = computeOffsets(leftCols, rightCols, thRefs.current);
    setStickyOffsets(prev => {
      const keys = Object.keys(next);
      const unchanged =
        keys.length === Object.keys(prev).length &&
        keys.every(k => prev[k] === next[k]);
      return unchanged ? prev : next;
    });
  });

  const handleRowClick = (
    e: React.MouseEvent<HTMLTableRowElement>,
    rowOriginal: TData,
  ) => {
    if (!onRowClick) return;
    const target = e.target;
    if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
      return;
    }
    onRowClick(rowOriginal);
  };

  const renderHelpers = React.useMemo<DataTableTableRenderHelpers<TData>>(
    () => ({
      getPinnedCellProps: (
        column,
        {
          backgroundClassName = 'bg-background',
          zIndexClassName = 'z-1',
          style,
        } = {},
      ) => {
        const pinned = column.getIsPinned();

        return {
          className: cn(
            pinned && 'sticky',
            pinned && zIndexClassName,
            pinned && backgroundClassName,
            pinned === 'left' && 'shadow-[1px_0_0_0_hsl(var(--border))]',
            pinned === 'right' && 'shadow-[-1px_0_0_0_hsl(var(--border))]',
          ),
          style: pinned
            ? {
                ...pinnedStyle(pinned, stickyOffsets[column.id] ?? 0),
                ...style,
              }
            : undefined,
        };
      },
    }),
    [stickyOffsets],
  );

  return (
    <Table>
      <TableHeader className="bg-muted sticky top-0 z-10">
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => {
              const canSort = header.column.getCanSort();
              const sortDir = header.column.getIsSorted();
              const sortHandler = header.column.getToggleSortingHandler();
              const content = header.isPlaceholder
                ? null
                : flexRender(
                    typeof header.column.columnDef.header === 'string'
                      ? t(header.column.columnDef.header as TranslationsKey)
                      : header.column.columnDef.header,
                    header.getContext(),
                  );
              const meta = header.column.columnDef.meta;
              const isPinned = header.column.getIsPinned();
              return (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  ref={el => {
                    if (isPinned && el)
                      thRefs.current.set(header.column.id, el);
                    else thRefs.current.delete(header.column.id);
                  }}
                  aria-sort={
                    sortDir === 'asc'
                      ? 'ascending'
                      : sortDir === 'desc'
                        ? 'descending'
                        : undefined
                  }
                  className={cn(
                    meta?.align && ALIGN_CLASS[meta.align],
                    meta?.headerClassName,
                    isPinned && 'sticky z-2 bg-muted',
                    isPinned === 'left' &&
                      'shadow-[1px_0_0_0_hsl(var(--border))]',
                    isPinned === 'right' &&
                      'shadow-[-1px_0_0_0_hsl(var(--border))]',
                  )}
                  style={pinnedStyle(
                    isPinned,
                    stickyOffsets[header.column.id] ?? 0,
                  )}
                >
                  {canSort ? (
                    <button
                      type="button"
                      onClick={sortHandler}
                      className="inline-flex items-center gap-1.5 select-none hover:text-foreground"
                    >
                      {content}
                      <SortIcon column={header.column} />
                    </button>
                  ) : (
                    content
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="**:data-[slot=table-cell]:first:w-8">
        {!error && topRows?.(renderHelpers)}
        {error ? (
          <TableRow>
            <TableCell
              colSpan={visibleColumnCount}
              className="h-24 text-center text-destructive"
            >
              <div className="inline-flex items-center gap-2">
                <CircleAlert className="h-4 w-4" />
                {extractErrorMessage(error) ?? t('common.table.no_results')}
              </div>
            </TableCell>
          </TableRow>
        ) : hasRows ? (
          rows.map(row => (
            <TableRow
              key={row.id}
              onClick={
                onRowClick ? e => handleRowClick(e, row.original) : undefined
              }
              className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
            >
              {row.getVisibleCells().map(cell => {
                const cellMeta = cell.column.columnDef.meta;
                const isCellPinned = cell.column.getIsPinned();
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      'relative',
                      cellMeta?.align && ALIGN_CLASS[cellMeta.align],
                      cellMeta?.className,
                      isCellPinned && 'sticky z-1 bg-background',
                      isCellPinned === 'left' &&
                        'shadow-[1px_0_0_0_hsl(var(--border))]',
                      isCellPinned === 'right' &&
                        'shadow-[-1px_0_0_0_hsl(var(--border))]',
                    )}
                    style={pinnedStyle(
                      isCellPinned,
                      stickyOffsets[cell.column.id] ?? 0,
                    )}
                  >
                    <div className={cn({ invisible: isLoading })}>
                      {cellMeta?.isCustomCell
                        ? flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        : renderValue(cell.getValue())}
                    </div>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center p-2">
                        <Skeleton className="h-8 w-full" />
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : isLoading ? (
          Array.from({ length: table.getState().pagination.pageSize }).map(
            (_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: visibleColumnCount }).map(
                  (__, colIdx) => (
                    <TableCell key={colIdx} className="h-13.25">
                      <Skeleton className="h-8" />
                    </TableCell>
                  ),
                )}
              </TableRow>
            ),
          )
        ) : (
          <TableRow>
            <TableCell
              colSpan={visibleColumnCount}
              className="h-13.25 text-center text-muted-foreground"
            >
              {emptyState ?? t('common.table.no_results')}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      {footer && <TableFooter>{footer(renderHelpers)}</TableFooter>}
    </Table>
  );
}

function SortIcon<TData, TValue>({
  column,
}: {
  column: Column<TData, TValue>;
}) {
  const dir = column.getIsSorted();
  if (dir === 'asc') return <ArrowUp className="h-3.5 w-3.5" />;
  if (dir === 'desc') return <ArrowDown className="h-3.5 w-3.5" />;
  return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
}

function extractErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  return undefined;
}
