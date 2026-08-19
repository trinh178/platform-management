import {
  buildResourceDetails,
  createResourceFromBody,
  getResourceOrNotFound,
  isResourceCodeTaken,
  mergeResource,
} from './helpers';
import type { ResourceMock } from './mock-types';
import { resourceStore } from './stores';
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
import { domainStore } from '@/mock/plm/domain/stores';

function searchResource(resource: ResourceMock, searchTerm: string) {
  return [resource.resourceCode, resource.name, resource.description]
    .filter(Boolean)
    .some(value => value!.toLowerCase().includes(searchTerm));
}

function filterResource(resource: ResourceMock, filter: MockListFilter) {
  if (filter.field === 'resourceCode')
    return matchFilterOperator(resource.resourceCode, filter);
  if (filter.field === 'status')
    return matchFilterOperator(resource.status, filter);
  if (filter.field === 'domainId')
    return matchFilterOperator(resource.domainId, filter);
  return true;
}

// ─── GET /registry/resources (list) ────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/resources(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: resourceStore,
        search: searchResource,
        filter: filterResource,
        mapItem: buildResourceDetails,
        defaultSort: [{ field: 'createdOnUtc', direction: 'Descending' }],
      }),
    );
  },
});

// ─── GET /registry/resources/:id ─────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/resources\/[^/?]+$/,
  method: 'GET',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'resources');
    const resource = getResourceOrNotFound(id);
    if (resource instanceof Response) return resource;
    return appfetch.json(buildResourceDetails(resource));
  },
});

// ─── POST /registry/resources ──────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/resources$/,
  method: 'POST',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    const domainId = typeof body.domainId === 'string' ? body.domainId : '';
    const resourceCode =
      typeof body.resourceCode === 'string' ? body.resourceCode : '';

    if (!domainId || !domainStore.some(d => d.id === domainId)) {
      return appfetch.error(
        { code: 'DOMAIN_NOT_FOUND', message: 'Domain không tồn tại' },
        400,
      );
    }
    if (resourceCode && isResourceCodeTaken(resourceCode, domainId)) {
      return appfetch.error(
        {
          code: 'RESOURCE_CODE_TAKEN',
          message: `Mã resource "${resourceCode}" đã tồn tại trong domain này`,
        },
        409,
      );
    }

    const resource = createResourceFromBody(body);
    return appfetch.json(buildResourceDetails(resource));
  },
});

// ─── PUT /registry/resources/:id ──────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/resources\/[^/?]+$/,
  method: 'PUT',
  handler: async (input, init) => {
    const id = extractIdFromUrl(toUrl(input), 'resources');
    const resource = getResourceOrNotFound(id);
    if (resource instanceof Response) return resource;

    const body = await parseBody(input, init);
    const domainId =
      typeof body.domainId === 'string' ? body.domainId : resource.domainId;
    const resourceCode =
      typeof body.resourceCode === 'string'
        ? body.resourceCode
        : resource.resourceCode;

    if (!domainStore.some(d => d.id === domainId)) {
      return appfetch.error(
        { code: 'DOMAIN_NOT_FOUND', message: 'Domain không tồn tại' },
        400,
      );
    }
    if (isResourceCodeTaken(resourceCode, domainId, resource.id)) {
      return appfetch.error(
        {
          code: 'RESOURCE_CODE_TAKEN',
          message: `Mã resource "${resourceCode}" đã tồn tại trong domain này`,
        },
        409,
      );
    }

    mergeResource(resource, body);
    return appfetch.json(buildResourceDetails(resource));
  },
});

// ─── DELETE /registry/resources/:id ─────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/resources\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'resources');
    const index = resourceStore.findIndex(r => r.id === id);
    if (index === -1) {
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy resource' },
        404,
      );
    }
    resourceStore.splice(index, 1);
    return appfetch.empty();
  },
});
