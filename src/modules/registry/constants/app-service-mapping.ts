import { AppServiceRole } from '../types/app-service-mapping';
import { ConstantBase } from '@/core/constants';

export const DEFAULT_APP_SERVICE_ROLE: AppServiceRole = 'Dependency';

export const CONST_APP_SERVICE_ROLE: ConstantBase<
  AppServiceRole,
  { className: string }
>[] = [
  {
    label: 'registry.appServiceMapping.constants.role.primary',
    value: 'Primary',
    className:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
  },
  {
    label: 'registry.appServiceMapping.constants.role.dependency',
    value: 'Dependency',
    className: 'border-border bg-muted text-muted-foreground',
  },
] as const;
