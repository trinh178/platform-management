import type { BrandingSettingMock } from './mock-types';
import { getCurrentUserId } from '@/mock/mock-context';
import { assetStore } from '@/mock/plm/asset/stores';

function toAssetRef(assetId?: string) {
  if (!assetId) return undefined;
  const asset = assetStore.find(a => a.id === assetId);
  if (!asset) return undefined;
  return {
    assetId: asset.id,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    url: asset.url,
  };
}

export function buildBrandingSettingDetails(setting: BrandingSettingMock) {
  return {
    ...setting,
    logo: toAssetRef(setting.logoAssetId),
    favicon: toAssetRef(setting.faviconAssetId),
  };
}

export function mergeBrandingSetting(
  setting: BrandingSettingMock,
  body: Record<string, unknown>,
) {
  Object.assign(setting, body);
  setting.modifiedOnUtc = new Date().toISOString();
  setting.modifiedBy = getCurrentUserId();
  return setting;
}
