import DataTableViewOptions from '../shared/data-table-view-options';
import { DataTableState } from '../shared/types';

export interface DataTableActionsType<TData> {
  enableViewOptions?: boolean;
  actionsRender?: (state: DataTableState<TData>) => React.ReactNode;
}

export default function DataTableActions<TData>({
  enableViewOptions,
  actionsRender,
  ...props
}: DataTableState<TData> & DataTableActionsType<TData>) {
  return (
    <div className="flex items-center gap-2">
      {enableViewOptions && <DataTableViewOptions {...props} />}
      {actionsRender && actionsRender(props)}
    </div>
  );
}
