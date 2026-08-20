import React from 'react';
import type { FieldPath, FieldPathValue, UseFormReturn } from 'react-hook-form';
import { OrganizationSetting } from '../../types/organization';

export interface OrganizationSettingContextProps {
  inlineEdit: boolean;

  data?: OrganizationSetting;
  form: UseFormReturn<OrganizationSetting, unknown, OrganizationSetting>;

  readLoading?: boolean;
  updateLoading?: boolean;

  update<
    TName extends FieldPath<OrganizationSetting> =
      FieldPath<OrganizationSetting>,
  >(
    name: TName,
    value: FieldPathValue<OrganizationSetting, TName>,
  ): void;
  editingFieldName?: FieldPath<OrganizationSetting>;
}

export const defaultValue: OrganizationSettingContextProps = {
  inlineEdit: false,
  form: {} as UseFormReturn<OrganizationSetting, unknown, OrganizationSetting>,

  update: () => {},
};

export const OrganizationSettingContext =
  React.createContext<OrganizationSettingContextProps | null>(null);

export const useOrganizationSettingContext = () => {
  const context = React.useContext(OrganizationSettingContext);
  if (!context)
    throw new Error(
      'useOrganizationSettingContext must be used inside OrganizationSettingContext.Provider',
    );
  return context;
};
