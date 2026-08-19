import { Table } from '@tanstack/react-table';

export interface DataTableState<TData> {
  table: Table<TData>;
  isLoading?: boolean;
  enableMultiRowSelection?: boolean;
  error?: unknown;
}

export type DataTableRowClickHandler<TData> = (row: TData) => void;
