import { Row } from '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends RowData> {
    onView?: (row: Row<TData>) => void;
    onEdit?: (row: Row<TData>) => void;
    onDelete?: (row: Row<TData>) => void;
    onCreate?: (data: TData[]) => void;
    /** Map userId → thông tin hiển thị, dùng resolve cột audit (createdBy/modifiedBy). */
    userInfoById?: Map<string, { fullName: string; avatar?: string }>;
  }
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    isCustomCell?: boolean;
    /** Plain label used by view-options when header is not a string. */
    label?: string;
    /** Horizontal alignment applied to both header and cell. */
    align?: 'left' | 'center' | 'right';
    /** Extra Tailwind classes merged onto the cell <td>. */
    className?: string;
    /** Extra Tailwind classes merged onto the header <th>. */
    headerClassName?: string;
    /** Pin column to the left or right edge (sticky). */
    sticky?: 'left' | 'right';
  }
}
