import { FilterFn } from '@tanstack/react-table';
import { DataTableFilterValue } from '../filter-types';
import { matchFilterOperator } from '@/shared/utils';

/**
 * FilterFn dùng cho DataTableStatic — diễn giải `DataTableFilterValue`
 * (operator + value/values) y hệt server/mock, để lọc client-side nhất quán.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dataTableFilterFn: FilterFn<any> = (
  row,
  columnId,
  filterValue,
) => {
  const v = filterValue as DataTableFilterValue | undefined;
  if (!v?.operator) return true;
  return matchFilterOperator(row.getValue(columnId), v);
};
