'use client';

import React from 'react';
import { DateRange } from 'react-day-picker';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { DateRangePicker } from '../inputs/date-range-picker';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  isEmptyFieldValue,
  useFieldEditCallback,
} from './field-input-base';

type FieldInputDateRangeExtendsProps = Pick<
  React.ComponentProps<typeof DateRangePicker>,
  'dateDisabled' | 'numberOfMonths' | 'placeholder' | 'separator'
>;

export default function FieldInputDateRange<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputBasePropsExceptRender<
    FieldInputDateRangeExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return (
    <FieldInputBase
      {...props}
      isClearableValue={value => {
        const range = value as DateRange | undefined;
        if (isEmptyFieldValue(range)) return false;
        return !!range?.from || !!range?.to;
      }}
      RenderComponent={FieldInputDateRangeRender}
    />
  );
}

function FieldInputDateRangeRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    dateDisabled,
    disabled,
    numberOfMonths,
    placeholder,
    separator,
  },
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
  FieldInputDateRangeExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const [openPopup, setOpenPopup] = React.useState(false);

  useFieldEditCallback(onEditRef, () => setOpenPopup(true));

  return (
    <DateRangePicker
      value={currentValue as DateRange | undefined}
      onChange={v => handleValueChange(v as TFieldPathValue)}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName('pe-0')}
      inputStyle={componentInputStyle}
      controlStyle={componentControlStyle}
      controlClassName={componentControlClassName}
      openPopup={openPopup}
      onOpenPopup={setOpenPopup}
      dateDisabled={dateDisabled}
      disabled={disabled}
      numberOfMonths={numberOfMonths}
      placeholder={placeholder}
      separator={separator}
    />
  );
}
