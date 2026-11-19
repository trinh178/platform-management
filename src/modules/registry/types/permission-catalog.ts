// GET /registry/permission-catalog — mỗi phần tử là một Action của Resource.
export type PermissionCatalogItem = {
  id: string; // id của Action bên PLM
  code: string; // <ServiceCode>.<DomainCode>.<ResourceCode>.<Action>
  serviceCode: string;
  domainCode: string;
  resourceCode: string;
  action: string;
};

export type PermissionImportErrorReason =
  'INVALID_FORMAT' | 'DUPLICATE_IN_FILE';

// POST /registry/permissions/import
export type PermissionImportResult = {
  applied: boolean;
  created: {
    services: number;
    domains: number;
    resources: number;
    actions: number;
  };
  skipped: number;
  errors: {
    line: number;
    code: string;
    reason: PermissionImportErrorReason;
  }[];
};
