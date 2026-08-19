import React from 'react';
import type {
  DeepPartial,
  FieldPath,
  FieldPathValue,
  UseFormReturn,
} from 'react-hook-form';
import { App } from '../../types/app';
import { CRUDMode } from '@/shared/types/crud';

export interface AppCRUDContextProps {
  mode: CRUDMode;
  setMode: (mode: CRUDMode) => void;
  inlineEdit: boolean;

  data?: App;
  form: UseFormReturn<App, unknown, App>;

  createLoading?: boolean;
  readLoading?: boolean;
  updateLoading?: boolean;
  deleteLoading?: boolean;

  update<TName extends FieldPath<App> = FieldPath<App>>(
    name: TName,
    value: FieldPathValue<App, TName>,
    payload?: DeepPartial<App>,
  ): void;
  editingFieldName?: FieldPath<App>;

  remove: () => void;
}

export const defaultValue: AppCRUDContextProps = {
  mode: 'READ',
  setMode: () => {},
  inlineEdit: false,
  form: {} as UseFormReturn<App, unknown, App>,

  update: () => {},
  remove: () => {},
};

export const AppCRUDContext = React.createContext<AppCRUDContextProps | null>(
  null,
);

export const useAppCRUDContext = () => {
  const context = React.useContext(AppCRUDContext);
  if (!context)
    throw new Error(
      'useAppCRUDContext must be used inside AppCRUDContext.Provider',
    );
  return context;
};
