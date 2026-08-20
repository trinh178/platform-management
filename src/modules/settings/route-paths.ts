const routePaths = {
  settings: '/settings', // root absolute — redirect page
  organization: '/organization', // relative child
  general: '/general',
  localization: '/localization',
  branding: '/branding',
  settingsOrganization: '/settings/organization', // absolute
  settingsGeneral: '/settings/general',
  settingsLocalization: '/settings/localization',
  settingsBranding: '/settings/branding',
} as const;

export default routePaths;
