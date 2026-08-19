import appApi from './app.api';
import appKeys from './app.query-keys';
import { createUseQueryPlm } from '@/core/query/factories';
import { ListRequest } from '@/shared/types/pagination';

export const useApps = createUseQueryPlm<ListRequest>()(listRequest => ({
  queryKey: appKeys.list(listRequest),
  queryFn: () => appApi.list(listRequest),
}));

export const useAppDetails = createUseQueryPlm<string>()(id => ({
  queryKey: appKeys.details(id),
  queryFn: () => appApi.details(id),
}));

export const useAppOptions = createUseQueryPlm<string | undefined>()(
  keyword => ({
    queryKey: appKeys.options(keyword),
    queryFn: () => appApi.listOptions(keyword),
  }),
);
