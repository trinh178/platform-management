export interface JobPositionLevel {
  id: string;

  name: string;
  code: string;
  level: number;
}

export interface JobPosition {
  id: string;

  name: string;
  code: string;
  isManager: boolean;

  /* Relations */
  level: JobPositionLevel;
  organizationUnit?: OrganizationUnit[];
}

export type OrganizationUnitLevel = {
  id: string;

  name: string;
  code: string;
  level: number;
};

export type OrganizationUnit = {
  id: string;

  name: string;
  code: string;
  shortName?: string;
  address?: string;

  /* Relations */
  level: OrganizationUnitLevel;
  parent?: OrganizationUnit;
  jobPositions?: JobPosition[];
};
