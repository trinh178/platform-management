import { mergeGeneralSetting } from './helpers';
import { generalSettingStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { parseBody } from '@/core/network/mock-utils';
import plmHttpRequest from '@/core/network/plm-http-request';

// ─── GET /settings/general ─────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/settings\/general$/,
  method: 'GET',
  handler: () => appfetch.json(generalSettingStore),
});

// ─── PUT /settings/general ─────────────────────────────────────────────────
// Singleton — không có POST/DELETE, chỉ view/update.
plmHttpRequest.addMockRoute({
  url: /\/settings\/general$/,
  method: 'PUT',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    mergeGeneralSetting(generalSettingStore, body);
    return appfetch.json(generalSettingStore);
  },
});
