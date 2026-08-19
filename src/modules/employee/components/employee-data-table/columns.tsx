import type { CellContext } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { EmployeePreview } from '../../types/employee';
import { constGet } from '@/core/constants';
import { gT } from '@/core/i18n';
import { TranslationsKey } from '@/core/i18n/types';
import { AppLink } from '@/core/router/next';
import { CONST_GENDER } from '@/modules/employee/constants/employee';
import routePaths from '@/modules/employee/route-paths';
import {
  createActionsColumn,
  createDateColumn,
  createRowNumberColumn,
  createUserColumn,
  getColumnHelper,
} from '@/shared/components/data-table/shared/column-utils';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/shared/components/ui/avatar';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { EmptyAvatar } from '@/shared/components/ui/empty-avatar';

const columnHelper = getColumnHelper<EmployeePreview>();

const columns = [
  createRowNumberColumn<EmployeePreview>(),

  columnHelper.accessor('employeeCode', {
    header: 'employee.fields.employeeCode' satisfies TranslationsKey,
  }),

  columnHelper.accessor('fullName', {
    header: 'employee.fields.fullName' satisfies TranslationsKey,
    cell: FullNameCell,
  }),

  columnHelper.accessor('gender', {
    header: 'employee.fields.gender' satisfies TranslationsKey,
    cell: c =>
      gT(constGet(CONST_GENDER, c.getValue(), 'label') as TranslationsKey),
  }),

  createDateColumn<EmployeePreview>({
    accessor: 'dateOfBirth',
    header: 'employee.fields.dateOfBirth',
  }),

  columnHelper.accessor('contact.personalPhoneNumber', {
    header:
      'employee.fields.contact.personalPhoneNumber' satisfies TranslationsKey,
  }),

  // Hiển thị tên đơn vị, nhưng id = field filter phía server (`organizationUnitCode`)
  // để dispatcher bind đúng filter `select`.
  columnHelper.accessor('jobInfo.organizationUnit.name', {
    id: 'organizationUnitCode',
    header:
      'employee.fields.jobInfo.organizationUnit' satisfies TranslationsKey,
  }),

  columnHelper.accessor('jobInfo.jobPosition.name', {
    id: 'jobPositionCode',
    header: 'employee.fields.jobInfo.jobPosition' satisfies TranslationsKey,
  }),

  createUserColumn<EmployeePreview>({
    accessor: 'createdBy',
    header: 'employee.fields.createdBy',
  }),

  createUserColumn<EmployeePreview>({
    accessor: 'modifiedBy',
    header: 'employee.fields.modifiedBy',
  }),

  createActionsColumn<EmployeePreview>((row, table) => {
    const meta = table.options.meta;

    return (
      <>
        {meta?.onView && (
          <DropdownMenuItem onClick={() => meta.onView?.(row)}>
            <Eye />
            {gT('common.control.view' as TranslationsKey)}
          </DropdownMenuItem>
        )}

        {meta?.onEdit && (
          <DropdownMenuItem onClick={() => meta.onEdit?.(row)}>
            <Pencil />
            {gT('common.control.edit' as TranslationsKey)}
          </DropdownMenuItem>
        )}

        {meta?.onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => meta.onDelete?.(row)}
            >
              <Trash2 />
              {gT('common.control.delete' as TranslationsKey)}
            </DropdownMenuItem>
          </>
        )}
      </>
    );
  }),
];

export default columns;

function FullNameCell({ row }: CellContext<EmployeePreview, unknown>) {
  return (
    <div className="flex flex-row gap-2">
      <Avatar>
        <AvatarImage src={row.original.avatar} alt={row.original.fullName} />
        <AvatarFallback>
          <EmptyAvatar />
        </AvatarFallback>
      </Avatar>
      <AppLink
        href={routePaths.details}
        relative
        params={{ id: row.original.id }}
        className="text-foreground w-fit px-0 text-left underline-offset-4 hover:underline"
      >
        {row.original.fullName}
      </AppLink>
    </div>
  );
}
