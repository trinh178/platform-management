'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { Select } from '../inputs/select';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

export interface FieldInputSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

type FieldInputSelectExtendsProps<TOption extends FieldInputSelectOption> = {
  options: TOption[];
  valueLabel?: string;
  renderOption?: (option: TOption) => React.ReactNode;
  renderValue?: (option: TOption) => React.ReactNode;
  isOptionDisabled?: (option: TOption) => boolean;
} & Pick<
  React.ComponentProps<typeof Select<TOption>>,
  | 'debounceTime'
  | 'emptyContent'
  | 'onSearchChange'
  | 'placeholder'
  | 'searchable'
  | 'searchManual'
  | 'searchPlaceholder'
>;

export type FieldInputSelectProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputSelectOption = FieldInputSelectOption,
> = FieldInputBasePropsExceptRender<
  FieldInputSelectExtendsProps<TOption>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputSelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputSelectOption = FieldInputSelectOption,
>(
  props: FieldInputSelectProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue,
    TOption
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : ('' as TFieldPathValue);

  const p = {
    ...props,
    clearValue,
    RenderComponent: FieldInputSelectRender,
  } as FieldInputBaseProps<
    FieldInputSelectExtendsProps<TOption>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputSelectRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputSelectOption = FieldInputSelectOption,
>({
  fieldInputProps: {
    debounceTime,
    disabled,
    emptyContent,
    isOptionDisabled,
    loading,
    onSearchChange,
    options,
    placeholder,
    renderOption,
    renderValue,
    searchable,
    searchManual,
    searchPlaceholder,
    valueLabel,
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
  FieldInputSelectExtendsProps<TOption>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const [openPopup, setOpenPopup] = React.useState(false);

  useFieldEditCallback(onEditRef, () => setOpenPopup(true));

  React.useEffect(() => {
    if (readOnly) React.startTransition(() => setOpenPopup(false));
  }, [readOnly]);

  const value = React.useMemo<TOption | null>(() => {
    if (!currentValue) return null;

    const matched = options.find(option => option.value === currentValue);
    if (matched) return matched;

    return {
      value: currentValue as string,
      label: valueLabel ?? (currentValue as string),
    } as TOption;
  }, [currentValue, options, valueLabel]);

  return (
    <Select<TOption>
      options={options}
      value={value}
      onValueChange={option =>
        handleValueChange((option?.value ?? '') as TFieldPathValue)
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
      getOptionLabel={option => option.label}
      renderOption={option =>
        renderOption ? renderOption(option) : option.label
      }
      renderValue={renderValue}
      disabled={disabled}
      searchable={searchable}
      searchManual={searchManual}
      searchPlaceholder={searchPlaceholder}
      onSearchChange={onSearchChange}
      isOptionDisabled={option =>
        option.disabled || !!isOptionDisabled?.(option)
      }
      clearable={false}
      debounceTime={debounceTime}
      emptyContent={emptyContent}
      placeholder={placeholder}
    />
  );
}
