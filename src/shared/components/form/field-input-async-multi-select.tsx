'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { MultiSelect } from '../inputs/multi-select';
import { FieldInputAsyncSelectOption } from './field-input-async-select';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';

export type FieldInputAsyncMultiSelectOption = FieldInputAsyncSelectOption;

type FieldInputAsyncMultiSelectExtendsProps<
  TOption extends FieldInputAsyncMultiSelectOption,
> = {
  loadOptions: (keyword: string) => Promise<TOption[]>;
  loadOption?: (value: string) => Promise<TOption | null | undefined>;
  defaultOptions?: TOption[] | boolean;
  loadOnOpen?: boolean;
  minSearchLength?: number;
  valueLabels?: Record<string, string>;
  onLoadError?: (error: unknown) => void;
} & Pick<
  React.ComponentProps<typeof MultiSelect<TOption>>,
  | 'debounceTime'
  | 'emptyContent'
  | 'isOptionDisabled'
  | 'maxVisibleValues'
  | 'placeholder'
  | 'searchPlaceholder'
> & {
    renderOption?: React.ComponentProps<
      typeof MultiSelect<TOption>
    >['renderOption'];
    renderValue?: React.ComponentProps<
      typeof MultiSelect<TOption>
    >['renderValue'];
  };

export type FieldInputAsyncMultiSelectProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputAsyncMultiSelectOption =
    FieldInputAsyncMultiSelectOption,
> = FieldInputBasePropsExceptRender<
  FieldInputAsyncMultiSelectExtendsProps<TOption>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

function getPrimitiveValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(item => {
      if (typeof item === 'object' && item !== null && 'value' in item) {
        return (item as FieldInputAsyncMultiSelectOption).value;
      }

      return item;
    })
    .filter((item): item is string => typeof item === 'string');
}

function mergeOptions<TOption extends FieldInputAsyncMultiSelectOption>(
  currentOptions: TOption[],
  nextOptions: TOption[],
) {
  const map = new Map<string, TOption>();

  currentOptions.forEach(option => map.set(option.value, option));
  nextOptions.forEach(option => map.set(option.value, option));

  return Array.from(map.values());
}

function areSameOptions<TOption extends FieldInputAsyncMultiSelectOption>(
  currentOptions: TOption[],
  nextOptions: TOption[],
) {
  if (currentOptions.length !== nextOptions.length) return false;

  return currentOptions.every((option, index) => {
    const nextOption = nextOptions[index];

    return (
      option.value === nextOption?.value && option.label === nextOption.label
    );
  });
}

function createFallbackOption<TOption extends FieldInputAsyncMultiSelectOption>(
  value: string,
  valueLabels?: Record<string, string>,
) {
  return {
    value,
    label: valueLabels?.[value] ?? value,
  } as TOption;
}

export default function FieldInputAsyncMultiSelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputAsyncMultiSelectOption =
    FieldInputAsyncMultiSelectOption,
>(
  props: FieldInputAsyncMultiSelectProps<
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
    RenderComponent: FieldInputAsyncMultiSelectRender,
  } as FieldInputBaseProps<
    FieldInputAsyncMultiSelectExtendsProps<TOption>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputAsyncMultiSelectRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputAsyncMultiSelectOption =
    FieldInputAsyncMultiSelectOption,
>({
  fieldInputProps: {
    debounceTime,
    defaultOptions = true,
    disabled,
    emptyContent,
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
  FieldInputAsyncMultiSelectExtendsProps<TOption>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const [openPopup, setOpenPopup] = React.useState(false);
  const [options, setOptions] = React.useState<TOption[]>(
    Array.isArray(defaultOptions) ? defaultOptions : [],
  );
  const [selectedOptions, setSelectedOptions] = React.useState<TOption[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const loadedInitialRef = React.useRef(false);
  const requestIdRef = React.useRef(0);

  const selectedValues = React.useMemo(
    () => getPrimitiveValues(currentValue),
    [currentValue],
  );

  const load = React.useCallback(
    async (keyword: string) => {
      const requestId = ++requestIdRef.current;

      setOptionsLoading(true);

      try {
        const nextOptions = await loadOptions(keyword);

        if (requestId !== requestIdRef.current) return;

        setOptions(currentOptions =>
          keyword ? nextOptions : mergeOptions(currentOptions, nextOptions),
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
    [loadOptions, onLoadError],
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

    const knownOptions = mergeOptions(options, selectedOptions);
    const missingValues = selectedValues.filter(
      value => !knownOptions.some(option => option.value === value),
    );

    if (!loadOption || missingValues.length === 0) {
      const nextSelectedOptions = selectedValues.map(
        value =>
          knownOptions.find(option => option.value === value) ??
          createFallbackOption<TOption>(value, valueLabels),
      );

      React.startTransition(() =>
        setSelectedOptions(currentOptions =>
          areSameOptions(currentOptions, nextSelectedOptions)
            ? currentOptions
            : nextSelectedOptions,
        ),
      );
      return;
    }

    let isActive = true;

    Promise.all(
      missingValues.map(async value => {
        const option = await loadOption(value);

        return option ?? createFallbackOption<TOption>(value, valueLabels);
      }),
    )
      .then(loadedOptions => {
        if (!isActive) return;

        const nextKnownOptions = mergeOptions(knownOptions, loadedOptions);
        const nextSelectedOptions = selectedValues.map(
          value =>
            nextKnownOptions.find(option => option.value === value) ??
            createFallbackOption<TOption>(value, valueLabels),
        );

        setOptions(currentOptions =>
          mergeOptions(currentOptions, loadedOptions),
        );
        setSelectedOptions(currentOptions =>
          areSameOptions(currentOptions, nextSelectedOptions)
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
    loadOption,
    onLoadError,
    options,
    selectedOptions,
    selectedValues,
    valueLabels,
  ]);

  const selectOptions = React.useMemo(
    () => mergeOptions(options, selectedOptions),
    [options, selectedOptions],
  );

  return (
    <MultiSelect
      options={selectOptions}
      value={selectedValues}
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
      onOpenChange={handleOpenChange}
      loading={loading || optionsLoading}
      getOptionValue={option => option.value}
      getOptionLabel={option => option.label}
      renderOption={option =>
        renderOption ? renderOption(option) : option.label
      }
      renderValue={renderValue}
      disabled={disabled}
      searchable
      searchManual
      searchPlaceholder={searchPlaceholder}
      onSearchChange={handleSearchChange}
      isOptionDisabled={option =>
        option.disabled || !!isOptionDisabled?.(option)
      }
      debounceTime={debounceTime}
      emptyContent={emptyContent}
      placeholder={placeholder}
      maxVisibleValues={maxVisibleValues}
    />
  );
}
