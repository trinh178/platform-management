import { v4 as uuidv4 } from 'uuid';
import type { ResourceMock } from './mock-types';
import { resourceStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { getCurrentUserId } from '@/mock/mock-context';
import { buildDomainPreview } from '@/mock/plm/domain/helpers';
import { domainStore } from '@/mock/plm/domain/stores';

export function getResourceOrNotFound(id?: string | null) {
  const resource = resourceStore.find(r => r.id === id);
  if (!resource) {
    return appfetch.error(
      { code: 'NOT_FOUND', message: 'Không tìm thấy resource' },
      404,
    );
  }
  return resource;
}

export function isResourceCodeTaken(
  resourceCode: string,
  domainId: string,
  excludeId?: string,
) {
  return resourceStore.some(
    r =>
      r.resourceCode === resourceCode &&
      r.domainId === domainId &&
      r.id !== excludeId,
  );
}

export function buildResourceDetails(resource: ResourceMock) {
  const domain = domainStore.find(d => d.id === resource.domainId);
  return {
    ...resource,
    domain: domain ? buildDomainPreview(domain) : undefined,
  };
}

export function createResourceFromBody(
  body: Record<string, unknown>,
): ResourceMock {
  const id = uuidv4();
  const nowIso = new Date().toISOString();

  const resource: ResourceMock = {
    id,
    createdBy: getCurrentUserId(),
    createdOnUtc: nowIso,
    modifiedBy: getCurrentUserId(),
    modifiedOnUtc: nowIso,
    domainId: typeof body.domainId === 'string' ? body.domainId : '',
    resourceCode:
      typeof body.resourceCode === 'string' ? body.resourceCode : '',
    name: typeof body.name === 'string' ? body.name : '',
    description:
      typeof body.description === 'string' ? body.description : undefined,
  };

  resourceStore.unshift(resource);
  return resource;
}

export function mergeResource(
  resource: ResourceMock,
  body: Record<string, unknown>,
) {
  Object.assign(resource, body);
  resource.modifiedOnUtc = new Date().toISOString();
  resource.modifiedBy = getCurrentUserId();
  return resource;
}
