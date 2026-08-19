import { v4 as uuidv4 } from 'uuid';
import type { DomainMock } from './mock-types';
import { domainStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { getCurrentUserId } from '@/mock/mock-context';
import { buildServicePreview } from '@/mock/plm/service/helpers';
import { serviceStore } from '@/mock/plm/service/stores';

export function getDomainOrNotFound(id?: string | null) {
  const domain = domainStore.find(d => d.id === id);
  if (!domain) {
    return appfetch.error(
      { code: 'NOT_FOUND', message: 'Không tìm thấy domain' },
      404,
    );
  }
  return domain;
}

export function isDomainCodeTaken(
  domainCode: string,
  serviceId: string,
  excludeId?: string,
) {
  return domainStore.some(
    d =>
      d.domainCode === domainCode &&
      d.serviceId === serviceId &&
      d.id !== excludeId,
  );
}

export function buildDomainDetails(domain: DomainMock) {
  const service = serviceStore.find(s => s.id === domain.serviceId);
  return {
    ...domain,
    service: service ? buildServicePreview(service) : undefined,
  };
}

export function buildDomainPreview(domain: DomainMock) {
  return {
    id: domain.id,
    domainCode: domain.domainCode,
    name: domain.name,
    serviceId: domain.serviceId,
  };
}

export function createDomainFromBody(
  body: Record<string, unknown>,
): DomainMock {
  const id = uuidv4();
  const nowIso = new Date().toISOString();

  const domain: DomainMock = {
    id,
    createdBy: getCurrentUserId(),
    createdOnUtc: nowIso,
    modifiedBy: getCurrentUserId(),
    modifiedOnUtc: nowIso,
    serviceId: typeof body.serviceId === 'string' ? body.serviceId : '',
    domainCode: typeof body.domainCode === 'string' ? body.domainCode : '',
    name: typeof body.name === 'string' ? body.name : '',
    description:
      typeof body.description === 'string' ? body.description : undefined,
    status:
      body.status === 'Inactive' || body.status === 'Deprecated'
        ? body.status
        : 'Active',
    note: typeof body.note === 'string' ? body.note : undefined,
  };

  domainStore.unshift(domain);
  return domain;
}

export function mergeDomain(domain: DomainMock, body: Record<string, unknown>) {
  Object.assign(domain, body);
  domain.modifiedOnUtc = new Date().toISOString();
  domain.modifiedBy = getCurrentUserId();
  return domain;
}
