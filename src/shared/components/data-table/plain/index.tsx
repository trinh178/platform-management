'use client';

import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
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

export interface PlainTableColumnDef<TData> {
  key: string;
  header: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  render: (row: TData, index: number) => ReactNode;
}

export interface DataTablePlainProps<TData> {
  columns: PlainTableColumnDef<TData>[];
  data: TData[];
  isFetching?: boolean;
  getRowKey?: (row: TData, index: number) => string;
  /** Nội dung render bên trong <TableFooter> — thường là <TableRow> tổng cộng */
  footer?: ReactNode;
  emptyState?: ReactNode;
  getRowClassName?: (row: TData, index: number) => string | undefined;
}

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

const SKELETON_ROWS = 4;

export function DataTablePlain<TData>({
  columns,
  data,
  isFetching,
  getRowKey,
  footer,
  emptyState,
  getRowClassName,
}: DataTablePlainProps<TData>) {
  const t = useTranslations();

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          <TableRow>
            {columns.map(col => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align && ALIGN_CLASS[col.align],
                  col.headerClassName,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isFetching && data.length === 0 ? (
            Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map(col => (
                  <TableCell key={col.key} className="h-13.25">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-13.25 text-center text-muted-foreground"
              >
                {emptyState ?? t('common.table.no_results')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={getRowKey ? getRowKey(row, index) : String(index)}
                className={getRowClassName?.(row, index)}
              >
                {columns.map(col => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      col.align && ALIGN_CLASS[col.align],
                      col.className,
                    )}
                  >
                    {col.render(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>

        {footer && <TableFooter>{footer}</TableFooter>}
      </Table>
    </div>
  );
}
