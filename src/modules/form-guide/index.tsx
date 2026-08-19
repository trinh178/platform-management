import { BookOpenText } from 'lucide-react';
import FormGuidePage from './pages/form-guide.page';
import routePaths from './route-paths';
import { AppModuleProps } from '@/types/core.types';

const formGuideModule: AppModuleProps = {
  route: {
    key: 'form-guide',
    path: routePaths.formGuide,
    title: 'formGuide.title',
    icon: <BookOpenText />,
    Component: FormGuidePage,
    permission: {
      permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW'],
    },
    navMenu: {
      enable: true,
      groupLabel: ['app_shell.nav_menu.group.developer'],
    },
  },
  importI18n: locale => async () =>
    (await import(`@/modules/form-guide/i18n/${locale}.json`)).default,
};

export default formGuideModule;
