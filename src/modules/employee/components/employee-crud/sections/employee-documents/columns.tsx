import { CellContext } from '@tanstack/react-table';
import { Pen, Trash2 } from 'lucide-react';
import { useEmployeeCRUDContext } from '../../context';
import { TranslationsKey } from '@/core/i18n/types';
import { EmployeeDocument } from '@/modules/employee/types/employee-document';
import {
  createRowNumberColumn,
  getColumnHelper,
} from '@/shared/components/data-table/shared/column-utils';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const columnHelper = getColumnHelper<EmployeeDocument>();

const columns = [
  createRowNumberColumn<EmployeeDocument>(),

  columnHelper.accessor('name', {
    header: 'employee.fields.document.name' satisfies TranslationsKey,
  }),

  columnHelper.accessor('fileName', {
    header: 'employee.fields.document.fileName' satisfies TranslationsKey,
  }),

  columnHelper.display({
    id: 'actions',
    enableSorting: false,
    meta: { align: 'center', headerClassName: 'w-20' },
    cell: ActionCell,
  }),
];

export default columns;

function ActionCell({ row, table }: CellContext<EmployeeDocument, unknown>) {
  const meta = table.options.meta;
  const { inlineEdit } = useEmployeeCRUDContext();

  if (!inlineEdit) return null;
  return (
    <div className={cn('flex justify-center gap-1')}>
      <Button
        size="icon-sm"
        type="button"
        variant="ghost"
        onClick={() => meta?.onEdit?.(row)}
      >
        <Pen />
      </Button>
      <Button
        size="icon-sm"
        type="button"
        variant="ghost"
        className="text-destructive hover:text-destructive"
        onClick={() => meta?.onDelete?.(row)}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
