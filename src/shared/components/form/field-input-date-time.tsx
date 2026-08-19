'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { DateTimePicker } from '../inputs/date-time-picker';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

type FieldInputDateTimeExtendsProps = Pick<
  React.ComponentProps<typeof DateTimePicker>,
  'dateDisabled'
>;

export default function FieldInputDateTime<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputBasePropsExceptRender<
    FieldInputDateTimeExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return (
    <FieldInputBase {...props} RenderComponent={FieldInputDateTimeRender} />
  );
}

function FieldInputDateTimeRender<
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
  FieldInputDateTimeExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const t = useTranslations();
  const [openPopup, setOpenPopup] = React.useState(false);

  useFieldEditCallback(onEditRef, () => setOpenPopup(true));

  return (
    <DateTimePicker
      value={currentValue as Date | undefined}
      onChange={value => handleValueChange(value as TFieldPathValue)}
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
      placeholder={placeholder}
      labels={{
        hour: t('common.label.hour'),
        minute: t('common.label.minute'),
        now: t('common.control.now'),
        done: t('common.control.done'),
      }}
    />
  );
}
