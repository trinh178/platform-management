import { CONST_APP_SERVICE_ROLE } from '../../constants/app-service-mapping';
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
  {
    id: 'role',
    type: 'enum',
    title: 'registry.appServiceMapping.fields.role' satisfies TranslationsKey,
    options: CONST_APP_SERVICE_ROLE,
  },
];

export default filterFields;
