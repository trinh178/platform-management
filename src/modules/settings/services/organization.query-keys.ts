const organizationSettingKeys = {
  all: ['organization-setting'] as const,
  details: () => [...organizationSettingKeys.all, 'details'] as const,
};

export default organizationSettingKeys;
