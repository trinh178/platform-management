import { CONST_SERVICE_STATUS } from '../../constants/service';
import { TranslationsKey } from '@/core/i18n/types';
import { DataTableFilterField } from '@/shared/components/data-table/shared/data-table-filter';

const filterFields: DataTableFilterField[] = [
  {
    id: 'serviceCode',
    type: 'text',
    title: 'registry.service.fields.serviceCode' satisfies TranslationsKey,
  },
  {
    id: 'status',
    type: 'enum',
    title: 'registry.service.fields.status' satisfies TranslationsKey,
    options: CONST_SERVICE_STATUS,
  },
];

export default filterFields;
