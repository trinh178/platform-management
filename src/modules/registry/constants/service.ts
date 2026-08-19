import { ServiceStatus } from '../types/service';
import { ConstantBase } from '@/core/constants';

export const CONST_SERVICE_STATUS: ConstantBase<
  ServiceStatus,
  { className: string }
>[] = [
  {
    label: 'registry.service.constants.status.active',
    value: 'Active',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  },
  {
    label: 'registry.service.constants.status.inactive',
    value: 'Inactive',
    className: 'border-border bg-muted text-muted-foreground',
  },
  {
    label: 'registry.service.constants.status.deprecated',
    value: 'Deprecated',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  },
] as const;
