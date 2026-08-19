import DataTableFilter, {
  DataTableFilterType,
} from '../shared/data-table-filter';
import DataTableFilterGlobal, {
  DataTableFilterGlobalType,
} from '../shared/data-table-filter-global';
import { DataTableState } from '../shared/types';
import DataTableActions, { DataTableActionsType } from './data-table-actions';

export type DataTableToolbarProps<TData> = DataTableState<TData> &
  DataTableFilterGlobalType &
  DataTableFilterType &
  DataTableActionsType<TData>;

export function DataTableToolbar<TData>({
  searchPlaceholder,
  filterFields,
  ...props
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex-1 flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <DataTableFilterGlobal
          {...props}
          searchPlaceholder={searchPlaceholder}
        />
        <DataTableFilter {...props} filterFields={filterFields} />
      </div>
      <DataTableActions {...props} />
    </div>
  );
}
