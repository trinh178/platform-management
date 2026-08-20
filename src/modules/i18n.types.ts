import datatableGuide from '@/modules/datatable-guide/i18n/vi.json';
import employee from '@/modules/employee/i18n/vi.json';
import formGuide from '@/modules/form-guide/i18n/vi.json';
import app from '@/modules/foundation/app-branding/i18n/vi.json';
import appShell from '@/modules/foundation/app-shell/i18n/vi.json';
import common from '@/modules/foundation/common/i18n/vi.json';
import identity from '@/modules/foundation/identity/i18n/vi.json';
import sharedComponents from '@/modules/foundation/shared-components/i18n/vi.json';
import validation from '@/modules/foundation/validation/i18n/vi.json';
import registry from '@/modules/registry/i18n/vi.json';
import settings from '@/modules/settings/i18n/vi.json';

export type I18nMessagesType = typeof app &
  typeof appShell &
  typeof common &
  typeof identity &
  typeof sharedComponents &
  typeof validation &
  typeof formGuide &
  typeof datatableGuide &
  typeof employee &
  typeof registry &
  typeof settings;
