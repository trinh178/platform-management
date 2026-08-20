import type { GeneralSettingMock } from './mock-types';
import { getCurrentUserId } from '@/mock/mock-context';

export function mergeGeneralSetting(
  setting: GeneralSettingMock,
  body: Record<string, unknown>,
) {
  Object.assign(setting, body);
  setting.modifiedOnUtc = new Date().toISOString();
  setting.modifiedBy = getCurrentUserId();
  return setting;
}
