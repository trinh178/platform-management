import React from 'react';
import type {
  DeepPartial,
  FieldPath,
  FieldPathValue,
  UseFormReturn,
} from 'react-hook-form';
import { Resource } from '../../types/resource';
import { CRUDMode } from '@/shared/types/crud';

export interface ResourceCRUDContextProps {
  mode: CRUDMode;
  setMode: (mode: CRUDMode) => void;
  inlineEdit: boolean;

  data?: Resource;
  form: UseFormReturn<Resource, unknown, Resource>;

  createLoading?: boolean;
  readLoading?: boolean;
  updateLoading?: boolean;
  deleteLoading?: boolean;

  update<TName extends FieldPath<Resource> = FieldPath<Resource>>(
    name: TName,
    value: FieldPathValue<Resource, TName>,
    payload?: DeepPartial<Resource>,
  ): void;
  editingFieldName?: FieldPath<Resource>;

  remove: () => void;
}

export const defaultValue: ResourceCRUDContextProps = {
  mode: 'READ',
  setMode: () => {},
  inlineEdit: false,
  form: {} as UseFormReturn<Resource, unknown, Resource>,

  update: () => {},
  remove: () => {},
};

export const ResourceCRUDContext =
  React.createContext<ResourceCRUDContextProps | null>(null);

export const useResourceCRUDContext = () => {
  const context = React.useContext(ResourceCRUDContext);
  if (!context)
    throw new Error(
      'useResourceCRUDContext must be used inside ResourceCRUDContext.Provider',
    );
  return context;
};
