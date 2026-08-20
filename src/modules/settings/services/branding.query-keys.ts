const brandingSettingKeys = {
  all: ['branding-setting'] as const,
  details: () => [...brandingSettingKeys.all, 'details'] as const,
};

export default brandingSettingKeys;
