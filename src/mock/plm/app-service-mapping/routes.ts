import {
  buildMappingDetails,
  createMappingFromBody,
  isMappingTaken,
} from './helpers';
import type { AppServiceMappingMock } from './mock-types';
import { appServiceMappingStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import {
  MockListFilter,
  buildMockListResponse,
  extractIdFromUrl,
  matchFilterOperator,
  parseBody,
  toUrl,
} from '@/core/network/mock-utils';
import plmHttpRequest from '@/core/network/plm-http-request';
import { appStore } from '@/mock/plm/app/stores';
import { serviceStore } from '@/mock/plm/service/stores';

function searchMapping(mapping: AppServiceMappingMock, searchTerm: string) {
  const app = appStore.find(a => a.id === mapping.appId);
  const service = serviceStore.find(s => s.id === mapping.serviceId);
  return [app?.appCode, app?.name, service?.serviceCode, service?.name]
    .filter(Boolean)
    .some(value => value!.toLowerCase().includes(searchTerm));
}

function filterMapping(mapping: AppServiceMappingMock, filter: MockListFilter) {
  if (filter.field === 'appId')
    return matchFilterOperator(mapping.appId, filter);
  if (filter.field === 'serviceId')
    return matchFilterOperator(mapping.serviceId, filter);
  return true;
}

// ─── GET /registry/app-service-mappings (list) ─────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/app-service-mappings(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: appServiceMappingStore,
        search: searchMapping,
        filter: filterMapping,
        mapItem: buildMappingDetails,
        defaultSort: [{ field: 'createdOnUtc', direction: 'Descending' }],
      }),
    );
  },
});

// ─── POST /registry/app-service-mappings (assign) ──────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/app-service-mappings$/,
  method: 'POST',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    const appId = typeof body.appId === 'string' ? body.appId : '';
    const serviceId = typeof body.serviceId === 'string' ? body.serviceId : '';

    if (!appId || !appStore.some(a => a.id === appId)) {
      return appfetch.error(
        { code: 'APP_NOT_FOUND', message: 'Ứng dụng không tồn tại' },
        400,
      );
    }
    if (!serviceId || !serviceStore.some(s => s.id === serviceId)) {
      return appfetch.error(
        { code: 'SERVICE_NOT_FOUND', message: 'Service không tồn tại' },
        400,
      );
    }
    if (isMappingTaken(appId, serviceId)) {
      return appfetch.error(
        {
          code: 'MAPPING_TAKEN',
          message: 'Ứng dụng này đã được gán với service này',
        },
        409,
      );
    }

    const mapping = createMappingFromBody(body);
    return appfetch.json(buildMappingDetails(mapping));
  },
});

// ─── DELETE /registry/app-service-mappings/:id (unassign) ──────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/app-service-mappings\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'app-service-mappings');
    const index = appServiceMappingStore.findIndex(m => m.id === id);
    if (index === -1) {
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy liên kết' },
        404,
      );
    }
    appServiceMappingStore.splice(index, 1);
    return appfetch.empty();
  },
});
