import React from 'react';
import type { FieldPath, FieldPathValue, UseFormReturn } from 'react-hook-form';
import { GeneralSetting } from '../../types/general';

export interface GeneralSettingContextProps {
  inlineEdit: boolean;

  data?: GeneralSetting;
  form: UseFormReturn<GeneralSetting, unknown, GeneralSetting>;

  readLoading?: boolean;
  updateLoading?: boolean;

  update<TName extends FieldPath<GeneralSetting> = FieldPath<GeneralSetting>>(
    name: TName,
    value: FieldPathValue<GeneralSetting, TName>,
  ): void;
  editingFieldName?: FieldPath<GeneralSetting>;
}

export const defaultValue: GeneralSettingContextProps = {
  inlineEdit: false,
  form: {} as UseFormReturn<GeneralSetting, unknown, GeneralSetting>,

  update: () => {},
};

export const GeneralSettingContext =
  React.createContext<GeneralSettingContextProps | null>(null);

export const useGeneralSettingContext = () => {
  const context = React.useContext(GeneralSettingContext);
  if (!context)
    throw new Error(
      'useGeneralSettingContext must be used inside GeneralSettingContext.Provider',
    );
  return context;
};
