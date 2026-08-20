import { v4 as uuidv4 } from 'uuid';
import type { ServiceMock } from './mock-types';
import { serviceStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { getCurrentUserId } from '@/mock/mock-context';

export function getServiceOrNotFound(id?: string | null) {
  const service = serviceStore.find(s => s.id === id);
  if (!service) {
    return appfetch.error(
      { code: 'NOT_FOUND', message: 'Không tìm thấy service' },
      404,
    );
  }
  return service;
}

export function isServiceCodeTaken(serviceCode: string, excludeId?: string) {
  return serviceStore.some(
    s => s.serviceCode === serviceCode && s.id !== excludeId,
  );
}

export function buildServicePreview(service: ServiceMock) {
  return {
    id: service.id,
    serviceCode: service.serviceCode,
    name: service.name,
    status: service.status,
  };
}

export function createServiceFromBody(
  body: Record<string, unknown>,
): ServiceMock {
  const id = uuidv4();
  const nowIso = new Date().toISOString();

  const service: ServiceMock = {
    id,
    createdBy: getCurrentUserId(),
    createdOnUtc: nowIso,
    modifiedBy: getCurrentUserId(),
    modifiedOnUtc: nowIso,
    serviceCode: typeof body.serviceCode === 'string' ? body.serviceCode : '',
    name: typeof body.name === 'string' ? body.name : '',
    description:
      typeof body.description === 'string' ? body.description : undefined,
    version: typeof body.version === 'string' ? body.version : undefined,
    status:
      body.status === 'Inactive' || body.status === 'Deprecated'
        ? body.status
        : 'Active',
    metadata: typeof body.metadata === 'string' ? body.metadata : undefined,
  };

  serviceStore.unshift(service);
  return service;
}

export function mergeService(
  service: ServiceMock,
  body: Record<string, unknown>,
) {
  Object.assign(service, body);
  service.modifiedOnUtc = new Date().toISOString();
  service.modifiedBy = getCurrentUserId();
  return service;
}
