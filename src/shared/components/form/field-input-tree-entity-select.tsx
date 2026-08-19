'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { TreeSelect } from '../inputs/tree-select';
import type { TreeOption } from '../inputs/tree-select';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

type FieldInputTreeEntitySelectExtendsProps<TFieldPathValue> = {
  options: NonNullable<TFieldPathValue>[];
  getOptionValue: (entity: NonNullable<TFieldPathValue>) => string;
  getOptionLabel: (entity: NonNullable<TFieldPathValue>) => string;
  getOptionChildren?: (
    entity: NonNullable<TFieldPathValue>,
  ) => NonNullable<TFieldPathValue>[] | undefined;
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  expandAll?: boolean;
};

export default function FieldInputTreeEntitySelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputBasePropsExceptRender<
    FieldInputTreeEntitySelectExtendsProps<TFieldPathValue>,
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
    RenderComponent: FieldInputTreeEntitySelectRender,
  } as FieldInputBaseProps<
    FieldInputTreeEntitySelectExtendsProps<TFieldPathValue>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function toTreeOptions<T>(
  nodes: T[],
  getOptionValue: (entity: T) => string,
  getOptionLabel: (entity: T) => string,
  getOptionChildren: ((entity: T) => T[] | undefined) | undefined,
  entityMap: Map<string, T>,
): TreeOption[] {
  return nodes.map(node => {
    const value = getOptionValue(node);
    entityMap.set(value, node);
    const children = getOptionChildren?.(node);
    return {
      label: getOptionLabel(node),
      value,
      children: children?.length
        ? toTreeOptions(
            children,
            getOptionValue,
            getOptionLabel,
            getOptionChildren,
            entityMap,
          )
        : undefined,
    };
  });
}

function FieldInputTreeEntitySelectRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    options,
    getOptionValue,
    getOptionLabel,
    getOptionChildren,
    loading,
    disabled,
    placeholder,
    searchPlaceholder,
    searchable,
    expandAll,
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
  FieldInputTreeEntitySelectExtendsProps<TFieldPathValue>,
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

  const [treeOptions, entityMap] = React.useMemo(() => {
    const map = new Map<string, NonNullable<TFieldPathValue>>();
    const opts = toTreeOptions(
      options as NonNullable<TFieldPathValue>[],
      getOptionValue as (e: NonNullable<TFieldPathValue>) => string,
      getOptionLabel as (e: NonNullable<TFieldPathValue>) => string,
      getOptionChildren as
        | ((
            e: NonNullable<TFieldPathValue>,
          ) => NonNullable<TFieldPathValue>[] | undefined)
        | undefined,
      map,
    );
    return [opts, map] as const;
  }, [options, getOptionValue, getOptionLabel, getOptionChildren]);

  const selectedValue = currentValue
    ? (getOptionValue as (e: NonNullable<TFieldPathValue>) => string)(
        currentValue as NonNullable<TFieldPathValue>,
      )
    : undefined;

  const handleChange = React.useCallback(
    (stringValue: string) => {
      const entity = entityMap.get(stringValue);
      handleValueChange(entity as TFieldPathValue | undefined);
    },
    [entityMap, handleValueChange],
  );

  return (
    <TreeSelect
      options={treeOptions}
      value={selectedValue}
      onChange={handleChange}
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
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      searchable={searchable}
      expandAll={expandAll}
    />
  );
}
