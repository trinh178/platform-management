import resourceApi from './resource.api';
import { ListResourceOptionsRequest } from './resource.api-types';
import resourceKeys from './resource.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useResources = createUseQueryPlm<ListRequest>()(listRequest => ({
  queryKey: resourceKeys.list(listRequest),
  queryFn: () => resourceApi.list(listRequest),
}));

export const useResourceDetails = createUseQueryPlm<string>()(id => ({
  queryKey: resourceKeys.details(id),
  queryFn: () => resourceApi.details(id),
}));

export const useResourceOptions = createUseQueryPlm<
  ListResourceOptionsRequest | undefined
>()(params => ({
  queryKey: resourceKeys.options(params),
  queryFn: () => resourceApi.listOptions(params),
}));

// Luôn lấy số liệu mới nhất trước khi mở hộp xác nhận xoá.
export const useResourceDeleteImpact = createUseQueryPlm<string>()(id => ({
  queryKey: resourceKeys.deleteImpact(id),
  queryFn: () => resourceApi.deleteImpact(id),
  staleTime: 0,
}));
