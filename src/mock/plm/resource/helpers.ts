import { v4 as uuidv4 } from 'uuid';
import type { ResourceActionMock, ResourceMock } from './mock-types';
import { resourceStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { getCurrentUserId } from '@/mock/mock-context';
import { buildDomainPreview } from '@/mock/plm/domain/helpers';
import { domainStore } from '@/mock/plm/domain/stores';

export const RESOURCE_ACTION_PATTERN = /^[A-Z][A-Z0-9_]*$/;

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

// Body `actions` hợp lệ: mảng string đúng UPPER_SNAKE_CASE. Trả về danh sách đã
// bỏ trùng, hoặc `null` nếu sai định dạng.
export function parseActionsBody(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const actions = value.map(item => (typeof item === 'string' ? item : ''));
  if (actions.some(action => !RESOURCE_ACTION_PATTERN.test(action)))
    return null;
  return Array.from(new Set(actions));
}

export function invalidActionsError() {
  return appfetch.error(
    {
      code: 'INVALID_ACTION',
      message: 'Action phải viết hoa dạng UPPER_SNAKE_CASE (VD: VIEW)',
    },
    400,
  );
}

// Thay toàn bộ danh sách action — action giữ nguyên thì giữ nguyên `id`.
export function replaceResourceActions(
  resource: ResourceMock,
  actions: string[],
) {
  const current = new Map(resource.actions.map(a => [a.action, a]));
  resource.actions = actions.map(
    action => current.get(action) ?? { id: uuidv4(), action },
  );
}

export function addResourceAction(
  resource: ResourceMock,
  action: string,
): ResourceActionMock | null {
  if (resource.actions.some(a => a.action === action)) return null;
  const item = { id: uuidv4(), action };
  resource.actions.push(item);
  return item;
}

export function sortedActionCodes(resource: ResourceMock) {
  return resource.actions.map(a => a.action).sort();
}

export function buildResourceDetails(resource: ResourceMock) {
  const domain = domainStore.find(d => d.id === resource.domainId);
  return {
    ...resource,
    actions: sortedActionCodes(resource),
    domain: domain ? buildDomainPreview(domain) : undefined,
  };
}

export function buildResourcePreview(resource: ResourceMock) {
  return {
    id: resource.id,
    resourceCode: resource.resourceCode,
    name: resource.name,
    domainId: resource.domainId,
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
    actions: (parseActionsBody(body.actions) ?? []).map(action => ({
      id: uuidv4(),
      action,
    })),
  };

  resourceStore.unshift(resource);
  return resource;
}

export function mergeResource(
  resource: ResourceMock,
  body: Record<string, unknown>,
) {
  const { actions, ...rest } = body;
  delete rest.domain;
  delete rest.id;
  Object.assign(resource, rest);
  const parsed = actions === undefined ? null : parseActionsBody(actions);
  if (parsed) replaceResourceActions(resource, parsed);
  resource.modifiedOnUtc = new Date().toISOString();
  resource.modifiedBy = getCurrentUserId();
  return resource;
}

/** Xoá resource (kèm toàn bộ action) theo điều kiện. Trả về số đã xoá. */
export function removeResourcesWhere(predicate: (r: ResourceMock) => boolean) {
  let resources = 0;
  let actions = 0;
  for (let i = resourceStore.length - 1; i >= 0; i--) {
    if (!predicate(resourceStore[i])) continue;
    actions += resourceStore[i].actions.length;
    resources += 1;
    resourceStore.splice(i, 1);
  }
  return { resources, actions };
}
