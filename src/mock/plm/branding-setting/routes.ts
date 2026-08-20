import { buildBrandingSettingDetails, mergeBrandingSetting } from './helpers';
import { brandingSettingStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { parseBody } from '@/core/network/mock-utils';
import plmHttpRequest from '@/core/network/plm-http-request';

// ─── GET /settings/branding ─────────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/settings\/branding$/,
  method: 'GET',
  handler: () =>
    appfetch.json(buildBrandingSettingDetails(brandingSettingStore)),
});

// ─── PUT /settings/branding ─────────────────────────────────────────────────
// Singleton — không có POST/DELETE, chỉ view/update.
plmHttpRequest.addMockRoute({
  url: /\/settings\/branding$/,
  method: 'PUT',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    mergeBrandingSetting(brandingSettingStore, body);
    return appfetch.json(buildBrandingSettingDetails(brandingSettingStore));
  },
});
