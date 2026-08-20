import React from 'react';
import type { FieldPath, FieldPathValue, UseFormReturn } from 'react-hook-form';
import { BrandingSetting } from '../../types/branding';

export interface BrandingSettingContextProps {
  inlineEdit: boolean;

  data?: BrandingSetting;
  form: UseFormReturn<BrandingSetting, unknown, BrandingSetting>;

  readLoading?: boolean;
  updateLoading?: boolean;

  update<TName extends FieldPath<BrandingSetting> = FieldPath<BrandingSetting>>(
    name: TName,
    value: FieldPathValue<BrandingSetting, TName>,
  ): void;
  editingFieldName?: FieldPath<BrandingSetting>;
}

export const defaultValue: BrandingSettingContextProps = {
  inlineEdit: false,
  form: {} as UseFormReturn<BrandingSetting, unknown, BrandingSetting>,

  update: () => {},
};

export const BrandingSettingContext =
  React.createContext<BrandingSettingContextProps | null>(null);

export const useBrandingSettingContext = () => {
  const context = React.useContext(BrandingSettingContext);
  if (!context)
    throw new Error(
      'useBrandingSettingContext must be used inside BrandingSettingContext.Provider',
    );
  return context;
};
