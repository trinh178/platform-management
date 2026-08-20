const generalSettingKeys = {
  all: ['general-setting'] as const,
  details: () => [...generalSettingKeys.all, 'details'] as const,
};

export default generalSettingKeys;
