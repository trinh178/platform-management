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

type FieldInputEntitySelectExtendsProps<TEntity> = {
  options: TEntity[];
  getOptionValue: (entity: TEntity) => string;
  getOptionLabel: (entity: TEntity) => string;
  renderOption?: (entity: TEntity) => React.ReactNode;
  renderValue?: (entity: TEntity) => React.ReactNode;
  isOptionDisabled?: (entity: TEntity) => boolean;
} & Pick<
  React.ComponentProps<typeof Select<TEntity>>,
  | 'debounceTime'
  | 'emptyContent'
  | 'onSearchChange'
  | 'placeholder'
  | 'searchable'
  | 'searchManual'
  | 'searchPlaceholder'
>;

export type FieldInputEntitySelectProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputEntitySelectExtendsProps<NonNullable<TFieldPathValue>>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputEntitySelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputEntitySelectProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : (undefined as TFieldPathValue);

  const p = {
    ...props,
    clearValue,
    RenderComponent: FieldInputEntitySelectRender,
  } as FieldInputBaseProps<
    FieldInputEntitySelectExtendsProps<NonNullable<TFieldPathValue>>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputEntitySelectRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    debounceTime,
    disabled,
    emptyContent,
    getOptionLabel,
    getOptionValue,
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
  FieldInputEntitySelectExtendsProps<NonNullable<TFieldPathValue>>,
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

  const value = (currentValue ?? null) as NonNullable<TFieldPathValue> | null;

  return (
    <Select<NonNullable<TFieldPathValue>>
      options={options}
      value={value}
      onValueChange={entity =>
        handleValueChange((entity ?? undefined) as TFieldPathValue | undefined)
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
      getOptionValue={getOptionValue}
      getOptionLabel={getOptionLabel}
      renderOption={entity =>
        renderOption ? renderOption(entity) : getOptionLabel(entity)
      }
      renderValue={renderValue}
      disabled={disabled}
      searchable={searchable}
      searchManual={searchManual}
      searchPlaceholder={searchPlaceholder}
      onSearchChange={onSearchChange}
      isOptionDisabled={isOptionDisabled}
      clearable={false}
      debounceTime={debounceTime}
      emptyContent={emptyContent}
      placeholder={placeholder}
    />
  );
}
