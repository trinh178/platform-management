'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { MultiSelect } from '../inputs/multi-select';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';

type EntityItem<TFieldPathValue> =
  NonNullable<TFieldPathValue> extends Array<infer TEntity> ? TEntity : never;

type FieldInputEntityAsyncMultiSelectExtendsProps<TEntity> = {
  loadOptions: (keyword: string) => Promise<TEntity[]>;
  loadOption?: (value: string) => Promise<TEntity | null | undefined>;
  defaultOptions?: TEntity[] | boolean;
  loadOnOpen?: boolean;
  minSearchLength?: number;
  onLoadError?: (error: unknown) => void;
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
  | 'placeholder'
  | 'searchPlaceholder'
>;

export type FieldInputEntityAsyncMultiSelectProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputEntityAsyncMultiSelectExtendsProps<EntityItem<TFieldPathValue>>,
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
  currentOptions: TEntity[],
  nextOptions: TEntity[],
  getOptionValue: (entity: TEntity) => string,
) {
  const map = new Map<string, TEntity>();

  currentOptions.forEach(option => map.set(getOptionValue(option), option));
  nextOptions.forEach(option => map.set(getOptionValue(option), option));

  return Array.from(map.values());
}

function areSameEntities<TEntity>(
  currentOptions: TEntity[],
  nextOptions: TEntity[],
  getOptionValue: (entity: TEntity) => string,
  getOptionLabel: (entity: TEntity) => string,
) {
  if (currentOptions.length !== nextOptions.length) return false;

  return currentOptions.every((option, index) => {
    const nextOption = nextOptions[index];

    return (
      !!nextOption &&
      getOptionValue(option) === getOptionValue(nextOption) &&
      getOptionLabel(option) === getOptionLabel(nextOption)
    );
  });
}

export default function FieldInputEntityAsyncMultiSelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputEntityAsyncMultiSelectProps<
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
    RenderComponent: FieldInputEntityAsyncMultiSelectRender,
  } as FieldInputBaseProps<
    FieldInputEntityAsyncMultiSelectExtendsProps<EntityItem<TFieldPathValue>>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputEntityAsyncMultiSelectRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    debounceTime,
    defaultOptions = true,
    disabled,
    emptyContent,
    getOptionLabel,
    getOptionValue,
    isOptionDisabled,
    loadOption,
    loadOnOpen = true,
    loadOptions,
    loading,
    maxVisibleValues,
    minSearchLength = 0,
    onLoadError,
    placeholder,
    renderOption,
    renderValue,
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
  FieldInputEntityAsyncMultiSelectExtendsProps<EntityItem<TFieldPathValue>>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const [openPopup, setOpenPopup] = React.useState(false);
  const [options, setOptions] = React.useState<EntityItem<TFieldPathValue>[]>(
    Array.isArray(defaultOptions) ? defaultOptions : [],
  );
  const [selectedOptions, setSelectedOptions] = React.useState<
    EntityItem<TFieldPathValue>[]
  >([]);
  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const loadedInitialRef = React.useRef(false);
  const requestIdRef = React.useRef(0);

  const selectedEntities = React.useMemo(
    () => getArrayValue(currentValue),
    [currentValue],
  );

  const selectedValues = React.useMemo(
    () => selectedEntities.map(entity => getOptionValue(entity)),
    [getOptionValue, selectedEntities],
  );

  const load = React.useCallback(
    async (keyword: string) => {
      const requestId = ++requestIdRef.current;

      setOptionsLoading(true);

      try {
        const nextOptions = await loadOptions(keyword);

        if (requestId !== requestIdRef.current) return;

        setOptions(currentOptions =>
          keyword
            ? nextOptions
            : mergeEntities(currentOptions, nextOptions, getOptionValue),
        );
        loadedInitialRef.current = loadedInitialRef.current || !keyword;
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        onLoadError?.(error);
      } finally {
        if (requestId === requestIdRef.current) {
          setOptionsLoading(false);
        }
      }
    },
    [getOptionValue, loadOptions, onLoadError],
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setOpenPopup(open);

      if (
        open &&
        loadOnOpen &&
        !loadedInitialRef.current &&
        defaultOptions === true
      ) {
        load('');
      }
    },
    [defaultOptions, load, loadOnOpen],
  );

  const handleSearchChange = React.useCallback(
    (keyword: string) => {
      if (keyword.length < minSearchLength) {
        setOptions(Array.isArray(defaultOptions) ? defaultOptions : []);
        return;
      }

      load(keyword);
    },
    [defaultOptions, load, minSearchLength],
  );

  React.useEffect(() => {
    if (!Array.isArray(defaultOptions)) return;

    React.startTransition(() => setOptions(defaultOptions));
  }, [defaultOptions]);

  React.useEffect(() => {
    onEditRef.current = () => {
      setOpenPopup(true);

      if (loadOnOpen && !loadedInitialRef.current && defaultOptions === true) {
        load('');
      }
    };
  }, [defaultOptions, load, loadOnOpen, onEditRef]);

  React.useEffect(() => {
    if (readOnly) React.startTransition(() => setOpenPopup(false));
  }, [readOnly]);

  React.useEffect(() => {
    if (selectedValues.length === 0) {
      React.startTransition(() =>
        setSelectedOptions(currentOptions =>
          currentOptions.length === 0 ? currentOptions : [],
        ),
      );
      return;
    }

    const knownOptions = mergeEntities(
      options,
      selectedOptions,
      getOptionValue,
    );
    const missingEntities = selectedEntities.filter(
      entity =>
        !knownOptions.some(
          option => getOptionValue(option) === getOptionValue(entity),
        ),
    );

    if (!loadOption || missingEntities.length === 0) {
      const nextSelectedOptions = selectedEntities.map(
        entity =>
          knownOptions.find(
            option => getOptionValue(option) === getOptionValue(entity),
          ) ?? entity,
      );

      React.startTransition(() =>
        setSelectedOptions(currentOptions =>
          areSameEntities(
            currentOptions,
            nextSelectedOptions,
            getOptionValue,
            getOptionLabel,
          )
            ? currentOptions
            : nextSelectedOptions,
        ),
      );
      return;
    }

    let isActive = true;

    Promise.all(
      missingEntities.map(async entity => {
        const option = await loadOption(getOptionValue(entity));

        return option ?? entity;
      }),
    )
      .then(loadedOptions => {
        if (!isActive) return;

        const nextKnownOptions = mergeEntities(
          knownOptions,
          loadedOptions,
          getOptionValue,
        );
        const nextSelectedOptions = selectedEntities.map(
          entity =>
            nextKnownOptions.find(
              option => getOptionValue(option) === getOptionValue(entity),
            ) ?? entity,
        );

        setOptions(currentOptions =>
          mergeEntities(currentOptions, loadedOptions, getOptionValue),
        );
        setSelectedOptions(currentOptions =>
          areSameEntities(
            currentOptions,
            nextSelectedOptions,
            getOptionValue,
            getOptionLabel,
          )
            ? currentOptions
            : nextSelectedOptions,
        );
      })
      .catch(error => {
        if (!isActive) return;
        onLoadError?.(error);
      });

    return () => {
      isActive = false;
    };
  }, [
    getOptionLabel,
    getOptionValue,
    loadOption,
    onLoadError,
    options,
    selectedEntities,
    selectedOptions,
    selectedValues,
  ]);

  const selectOptions = React.useMemo(() => {
    return mergeEntities(
      mergeEntities(options, selectedOptions, getOptionValue),
      selectedEntities,
      getOptionValue,
    );
  }, [getOptionValue, options, selectedEntities, selectedOptions]);

  const entityMap = React.useMemo(() => {
    return new Map(
      selectOptions.map(entity => [getOptionValue(entity), entity] as const),
    );
  }, [getOptionValue, selectOptions]);

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
      onOpenChange={handleOpenChange}
      loading={loading || optionsLoading}
      getOptionValue={getOptionValue}
      getOptionLabel={getOptionLabel}
      renderOption={entity =>
        renderOption ? renderOption(entity) : getOptionLabel(entity)
      }
      renderValue={renderValue}
      disabled={disabled}
      searchable
      searchManual
      searchPlaceholder={searchPlaceholder}
      onSearchChange={handleSearchChange}
      isOptionDisabled={isOptionDisabled}
      debounceTime={debounceTime}
      emptyContent={emptyContent}
      placeholder={placeholder}
      maxVisibleValues={maxVisibleValues}
    />
  );
}
