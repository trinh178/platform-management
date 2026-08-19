import React from 'react';
import type {
  DeepPartial,
  FieldPath,
  FieldPathValue,
  UseFormReturn,
} from 'react-hook-form';
import { Employee } from '../../types/employee';
import { CRUDMode } from '@/shared/types/crud';

export interface EmployeeCRUDContextProps {
  mode: CRUDMode;
  setMode: (mode: CRUDMode) => void;
  inlineEdit: boolean;

  data?: Employee;
  form: UseFormReturn<Employee, unknown, Employee>;

  createLoading?: boolean;
  readLoading?: boolean;
  updateLoading?: boolean;
  deleteLoading?: boolean;

  update<TName extends FieldPath<Employee> = FieldPath<Employee>>(
    name: TName,
    value: FieldPathValue<Employee, TName>,
    payload?: DeepPartial<Employee>,
  ): void;
  editingFieldName?: FieldPath<Employee>;

  remove: () => void;
}

export const defaultValue: EmployeeCRUDContextProps = {
  mode: 'READ',
  setMode: () => {},
  inlineEdit: false,
  form: {} as UseFormReturn<Employee, unknown, Employee>,

  update: () => {},
  remove: () => {},
};

export const EmployeeCRUDContext =
  React.createContext<EmployeeCRUDContextProps | null>(null);

export const useEmployeeCRUDContext = () => {
  const context = React.useContext(EmployeeCRUDContext);
  if (!context)
    throw new Error(
      'useEmployeeCRUDContext must be used inside EmployeeCRUDContext.Provider',
    );
  return context;
};
