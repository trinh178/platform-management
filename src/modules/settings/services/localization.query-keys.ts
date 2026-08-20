const localizationSettingKeys = {
  all: ['localization-setting'] as const,
  details: () => [...localizationSettingKeys.all, 'details'] as const,
};

export default localizationSettingKeys;
