import type { JobPosition, OrganizationUnitLevel } from '../types/organization';

export type OrganizationUnitNode = {
  id: string;
  name: string;
  code: string;
  shortName?: string;
  address?: string;
  level: OrganizationUnitLevel;
  jobPositions: JobPosition[];
  children: OrganizationUnitNode[];
};

// GET /organizations/unit/hierarchy
export type GetOrganizationUnitHierarchyResponse = OrganizationUnitNode[];
