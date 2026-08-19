import { CONST_GENDER } from '../../constants/employee';
import { TranslationsKey } from '@/core/i18n/types';
import { DataTableFilterField } from '@/shared/components/data-table/shared/data-table-filter';

const filterFields: DataTableFilterField[] = [
  {
    id: 'employeeCode',
    type: 'text',
    title: 'employee.fields.employeeCode' satisfies TranslationsKey,
  },
  {
    id: 'gender',
    type: 'enum',
    title: 'employee.fields.gender' satisfies TranslationsKey,
    options: CONST_GENDER,
  },
  {
    id: 'dateOfBirth',
    type: 'dateRange',
    title: 'employee.fields.dateOfBirth' satisfies TranslationsKey,
  },
  // `select`: options lấy động từ API (useEmployeeFilterOptions), truyền qua
  // prop `filterOptions` keyed theo id. id phải trùng field filter phía server.
  {
    id: 'organizationUnitCode',
    type: 'select',
    title: 'employee.fields.jobInfo.organizationUnit' satisfies TranslationsKey,
  },
  {
    id: 'jobPositionCode',
    type: 'select',
    title: 'employee.fields.jobInfo.jobPosition' satisfies TranslationsKey,
  },
];

export default filterFields;
