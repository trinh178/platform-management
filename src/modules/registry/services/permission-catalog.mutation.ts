import domainKeys from './domain.query-keys';
import permissionCatalogApi from './permission-catalog.api';
import permissionCatalogKeys from './permission-catalog.query-keys';
import resourceKeys from './resource.query-keys';
import serviceKeys from './service.query-keys';
import { createUseMutationPlm } from '@/core/query/factories';
import queryClient from '@/core/query/query-client';

// Import có thể tạo Service/Domain/Resource/Action mới → làm mới toàn bộ cây.
export const usePermissionImport = createUseMutationPlm({
  mutationFn: permissionCatalogApi.importCodeList,
  onSuccess(result) {
    if (!result.applied) return;
    queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    queryClient.invalidateQueries({ queryKey: domainKeys.all });
    queryClient.invalidateQueries({ queryKey: resourceKeys.all });
    queryClient.invalidateQueries({ queryKey: permissionCatalogKeys.all });
  },
});

// Export là thao tác đọc nhưng chạy theo sự kiện bấm nút (tải file) nên dùng
// mutation để có loading/notify error sẵn.
export const usePermissionExport = createUseMutationPlm({
  mutationFn: permissionCatalogApi.exportCodeList,
});
