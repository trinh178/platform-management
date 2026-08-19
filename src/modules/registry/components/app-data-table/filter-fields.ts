import { CONST_APP_STATUS } from '../../constants/app';
import { TranslationsKey } from '@/core/i18n/types';
import { DataTableFilterField } from '@/shared/components/data-table/shared/data-table-filter';

const filterFields: DataTableFilterField[] = [
  {
    id: 'appCode',
    type: 'text',
    title: 'registry.app.fields.appCode' satisfies TranslationsKey,
  },
  {
    id: 'status',
    type: 'enum',
    title: 'registry.app.fields.status' satisfies TranslationsKey,
    options: CONST_APP_STATUS,
  },
];

export default filterFields;
