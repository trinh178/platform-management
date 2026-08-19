import { CONST_RESOURCE_STATUS } from '../../constants/resource';
import { TranslationsKey } from '@/core/i18n/types';
import { DataTableFilterField } from '@/shared/components/data-table/shared/data-table-filter';

const filterFields: DataTableFilterField[] = [
  {
    id: 'resourceCode',
    type: 'text',
    title: 'registry.resource.fields.resourceCode' satisfies TranslationsKey,
  },
  {
    id: 'domainId',
    type: 'select',
    title: 'registry.resource.fields.domainId' satisfies TranslationsKey,
  },
  {
    id: 'status',
    type: 'enum',
    title: 'registry.resource.fields.status' satisfies TranslationsKey,
    options: CONST_RESOURCE_STATUS,
  },
];

export default filterFields;
