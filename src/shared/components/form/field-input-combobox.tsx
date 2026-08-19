'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { Combobox } from '../inputs/combobox';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';

export interface FieldInputComboboxOption {
  label: string;
  value: string;
  disabled?: boolean;
}

type FieldInputComboboxExtendsProps<TOption extends FieldInputComboboxOption> =
  Pick<
    React.ComponentProps<typeof Combobox<TOption>>,
    | 'allowCustom'
    | 'debounceTime'
    | 'emptyContent'
    | 'isOptionDisabled'
    | 'onSearchChange'
    | 'openOnFocus'
    | 'openOnInput'
    | 'options'
    | 'placeholder'
    | 'searchManual'
  > & {
    renderOption?: React.ComponentProps<
      typeof Combobox<TOption>
    >['renderOption'];
    renderValue?: React.ComponentProps<typeof Combobox<TOption>>['renderValue'];
  };

export type FieldInputComboboxProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputComboboxOption = FieldInputComboboxOption,
> = FieldInputBasePropsExceptRender<
  FieldInputComboboxExtendsProps<TOption>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputCombobox<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputComboboxOption = FieldInputComboboxOption,
>(
  props: FieldInputComboboxProps<
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
    RenderComponent: FieldInputComboboxRender,
  } as FieldInputBaseProps<
    FieldInputComboboxExtendsProps<TOption>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputComboboxRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputComboboxOption = FieldInputComboboxOption,
>({
  fieldInputProps: {
    allowCustom,
    debounceTime,
    disabled,
    emptyContent,
    isOptionDisabled,
    loading,
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
  FieldInputComboboxExtendsProps<TOption>,
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
    <Combobox
      options={options}
      value={(currentValue as string | undefined) ?? ''}
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
