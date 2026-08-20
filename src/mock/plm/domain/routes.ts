import {
  buildDomainDetails,
  buildDomainPreview,
  createDomainFromBody,
  getDomainOrNotFound,
  isDomainCodeTaken,
  mergeDomain,
} from './helpers';
import type { DomainMock } from './mock-types';
import { domainStore } from './stores';
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
import { serviceStore } from '@/mock/plm/service/stores';

function searchDomain(domain: DomainMock, searchTerm: string) {
  return [domain.domainCode, domain.name, domain.description]
    .filter(Boolean)
    .some(value => value!.toLowerCase().includes(searchTerm));
}

function filterDomain(domain: DomainMock, filter: MockListFilter) {
  if (filter.field === 'domainCode')
    return matchFilterOperator(domain.domainCode, filter);
  if (filter.field === 'serviceId')
    return matchFilterOperator(domain.serviceId, filter);
  return true;
}

// ─── GET /registry/domains (list) ──────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/domains(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: domainStore,
        search: searchDomain,
        filter: filterDomain,
        mapItem: buildDomainDetails,
        defaultSort: [{ field: 'createdOnUtc', direction: 'Descending' }],
      }),
    );
  },
});

// ─── GET /registry/domains/options (specific — must be BEFORE /:id) ─────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/domains\/options(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    const serviceId = sp.get('serviceId') || undefined;
    const keyword = sp.get('keyword')?.trim().toLowerCase();
    const items = domainStore
      .filter(d => !serviceId || d.serviceId === serviceId)
      .filter(
        d =>
          !keyword ||
          d.domainCode.toLowerCase().includes(keyword) ||
          d.name.toLowerCase().includes(keyword),
      )
      .map(buildDomainPreview);
    return appfetch.json(items);
  },
});

// ─── GET /registry/domains/:id ────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/domains\/[^/?]+$/,
  method: 'GET',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'domains');
    const domain = getDomainOrNotFound(id);
    if (domain instanceof Response) return domain;
    return appfetch.json(buildDomainDetails(domain));
  },
});

// ─── POST /registry/domains ─────────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/domains$/,
  method: 'POST',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    const serviceId = typeof body.serviceId === 'string' ? body.serviceId : '';
    const domainCode =
      typeof body.domainCode === 'string' ? body.domainCode : '';

    if (!serviceId || !serviceStore.some(s => s.id === serviceId)) {
      return appfetch.error(
        { code: 'SERVICE_NOT_FOUND', message: 'Service không tồn tại' },
        400,
      );
    }
    if (domainCode && isDomainCodeTaken(domainCode, serviceId)) {
      return appfetch.error(
        {
          code: 'DOMAIN_CODE_TAKEN',
          message: `Mã domain "${domainCode}" đã tồn tại trong service này`,
        },
        409,
      );
    }

    const domain = createDomainFromBody(body);
    return appfetch.json(buildDomainDetails(domain));
  },
});

// ─── PUT /registry/domains/:id ─────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/domains\/[^/?]+$/,
  method: 'PUT',
  handler: async (input, init) => {
    const id = extractIdFromUrl(toUrl(input), 'domains');
    const domain = getDomainOrNotFound(id);
    if (domain instanceof Response) return domain;

    const body = await parseBody(input, init);
    const serviceId =
      typeof body.serviceId === 'string' ? body.serviceId : domain.serviceId;
    const domainCode =
      typeof body.domainCode === 'string' ? body.domainCode : domain.domainCode;

    if (!serviceStore.some(s => s.id === serviceId)) {
      return appfetch.error(
        { code: 'SERVICE_NOT_FOUND', message: 'Service không tồn tại' },
        400,
      );
    }
    if (isDomainCodeTaken(domainCode, serviceId, domain.id)) {
      return appfetch.error(
        {
          code: 'DOMAIN_CODE_TAKEN',
          message: `Mã domain "${domainCode}" đã tồn tại trong service này`,
        },
        409,
      );
    }

    mergeDomain(domain, body);
    return appfetch.json(buildDomainDetails(domain));
  },
});

// ─── DELETE /registry/domains/:id ────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/domains\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'domains');
    const index = domainStore.findIndex(d => d.id === id);
    if (index === -1) {
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy domain' },
        404,
      );
    }
    domainStore.splice(index, 1);
    return appfetch.empty();
  },
});
