import React from 'react';
import type {
  DeepPartial,
  FieldPath,
  FieldPathValue,
  UseFormReturn,
} from 'react-hook-form';
import { Service } from '../../types/service';
import { CRUDMode } from '@/shared/types/crud';

export interface ServiceCRUDContextProps {
  mode: CRUDMode;
  setMode: (mode: CRUDMode) => void;
  inlineEdit: boolean;

  data?: Service;
  form: UseFormReturn<Service, unknown, Service>;

  createLoading?: boolean;
  readLoading?: boolean;
  updateLoading?: boolean;
  deleteLoading?: boolean;

  update<TName extends FieldPath<Service> = FieldPath<Service>>(
    name: TName,
    value: FieldPathValue<Service, TName>,
    payload?: DeepPartial<Service>,
  ): void;
  editingFieldName?: FieldPath<Service>;

  remove: () => void;
}

export const defaultValue: ServiceCRUDContextProps = {
  mode: 'READ',
  setMode: () => {},
  inlineEdit: false,
  form: {} as UseFormReturn<Service, unknown, Service>,

  update: () => {},
  remove: () => {},
};

export const ServiceCRUDContext =
  React.createContext<ServiceCRUDContextProps | null>(null);

export const useServiceCRUDContext = () => {
  const context = React.useContext(ServiceCRUDContext);
  if (!context)
    throw new Error(
      'useServiceCRUDContext must be used inside ServiceCRUDContext.Provider',
    );
  return context;
};
