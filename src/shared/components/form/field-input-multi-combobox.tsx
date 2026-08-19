'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { MultiCombobox } from '../inputs/multi-combobox';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';

export interface FieldInputMultiComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

type FieldInputMultiComboboxExtendsProps<
  TOption extends FieldInputMultiComboboxOption,
> = Pick<
  React.ComponentProps<typeof MultiCombobox<TOption>>,
  | 'addOnBlur'
  | 'allowCustom'
  | 'debounceTime'
  | 'emptyContent'
  | 'isOptionDisabled'
  | 'maxValues'
  | 'onSearchChange'
  | 'openOnFocus'
  | 'openOnInput'
  | 'options'
  | 'placeholder'
  | 'searchManual'
> & {
  renderOption?: React.ComponentProps<
    typeof MultiCombobox<TOption>
  >['renderOption'];
  renderValue?: React.ComponentProps<
    typeof MultiCombobox<TOption>
  >['renderValue'];
};

export type FieldInputMultiComboboxProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputMultiComboboxOption = FieldInputMultiComboboxOption,
> = FieldInputBasePropsExceptRender<
  FieldInputMultiComboboxExtendsProps<TOption>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

function getPrimitiveValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === 'string');
}

export default function FieldInputMultiCombobox<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputMultiComboboxOption = FieldInputMultiComboboxOption,
>(
  props: FieldInputMultiComboboxProps<
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
    : ([] as TFieldPathValue);

  const p = {
    ...props,
    clearValue,
    isClearableValue: (value: TFieldPathValue | undefined) =>
      getPrimitiveValues(value).length > 0,
    RenderComponent: FieldInputMultiComboboxRender,
  } as FieldInputBaseProps<
    FieldInputMultiComboboxExtendsProps<TOption>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputMultiComboboxRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputMultiComboboxOption = FieldInputMultiComboboxOption,
>({
  fieldInputProps: {
    addOnBlur,
    allowCustom,
    debounceTime,
    disabled,
    emptyContent,
    isOptionDisabled,
    loading,
    maxValues,
    onSearchChange,
    openOnFocus,
    openOnInput,
    options,
    placeholder,
    renderOption,
    renderValue,
    searchManual,
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
  FieldInputMultiComboboxExtendsProps<TOption>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [openPopup, setOpenPopup] = React.useState(false);

  React.useEffect(() => {
    onEditRef.current = () => {
      inputRef.current?.focus();
      setOpenPopup(true);
    };
  }, [onEditRef]);

  React.useEffect(() => {
    if (readOnly) React.startTransition(() => setOpenPopup(false));
  }, [readOnly]);

  return (
    <MultiCombobox
      options={options}
      value={getPrimitiveValues(currentValue)}
      onValueChange={value => handleValueChange(value as TFieldPathValue)}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName('pe-0')}
      inputStyle={componentInputStyle}
      controlStyle={componentControlStyle}
      controlClassName={componentControlClassName}
      open={openPopup}
      onOpenChange={setOpenPopup}
      loading={loading}
      disabled={disabled}
      allowCustom={allowCustom}
      addOnBlur={addOnBlur}
      maxValues={maxValues}
      searchManual={searchManual}
      onSearchChange={onSearchChange}
      openOnFocus={openOnFocus}
      openOnInput={openOnInput}
      debounceTime={debounceTime}
      getOptionValue={option => option.value}
      getOptionLabel={option => option.label}
      renderOption={renderOption}
      renderValue={renderValue}
      isOptionDisabled={option =>
        option.disabled || !!isOptionDisabled?.(option)
      }
      emptyContent={emptyContent}
      placeholder={placeholder}
      inputRef={inputRef}
    />
  );
}
