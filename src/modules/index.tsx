import datatableGuideModule from './datatable-guide';
import employeeModule from './employee'; // Module mẫu
import formGuideModule from './form-guide';
import appBrandingModule from './foundation/app-branding';
import appShellModule from './foundation/app-shell';
import commonModule from './foundation/common';
import identityModule from './foundation/identity';
import sharedComponentsModule from './foundation/shared-components';
import validationModule from './foundation/validation';
import registryModule from './registry';
import { AppModuleProps } from '@/types/core.types';

const modules: AppModuleProps[] = [
  appBrandingModule,
  appShellModule,
  commonModule,
  identityModule,
  sharedComponentsModule,
  validationModule,
  employeeModule,
  registryModule,
  ...(process.env.NODE_ENV === 'development'
    ? [formGuideModule, datatableGuideModule]
    : []),
];

export default modules;
