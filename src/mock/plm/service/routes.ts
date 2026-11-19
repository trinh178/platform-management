import {
  buildServicePreview,
  createServiceFromBody,
  getServiceDeleteImpact,
  getServiceOrNotFound,
  isServiceCodeTaken,
  mergeService,
} from './helpers';
import type { ServiceMock } from './mock-types';
import { serviceStore } from './stores';
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
import { removeDomainsWhere } from '@/mock/plm/domain/helpers';

function searchService(service: ServiceMock, searchTerm: string) {
  return [service.serviceCode, service.name, service.description]
    .filter(Boolean)
    .some(value => value!.toLowerCase().includes(searchTerm));
}

function filterService(service: ServiceMock, filter: MockListFilter) {
  if (filter.field === 'serviceCode')
    return matchFilterOperator(service.serviceCode, filter);
  if (filter.field === 'status')
    return matchFilterOperator(service.status, filter);
  return true;
}

// ─── GET /registry/services (list) ─────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/services(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: serviceStore,
        search: searchService,
        filter: filterService,
        defaultSort: [{ field: 'createdOnUtc', direction: 'Descending' }],
      }),
    );
  },
});

// ─── GET /registry/services/options (specific — must be BEFORE /:id) ────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/services\/options(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    const keyword = sp.get('keyword')?.trim().toLowerCase();
    const items = serviceStore
      .filter(s => s.status === 'Active')
      .filter(
        s =>
          !keyword ||
          s.serviceCode.toLowerCase().includes(keyword) ||
          s.name.toLowerCase().includes(keyword),
      )
      .map(buildServicePreview);
    return appfetch.json(items);
  },
});

// ─── GET /registry/services/:id ──────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/services\/[^/?]+$/,
  method: 'GET',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'services');
    const service = getServiceOrNotFound(id);
    if (service instanceof Response) return service;
    return appfetch.json(service);
  },
});

// ─── POST /registry/services ──────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/services$/,
  method: 'POST',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    const serviceCode =
      typeof body.serviceCode === 'string' ? body.serviceCode : '';
    if (serviceCode && isServiceCodeTaken(serviceCode)) {
      return appfetch.error(
        {
          code: 'SERVICE_CODE_TAKEN',
          message: `Mã service "${serviceCode}" đã tồn tại`,
        },
        409,
      );
    }
    const service = createServiceFromBody(body);
    return appfetch.json(service);
  },
});

// ─── PUT /registry/services/:id ────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/services\/[^/?]+$/,
  method: 'PUT',
  handler: async (input, init) => {
    const id = extractIdFromUrl(toUrl(input), 'services');
    const service = getServiceOrNotFound(id);
    if (service instanceof Response) return service;

    const body = await parseBody(input, init);
    const serviceCode =
      typeof body.serviceCode === 'string' ? body.serviceCode : undefined;
    if (serviceCode && isServiceCodeTaken(serviceCode, service.id)) {
      return appfetch.error(
        {
          code: 'SERVICE_CODE_TAKEN',
          message: `Mã service "${serviceCode}" đã tồn tại`,
        },
        409,
      );
    }

    mergeService(service, body);
    return appfetch.json(service);
  },
});

// ─── DELETE /registry/services/:id ─────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/services\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'services');
    const index = serviceStore.findIndex(s => s.id === id);
    if (index === -1) {
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy service' },
        404,
      );
    }
    // Service còn được gán cho App thì chặn — phải gỡ mapping trước (D12).
    if (getServiceDeleteImpact(serviceStore[index].id).mappings > 0) {
      return appfetch.error(
        {
          code: 'SERVICE_HAS_MAPPINGS',
          message:
            'Service đang được gán cho ứng dụng, hãy gỡ liên kết trước khi xoá',
        },
        409,
      );
    }
    // Xoá kèm toàn bộ domain/resource/action con.
    removeDomainsWhere(d => d.serviceId === serviceStore[index].id);
    serviceStore.splice(index, 1);
    return appfetch.empty();
  },
});

// ─── GET /registry/services/:id/delete-impact ─────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/services\/[^/?]+\/delete-impact$/,
  method: 'GET',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'services');
    const service = getServiceOrNotFound(id);
    if (service instanceof Response) return service;
    return appfetch.json(getServiceDeleteImpact(service.id));
  },
});
