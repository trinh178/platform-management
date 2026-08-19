import { Table2 } from 'lucide-react';
import DataTableGuidePage from './pages/datatable-guide.page';
import routePaths from './route-paths';
import { AppModuleProps } from '@/types/core.types';

const datatableGuideModule: AppModuleProps = {
  route: {
    key: 'datatable-guide',
    path: routePaths.datatableGuide,
    title: 'datatableGuide.title',
    icon: <Table2 />,
    Component: DataTableGuidePage,
    permission: {
      permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW'],
    },
    navMenu: {
      enable: true,
      groupLabel: ['app_shell.nav_menu.group.developer'],
    },
  },
  importI18n: locale => async () =>
    (await import(`@/modules/datatable-guide/i18n/${locale}.json`)).default,
};

export default datatableGuideModule;
