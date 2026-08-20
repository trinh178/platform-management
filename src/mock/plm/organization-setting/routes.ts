import {
  buildOrganizationSettingDetails,
  mergeOrganizationSetting,
} from './helpers';
import { organizationSettingStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { parseBody } from '@/core/network/mock-utils';
import plmHttpRequest from '@/core/network/plm-http-request';

// ─── GET /settings/organization ────────────────────────────────────────────
plmHttpRequest.addMockRoute({
  url: /\/settings\/organization$/,
  method: 'GET',
  handler: () =>
    appfetch.json(buildOrganizationSettingDetails(organizationSettingStore)),
});

// ─── PUT /settings/organization ────────────────────────────────────────────
// Singleton — không có POST/DELETE, chỉ view/update (xem
// docs.business/domains/settings/domain.yaml#settings_are_seeded_singletons).
plmHttpRequest.addMockRoute({
  url: /\/settings\/organization$/,
  method: 'PUT',
  handler: async (input, init) => {
    const body = await parseBody(input, init);
    mergeOrganizationSetting(organizationSettingStore, body);
    return appfetch.json(
      buildOrganizationSettingDetails(organizationSettingStore),
    );
  },
});
