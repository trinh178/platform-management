import serviceApi from './service.api';
import serviceKeys from './service.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useServices = createUseQueryPlm<ListRequest>()(listRequest => ({
  queryKey: serviceKeys.list(listRequest),
  queryFn: () => serviceApi.list(listRequest),
}));

export const useServiceDetails = createUseQueryPlm<string>()(id => ({
  queryKey: serviceKeys.details(id),
  queryFn: () => serviceApi.details(id),
}));

export const useServiceOptions = createUseQueryPlm<string | undefined>()(
  keyword => ({
    queryKey: serviceKeys.options(keyword),
    queryFn: () => serviceApi.listOptions(keyword),
  }),
);

// Luôn lấy số liệu mới nhất trước khi mở hộp xác nhận xoá.
export const useServiceDeleteImpact = createUseQueryPlm<string>()(id => ({
  queryKey: serviceKeys.deleteImpact(id),
  queryFn: () => serviceApi.deleteImpact(id),
  staleTime: 0,
}));
