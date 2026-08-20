import type { LocalizationSettingMock } from './mock-types';
import { getCurrentUserId } from '@/mock/mock-context';

export function mergeLocalizationSetting(
  setting: LocalizationSettingMock,
  body: Record<string, unknown>,
) {
  Object.assign(setting, body);
  setting.modifiedOnUtc = new Date().toISOString();
  setting.modifiedBy = getCurrentUserId();
  return setting;
}
