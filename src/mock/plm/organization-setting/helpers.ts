import type { OrganizationSettingMock } from './mock-types';
import { getCurrentUserId } from '@/mock/mock-context';
import { assetStore } from '@/mock/plm/asset/stores';

export function buildOrganizationSettingDetails(
  setting: OrganizationSettingMock,
) {
  const asset = setting.logoAssetId
    ? assetStore.find(a => a.id === setting.logoAssetId)
    : undefined;

  return {
    ...setting,
    logo: asset
      ? {
          assetId: asset.id,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          url: asset.url,
        }
      : undefined,
  };
}

export function mergeOrganizationSetting(
  setting: OrganizationSettingMock,
  body: Record<string, unknown>,
) {
  Object.assign(setting, body);
  setting.modifiedOnUtc = new Date().toISOString();
  setting.modifiedBy = getCurrentUserId();
  return setting;
}
