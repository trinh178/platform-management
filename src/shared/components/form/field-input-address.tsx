'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';
import { type AddressCode, AddressPicker } from '@/shared/components/address';

type InputProps = Omit<
  React.ComponentProps<typeof AddressPicker>,
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'readOnly'
  | 'disabled'
  | 'error'
  | 'inputClassName'
  | 'inputStyle'
  | 'controlStyle'
  | 'controlClassName'
  | 'popupOpen'
  | 'onPopupOpen'
>;

interface FieldInputAddressExtendsProps {
  inputProps?: InputProps;
}

export type FieldInputAddressProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputAddressExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputAddress<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputAddressProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return (
    <FieldInputBase {...props} RenderComponent={FieldInputAddressRender} />
  );
}

function FieldInputAddressRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { inputProps, disabled, placeholder },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
  componentControlStyle,
  componentControlClassName,
  componentInputStyle,
}: FieldInputRenderProps<
  FieldInputAddressExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const [openPopup, setOpenPopup] = React.useState(false);

  useFieldEditCallback(onEditRef, () => setOpenPopup(true));

  return (
    <AddressPicker
      {...inputProps}
      placeholder={placeholder ?? inputProps?.placeholder}
      value={currentValue as AddressCode | null | undefined}
      onChange={(_, addressCode) =>
        handleValueChange(addressCode as TFieldPathValue)
      }
      readOnly={readOnly}
      disabled={disabled}
      error={isError}
      inputClassName={getInputClassName('pe-0')}
      inputStyle={componentInputStyle}
      controlStyle={componentControlStyle}
      controlClassName={componentControlClassName}
      popupOpen={openPopup}
      onPopupOpen={setOpenPopup}
    />
  );
}
