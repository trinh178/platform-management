import type {
  PermissionCatalogItem,
  PermissionImportResult,
} from '../types/permission-catalog';

// GET /registry/permission-catalog — không truyền serviceCode thì trả toàn bộ.
export type PermissionCatalogRequest = { serviceCode?: string } | undefined;
export type PermissionCatalogResponse = PermissionCatalogItem[];

// POST /registry/permissions/import — multipart field `file` (.txt).
export type ImportPermissionsRequest = { file: File };
export type ImportPermissionsResponse = PermissionImportResult;

// GET /registry/permissions/export — text/plain, mỗi dòng một mã.
export type ExportPermissionsRequest = { serviceCode?: string };
export type ExportPermissionsResponse = string;
