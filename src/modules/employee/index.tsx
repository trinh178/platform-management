import { User } from 'lucide-react';
import EmployeesCreatePage from './pages/employees-create.page';
import EmployeesDetailsPage from './pages/employees-details.page';
import EmployeesPage from './pages/employees.page';
import routePaths from './route-paths';
import { AppModuleProps } from '@/types/core.types';

const employeeModule: AppModuleProps = {
  route: {
    key: 'employee',
    path: routePaths.employees,
    title: 'employee.title',
    icon: <User />,
    Component: EmployeesPage,
    permission: {
      permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.VIEW'],
    },
    navMenu: {
      enable: true,
      groupLabel: ['app_shell.nav_menu.group.general'],
    },
    children: [
      {
        key: 'employee-create',
        path: routePaths.create,
        title: 'employee.page.create',
        permission: {
          permissions: ['HRM_EM.EMPLOYEE.EMPLOYEE.CREATE'],
        },
        Component: EmployeesCreatePage,
      },
      {
        key: 'employee-details',
        path: routePaths.details,
        title: 'employee.page.details',
        Component: EmployeesDetailsPage,
      },
    ],
  },
  importI18n: locale => async () =>
    (await import(`@/modules/employee/i18n/${locale}.json`)).default,
};

export default employeeModule;
