import { TranslationsKey } from '@/core/i18n/types';
import { DataTableFilterField } from '@/shared/components/data-table/shared/data-table-filter';

const filterFields: DataTableFilterField[] = [
  {
    id: 'appId',
    type: 'select',
    title: 'registry.appServiceMapping.fields.appId' satisfies TranslationsKey,
  },
  {
    id: 'serviceId',
    type: 'select',
    title:
      'registry.appServiceMapping.fields.serviceId' satisfies TranslationsKey,
  },
];

export default filterFields;
