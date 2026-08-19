import { ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { DataTableFilterValue } from '../shared/filter-types';
import { FilterCondition, SortCondition } from '@/shared/types/pagination';

/**
 * TanStack columnFilters → FilterCondition[] của contract.
 * Mỗi cột lưu một `DataTableFilterValue` (operator + value/values).
 */
export function transformColumnFiltersForApi(
  columnFilters: ColumnFiltersState,
): FilterCondition[] {
  return columnFilters.flatMap(({ id, value }) => {
    const v = value as DataTableFilterValue | undefined;
    if (!v?.operator) return [];
    return [
      {
        field: id,
        operator: v.operator,
        value: v.value,
        values: v.values,
      } satisfies FilterCondition,
    ];
  });
}

// Reverse — dùng để restore filter state khi DataTable remount từ cached response.
export function transformColumnFiltersFromApi(
  filters: FilterCondition[],
): ColumnFiltersState {
  return filters.map(f => ({
    id: f.field,
    value: {
      operator: f.operator ?? 'Equal',
      value: f.value,
      values: f.values,
    } satisfies DataTableFilterValue,
  }));
}

export function transformSortForApi(
  sorting: SortingState,
): SortCondition[] | undefined {
  if (!sorting.length) return undefined;
  return sorting.map(s => ({
    field: s.id,
    direction: s.desc ? 'Descending' : 'Ascending',
  }));
}

export function transformSortFromApi(
  sorts: SortCondition[] | undefined | null,
): SortingState {
  if (!sorts?.length) return [];
  // Contract: direction mặc định là 'Descending' khi bỏ trống.
  return sorts.map(s => ({ id: s.field, desc: s.direction !== 'Ascending' }));
}
