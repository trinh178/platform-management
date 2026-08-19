'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { MultiSelect } from '../inputs/multi-select';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

type EntityItem<TFieldPathValue> =
  NonNullable<TFieldPathValue> extends Array<infer TEntity> ? TEntity : never;

type FieldInputEntityMultiSelectExtendsProps<TEntity> = {
  options: TEntity[];
  getOptionValue: (entity: TEntity) => string;
  getOptionLabel: (entity: TEntity) => string;
  renderOption?: (entity: TEntity) => React.ReactNode;
  renderValue?: (entity: TEntity) => React.ReactNode;
  isOptionDisabled?: (entity: TEntity) => boolean;
} & Pick<
  React.ComponentProps<typeof MultiSelect<TEntity>>,
  | 'debounceTime'
  | 'emptyContent'
  | 'maxVisibleValues'
  | 'onSearchChange'
  | 'placeholder'
  | 'searchable'
  | 'searchManual'
  | 'searchPlaceholder'
>;

export type FieldInputEntityMultiSelectProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputEntityMultiSelectExtendsProps<EntityItem<TFieldPathValue>>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

function getArrayValue<TFieldPathValue>(
  value: TFieldPathValue | undefined,
): EntityItem<TFieldPathValue>[] {
  return Array.isArray(value) ? value : [];
}

function mergeEntities<TEntity>(
  options: TEntity[],
  selectedEntities: TEntity[],
  getOptionValue: (entity: TEntity) => string,
) {
  const map = new Map<string, TEntity>();

  options.forEach(option => map.set(getOptionValue(option), option));
  selectedEntities.forEach(entity => map.set(getOptionValue(entity), entity));

  return Array.from(map.values());
}

export default function FieldInputEntityMultiSelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputEntityMultiSelectProps<
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
      getArrayValue(value).length > 0,
    RenderComponent: FieldInputEntityMultiSelectRender,
  } as FieldInputBaseProps<
    FieldInputEntityMultiSelectExtendsProps<EntityItem<TFieldPathValue>>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputEntityMultiSelectRender<
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
    maxVisibleValues,
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
  FieldInputEntityMultiSelectExtendsProps<EntityItem<TFieldPathValue>>,
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

  const selectedEntities = React.useMemo(
    () => getArrayValue(currentValue),
    [currentValue],
  );

  const selectOptions = React.useMemo(
    () => mergeEntities(options, selectedEntities, getOptionValue),
    [getOptionValue, options, selectedEntities],
  );

  const entityMap = React.useMemo(() => {
    return new Map(
      selectOptions.map(entity => [getOptionValue(entity), entity] as const),
    );
  }, [getOptionValue, selectOptions]);

  const selectedValues = React.useMemo(
    () => selectedEntities.map(entity => getOptionValue(entity)),
    [getOptionValue, selectedEntities],
  );

  const handleSelectChange = React.useCallback(
    (nextValues: string[]) => {
      const nextEntities = nextValues
        .map(value => entityMap.get(value))
        .filter(
          (entity): entity is EntityItem<TFieldPathValue> =>
            entity !== undefined,
        );

      handleValueChange(nextEntities as TFieldPathValue);
    },
    [entityMap, handleValueChange],
  );

  return (
    <MultiSelect<EntityItem<TFieldPathValue>>
      options={selectOptions}
      value={selectedValues}
      onValueChange={handleSelectChange}
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
      debounceTime={debounceTime}
      emptyContent={emptyContent}
      placeholder={placeholder}
      maxVisibleValues={maxVisibleValues}
    />
  );
}
