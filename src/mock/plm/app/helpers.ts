import { v4 as uuidv4 } from 'uuid';
import type { AppMock } from './mock-types';
import { appStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { getCurrentUserId } from '@/mock/mock-context';

export function getAppOrNotFound(id?: string | null) {
  const app = appStore.find(a => a.id === id);
  if (!app) {
    return appfetch.error(
      { code: 'NOT_FOUND', message: 'Không tìm thấy ứng dụng' },
      404,
    );
  }
  return app;
}

export function isAppCodeTaken(appCode: string, excludeId?: string) {
  return appStore.some(a => a.appCode === appCode && a.id !== excludeId);
}

export function buildAppPreview(app: AppMock) {
  return {
    id: app.id,
    appCode: app.appCode,
    name: app.name,
    status: app.status,
  };
}

export function createAppFromBody(body: Record<string, unknown>): AppMock {
  const id = uuidv4();
  const nowIso = new Date().toISOString();

  const app: AppMock = {
    id,
    createdBy: getCurrentUserId(),
    createdOnUtc: nowIso,
    modifiedBy: getCurrentUserId(),
    modifiedOnUtc: nowIso,
    appCode: typeof body.appCode === 'string' ? body.appCode : '',
    name: typeof body.name === 'string' ? body.name : '',
    description:
      typeof body.description === 'string' ? body.description : undefined,
    version: typeof body.version === 'string' ? body.version : undefined,
    status:
      body.status === 'Inactive' || body.status === 'Deprecated'
        ? body.status
        : 'Active',
    url: typeof body.url === 'string' ? body.url : undefined,
    iconUrl: typeof body.iconUrl === 'string' ? body.iconUrl : undefined,
    tags: Array.isArray(body.tags)
      ? body.tags.filter((tag): tag is string => typeof tag === 'string')
      : undefined,
    metadata: typeof body.metadata === 'string' ? body.metadata : undefined,
  };

  appStore.unshift(app);
  return app;
}

export function mergeApp(app: AppMock, body: Record<string, unknown>) {
  Object.assign(app, body);
  app.modifiedOnUtc = new Date().toISOString();
  app.modifiedBy = getCurrentUserId();
  return app;
}
