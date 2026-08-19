'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { DatePicker } from '../inputs/date-picker';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

type FieldInputDateExtendsProps = Pick<
  React.ComponentProps<typeof DatePicker>,
  'dateDisabled' | 'placeholder'
>;

export default function FieldInputDate<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputBasePropsExceptRender<
    FieldInputDateExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return <FieldInputBase {...props} RenderComponent={FieldInputDateRender} />;
}

function FieldInputDateRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { dateDisabled, disabled, placeholder },
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
  FieldInputDateExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const [openPopup, setOpenPopup] = React.useState(false);

  useFieldEditCallback(onEditRef, () => setOpenPopup(true));

  return (
    <DatePicker
      value={currentValue as Date | undefined}
      onChange={v => handleValueChange(v as TFieldPathValue)}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName('pe-0')}
      inputStyle={componentInputStyle}
      controlStyle={componentControlStyle}
      controlClassName={componentControlClassName}
      openPopup={openPopup}
      onOpenPopup={setOpenPopup}
      placeholder={placeholder}
      dateDisabled={dateDisabled}
      disabled={disabled}
    />
  );
}
