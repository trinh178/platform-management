import React from 'react';
import type { FieldPath, FieldPathValue, UseFormReturn } from 'react-hook-form';
import { LocalizationSetting } from '../../types/localization';

export interface LocalizationSettingContextProps {
  inlineEdit: boolean;

  data?: LocalizationSetting;
  form: UseFormReturn<LocalizationSetting, unknown, LocalizationSetting>;

  readLoading?: boolean;
  updateLoading?: boolean;

  update<
    TName extends FieldPath<LocalizationSetting> =
      FieldPath<LocalizationSetting>,
  >(
    name: TName,
    value: FieldPathValue<LocalizationSetting, TName>,
  ): void;
  editingFieldName?: FieldPath<LocalizationSetting>;
}

export const defaultValue: LocalizationSettingContextProps = {
  inlineEdit: false,
  form: {} as UseFormReturn<LocalizationSetting, unknown, LocalizationSetting>,

  update: () => {},
};

export const LocalizationSettingContext =
  React.createContext<LocalizationSettingContextProps | null>(null);

export const useLocalizationSettingContext = () => {
  const context = React.useContext(LocalizationSettingContext);
  if (!context)
    throw new Error(
      'useLocalizationSettingContext must be used inside LocalizationSettingContext.Provider',
    );
  return context;
};
