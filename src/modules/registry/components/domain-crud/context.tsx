import React from 'react';
import type {
  DeepPartial,
  FieldPath,
  FieldPathValue,
  UseFormReturn,
} from 'react-hook-form';
import { Domain } from '../../types/domain';
import { CRUDMode } from '@/shared/types/crud';

export interface DomainCRUDContextProps {
  mode: CRUDMode;
  setMode: (mode: CRUDMode) => void;
  inlineEdit: boolean;

  data?: Domain;
  form: UseFormReturn<Domain, unknown, Domain>;

  createLoading?: boolean;
  readLoading?: boolean;
  updateLoading?: boolean;
  deleteLoading?: boolean;

  update<TName extends FieldPath<Domain> = FieldPath<Domain>>(
    name: TName,
    value: FieldPathValue<Domain, TName>,
    payload?: DeepPartial<Domain>,
  ): void;
  editingFieldName?: FieldPath<Domain>;

  remove: () => void;
}

export const defaultValue: DomainCRUDContextProps = {
  mode: 'READ',
  setMode: () => {},
  inlineEdit: false,
  form: {} as UseFormReturn<Domain, unknown, Domain>,

  update: () => {},
  remove: () => {},
};

export const DomainCRUDContext =
  React.createContext<DomainCRUDContextProps | null>(null);

export const useDomainCRUDContext = () => {
  const context = React.useContext(DomainCRUDContext);
  if (!context)
    throw new Error(
      'useDomainCRUDContext must be used inside DomainCRUDContext.Provider',
    );
  return context;
};
