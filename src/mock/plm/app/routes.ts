import {
  buildAppPreview,
  createAppFromBody,
  getAppOrNotFound,
  isAppCodeTaken,
  mergeApp,
} from './helpers';
import type { AppMock } from './mock-types';
import { appStore } from './stores';
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

function searchApp(app: AppMock, searchTerm: string) {
  return [app.appCode, app.name, app.description]
    .filter(Boolean)
    .some(value => value!.toLowerCase().includes(searchTerm));
}

function filterApp(app: AppMock, filter: MockListFilter) {
  if (filter.field === 'appCode')
    return matchFilterOperator(app.appCode, filter);
  if (filter.field === 'status') return matchFilterOperator(app.status, filter);
  return true;
}

// ─── GET /registry/apps (list) ────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/apps(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    return appfetch.json(
      buildMockListResponse({
        sp,
        items: appStore,
        search: searchApp,
        filter: filterApp,
        defaultSort: [{ field: 'createdOnUtc', direction: 'Descending' }],
      }),
    );
  },
});

// ─── GET /registry/apps/options (specific — must be BEFORE /:id) ────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/apps\/options(\?.*)?$/,
  method: 'GET',
  handler: input => {
    const sp = new URL(toUrl(input)).searchParams;
    const keyword = sp.get('keyword')?.trim().toLowerCase();
    const items = appStore
      .filter(a => a.status === 'Active')
      .filter(
        a =>
          !keyword ||
          a.appCode.toLowerCase().includes(keyword) ||
          a.name.toLowerCase().includes(keyword),
      )
      .map(buildAppPreview);
    return appfetch.json(items);
  },
});

// ─── GET /registry/apps/:id ─────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/apps\/[^/?]+$/,
  method: 'GET',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'apps');
    const app = getAppOrNotFound(id);
    if (app instanceof Response) return app;
    return appfetch.json(app);
  },
});

// ─── POST /registry/apps ─────────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/apps$/,
  method: 'POST',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    const appCode = typeof body.appCode === 'string' ? body.appCode : '';
    if (appCode && isAppCodeTaken(appCode)) {
      return appfetch.error(
        {
          code: 'APP_CODE_TAKEN',
          message: `Mã ứng dụng "${appCode}" đã tồn tại`,
        },
        409,
      );
    }
    const app = createAppFromBody(body);
    return appfetch.json(app);
  },
});

// ─── PUT /registry/apps/:id ───────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/apps\/[^/?]+$/,
  method: 'PUT',
  handler: async (input, init) => {
    const id = extractIdFromUrl(toUrl(input), 'apps');
    const app = getAppOrNotFound(id);
    if (app instanceof Response) return app;

    const body = await parseBody(input, init);
    const appCode = typeof body.appCode === 'string' ? body.appCode : undefined;
    if (appCode && isAppCodeTaken(appCode, app.id)) {
      return appfetch.error(
        {
          code: 'APP_CODE_TAKEN',
          message: `Mã ứng dụng "${appCode}" đã tồn tại`,
        },
        409,
      );
    }

    mergeApp(app, body);
    return appfetch.json(app);
  },
});

// ─── DELETE /registry/apps/:id ────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/registry\/apps\/[^/?]+$/,
  method: 'DELETE',
  handler: input => {
    const id = extractIdFromUrl(toUrl(input), 'apps');
    const index = appStore.findIndex(a => a.id === id);
    if (index === -1) {
      return appfetch.error(
        { code: 'NOT_FOUND', message: 'Không tìm thấy ứng dụng' },
        404,
      );
    }
    appStore.splice(index, 1);
    return appfetch.empty();
  },
});
