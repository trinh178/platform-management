import { v4 as uuidv4 } from 'uuid';
import type { AppServiceMappingMock } from './mock-types';
import { appServiceMappingStore } from './stores';
import { getCurrentUserId } from '@/mock/mock-context';
import { buildAppPreview } from '@/mock/plm/app/helpers';
import { appStore } from '@/mock/plm/app/stores';
import { buildServicePreview } from '@/mock/plm/service/helpers';
import { serviceStore } from '@/mock/plm/service/stores';

export function isMappingTaken(appId: string, serviceId: string) {
  return appServiceMappingStore.some(
    m => m.appId === appId && m.serviceId === serviceId,
  );
}

export function buildMappingDetails(mapping: AppServiceMappingMock) {
  const app = appStore.find(a => a.id === mapping.appId);
  const service = serviceStore.find(s => s.id === mapping.serviceId);
  return {
    ...mapping,
    app: app ? buildAppPreview(app) : undefined,
    service: service ? buildServicePreview(service) : undefined,
  };
}

export function createMappingFromBody(
  body: Record<string, unknown>,
): AppServiceMappingMock {
  const id = uuidv4();
  const nowIso = new Date().toISOString();

  const mapping: AppServiceMappingMock = {
    id,
    createdBy: getCurrentUserId(),
    createdOnUtc: nowIso,
    modifiedBy: getCurrentUserId(),
    modifiedOnUtc: nowIso,
    appId: typeof body.appId === 'string' ? body.appId : '',
    serviceId: typeof body.serviceId === 'string' ? body.serviceId : '',
    note: typeof body.note === 'string' ? body.note : undefined,
  };

  appServiceMappingStore.unshift(mapping);
  return mapping;
}
