import organizationUnitApi from './organization-unit.api';
import organizationUnitKeys from './organization-unit.query-keys';
import { createUseQueryHrmEm } from '@/core/query/factories';

export const useOrganizationUnitHierarchy = createUseQueryHrmEm()(() => ({
  queryKey: organizationUnitKeys.hierarchy,
  queryFn: organizationUnitApi.hierarchy,
}));
