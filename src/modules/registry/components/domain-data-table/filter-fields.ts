import { CONST_DOMAIN_STATUS } from '../../constants/domain';
import { TranslationsKey } from '@/core/i18n/types';
import { DataTableFilterField } from '@/shared/components/data-table/shared/data-table-filter';

const filterFields: DataTableFilterField[] = [
  {
    id: 'domainCode',
    type: 'text',
    title: 'registry.domain.fields.domainCode' satisfies TranslationsKey,
  },
  {
    id: 'serviceId',
    type: 'select',
    title: 'registry.domain.fields.serviceId' satisfies TranslationsKey,
  },
  {
    id: 'status',
    type: 'enum',
    title: 'registry.domain.fields.status' satisfies TranslationsKey,
    options: CONST_DOMAIN_STATUS,
  },
];

export default filterFields;
