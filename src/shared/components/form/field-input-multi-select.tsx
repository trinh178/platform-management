'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { MultiSelect } from '../inputs/multi-select';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';

interface ValueType {
  label: string;
  value: string;
  disabled?: boolean;
}

type FieldInputMultiSelectExtendsProps = Pick<
  React.ComponentProps<typeof MultiSelect<ValueType>>,
  | 'emptyContent'
  | 'maxVisibleValues'
  | 'options'
  | 'placeholder'
  | 'searchable'
  | 'searchPlaceholder'
> & {
  valueLabels?: Record<string, string>;
};

function getPrimitiveValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(item => {
      if (typeof item === 'object' && item !== null && 'value' in item) {
        return (item as ValueType).value;
      }

      return item;
    })
    .filter((item): item is string => typeof item === 'string');
}

export default function FieldInputMultiSelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputBasePropsExceptRender<
    FieldInputMultiSelectExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : ([] as TFieldPathValue);

  const p = {
    ...props,
    clearValue,
    isClearableValue: (value: TFieldPathValue | undefined) =>
      getPrimitiveValues(value).length > 0,
    RenderComponent: FieldInputMultiSelectRender,
  } as FieldInputBaseProps<
    FieldInputMultiSelectExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputMultiSelectRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    disabled,
    emptyContent,
    loading,
    maxVisibleValues,
    options,
    placeholder,
    searchable,
    searchPlaceholder,
    valueLabels,
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
  FieldInputMultiSelectExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const [openPopup, setOpenPopup] = React.useState<boolean>(false);

  React.useEffect(() => {
    onEditRef.current = () => {
      setOpenPopup(true);
    };
  }, [onEditRef]);

  React.useEffect(() => {
    if (readOnly) React.startTransition(() => setOpenPopup(false));
  }, [readOnly]);

  const value = React.useMemo(
    () => getPrimitiveValues(currentValue),
    [currentValue],
  );

  const normalizedOptions = React.useMemo<ValueType[]>(() => {
    const optionValues = new Set(options.map(option => option.value));
    const missingOptions = value
      .filter(selectedValue => !optionValues.has(selectedValue))
      .map(selectedValue => ({
        value: selectedValue,
        label: valueLabels?.[selectedValue] ?? selectedValue,
      }));

    return [...options, ...missingOptions];
  }, [options, value, valueLabels]);

  return (
    <MultiSelect
      options={normalizedOptions}
      value={value}
      onValueChange={nextValue =>
        handleValueChange(nextValue as TFieldPathValue)
      }
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName('pe-0')}
      inputStyle={componentInputStyle}
      controlStyle={componentControlStyle}
      controlClassName={componentControlClassName}
      open={openPopup}
      onOpenChange={setOpenPopup}
      loading={loading}
      getOptionValue={option => option.value}
      renderOption={option => option.label}
      disabled={disabled}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      getOptionLabel={option => option.label}
      isOptionDisabled={option => !!option.disabled}
      emptyContent={emptyContent}
      placeholder={placeholder}
      maxVisibleValues={maxVisibleValues}
    />
  );
}
