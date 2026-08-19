'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { Select } from '../inputs/select';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';

type FieldInputEntityAsyncSelectExtendsProps<TEntity> = {
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
  React.ComponentProps<typeof Select<TEntity>>,
  'debounceTime' | 'emptyContent' | 'placeholder' | 'searchPlaceholder'
>;

export type FieldInputEntityAsyncSelectProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputEntityAsyncSelectExtendsProps<NonNullable<TFieldPathValue>>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

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

export default function FieldInputEntityAsyncSelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputEntityAsyncSelectProps<
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
    RenderComponent: FieldInputEntityAsyncSelectRender,
  } as FieldInputBaseProps<
    FieldInputEntityAsyncSelectExtendsProps<NonNullable<TFieldPathValue>>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputEntityAsyncSelectRender<
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
  FieldInputEntityAsyncSelectExtendsProps<NonNullable<TFieldPathValue>>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const [openPopup, setOpenPopup] = React.useState(false);
  const [options, setOptions] = React.useState<NonNullable<TFieldPathValue>[]>(
    Array.isArray(defaultOptions) ? defaultOptions : [],
  );
  const [selectedOption, setSelectedOption] =
    React.useState<NonNullable<TFieldPathValue> | null>(null);
  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const loadedInitialRef = React.useRef(false);
  const requestIdRef = React.useRef(0);

  const selectedValue = currentValue
    ? getOptionValue(currentValue as NonNullable<TFieldPathValue>)
    : undefined;

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
    if (!currentValue || !selectedValue) {
      React.startTransition(() => setSelectedOption(null));
      return;
    }

    const option = options.find(o => getOptionValue(o) === selectedValue);
    if (option) {
      React.startTransition(() => setSelectedOption(option));
      return;
    }

    if (!loadOption) {
      React.startTransition(() =>
        setSelectedOption(currentValue as NonNullable<TFieldPathValue>),
      );
      return;
    }

    let isActive = true;

    loadOption(selectedValue)
      .then(option => {
        if (!isActive) return;

        const nextOption =
          option ?? (currentValue as NonNullable<TFieldPathValue>);

        setSelectedOption(nextOption);
        setOptions(currentOptions =>
          mergeEntities(currentOptions, [nextOption], getOptionValue),
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
    currentValue,
    getOptionValue,
    loadOption,
    onLoadError,
    options,
    selectedValue,
  ]);

  const selectOptions = React.useMemo(() => {
    if (selectedOption) {
      return mergeEntities(options, [selectedOption], getOptionValue);
    }

    if (currentValue) {
      return mergeEntities(
        options,
        [currentValue as NonNullable<TFieldPathValue>],
        getOptionValue,
      );
    }

    return options;
  }, [currentValue, getOptionValue, options, selectedOption]);

  const value = React.useMemo(() => {
    if (!selectedValue) return null;

    return (
      selectOptions.find(option => getOptionValue(option) === selectedValue) ??
      selectedOption ??
      (currentValue as NonNullable<TFieldPathValue> | undefined) ??
      null
    );
  }, [
    currentValue,
    getOptionValue,
    selectOptions,
    selectedOption,
    selectedValue,
  ]);

  return (
    <Select<NonNullable<TFieldPathValue>>
      options={selectOptions}
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
      clearable={false}
      debounceTime={debounceTime}
      emptyContent={emptyContent}
      placeholder={placeholder}
    />
  );
}
