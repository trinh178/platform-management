import { Settings } from 'lucide-react';
import BrandingSettingPage from './pages/branding-setting.page';
import GeneralSettingPage from './pages/general-setting.page';
import LocalizationSettingPage from './pages/localization-setting.page';
import OrganizationSettingPage from './pages/organization-setting.page';
import SettingsRedirectPage from './pages/settings-redirect.page';
import routePaths from './route-paths';
import { AppModuleProps } from '@/types/core.types';

const settingsModule: AppModuleProps = {
  route: {
    key: 'settings',
    path: routePaths.settings,
    title: 'settings.title',
    icon: <Settings />,
    Component: SettingsRedirectPage,
    permission: {
      permissions: [
        'PLM.SETTINGS.ORGANIZATION.VIEW',
        'PLM.SETTINGS.GENERAL.VIEW',
        'PLM.SETTINGS.LOCALIZATION.VIEW',
        'PLM.SETTINGS.BRANDING.VIEW',
      ],
      permissionsCondition: 'ANY',
    },
    navMenu: {
      enable: true,
      groupLabel: ['app_shell.nav_menu.group.setting'],
    },
    children: [
      {
        key: 'settings-organization',
        path: routePaths.organization,
        title: 'settings.organization.title',
        permission: { permissions: ['PLM.SETTINGS.ORGANIZATION.VIEW'] },
        navMenu: {
          enable: true,
          groupLabel: ['app_shell.nav_menu.group.setting'],
        },
        Component: OrganizationSettingPage,
      },
      {
        key: 'settings-general',
        path: routePaths.general,
        title: 'settings.general.title',
        permission: { permissions: ['PLM.SETTINGS.GENERAL.VIEW'] },
        navMenu: {
          enable: true,
          groupLabel: ['app_shell.nav_menu.group.setting'],
        },
        Component: GeneralSettingPage,
      },
      {
        key: 'settings-localization',
        path: routePaths.localization,
        title: 'settings.localization.title',
        permission: { permissions: ['PLM.SETTINGS.LOCALIZATION.VIEW'] },
        navMenu: {
          enable: true,
          groupLabel: ['app_shell.nav_menu.group.setting'],
        },
        Component: LocalizationSettingPage,
      },
      {
        key: 'settings-branding',
        path: routePaths.branding,
        title: 'settings.branding.title',
        permission: { permissions: ['PLM.SETTINGS.BRANDING.VIEW'] },
        navMenu: {
          enable: true,
          groupLabel: ['app_shell.nav_menu.group.setting'],
        },
        Component: BrandingSettingPage,
      },
    ],
  },
  importI18n: locale => async () =>
    (await import(`@/modules/settings/i18n/${locale}.json`)).default,
};

export default settingsModule;
