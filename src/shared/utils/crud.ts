import type { TranslationsFn } from '@/core/i18n/types';
import type { CRUDMode } from '@/shared/types/crud';

export interface CRUDActionLabelOptions {
  createAction?: 'add' | 'create';
  readAction?: 'view' | 'details';
}

export function getCRUDActionLabel(
  t: TranslationsFn,
  mode: CRUDMode,
  options: CRUDActionLabelOptions = {},
) {
  switch (mode) {
    case 'CREATE':
      return t(
        options.createAction === 'create'
          ? 'common.control.create'
          : 'common.control.add',
      );
    case 'READ':
      return t(
        options.readAction === 'details'
          ? 'common.control.details'
          : 'common.control.view',
      );
    case 'UPDATE':
      return t('common.control.edit');
    case 'DELETE':
      return t('common.control.delete');
  }

  const exhaustiveMode: never = mode;
  return exhaustiveMode;
}

export function getCRUDDialogTitle(
  t: TranslationsFn,
  mode: CRUDMode,
  entityLabel?: string,
  options?: CRUDActionLabelOptions,
) {
  const actionLabel = getCRUDActionLabel(t, mode, options);

  return entityLabel ? `${actionLabel} ${entityLabel}` : actionLabel;
}
