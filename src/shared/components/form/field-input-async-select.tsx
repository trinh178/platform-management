'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { Select } from '../inputs/select';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';

export interface FieldInputAsyncSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

type FieldInputAsyncSelectExtendsProps<
  TOption extends FieldInputAsyncSelectOption,
> = {
  loadOptions: (keyword: string) => Promise<TOption[]>;
  loadOption?: (value: string) => Promise<TOption | null | undefined>;
  defaultOptions?: TOption[] | boolean;
  loadOnOpen?: boolean;
  minSearchLength?: number;
  valueLabel?: string;
  onLoadError?: (error: unknown) => void;
} & Pick<
  React.ComponentProps<typeof Select<TOption>>,
  | 'clearable'
  | 'debounceTime'
  | 'emptyContent'
  | 'isOptionDisabled'
  | 'placeholder'
  | 'searchPlaceholder'
> & {
    renderOption?: React.ComponentProps<typeof Select<TOption>>['renderOption'];
    renderValue?: React.ComponentProps<typeof Select<TOption>>['renderValue'];
  };

export type FieldInputAsyncSelectProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputAsyncSelectOption = FieldInputAsyncSelectOption,
> = FieldInputBasePropsExceptRender<
  FieldInputAsyncSelectExtendsProps<TOption>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

function getPrimitiveValue(value: unknown) {
  if (value === null || value === undefined) return undefined;

  if (typeof value === 'object' && value !== null && 'value' in value) {
    return (value as FieldInputAsyncSelectOption).value;
  }

  return value as string | undefined;
}

function mergeOptions<TOption extends FieldInputAsyncSelectOption>(
  currentOptions: TOption[],
  nextOptions: TOption[],
) {
  const map = new Map<string, TOption>();

  currentOptions.forEach(option => map.set(option.value, option));
  nextOptions.forEach(option => map.set(option.value, option));

  return Array.from(map.values());
}

export default function FieldInputAsyncSelect<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputAsyncSelectOption = FieldInputAsyncSelectOption,
>(
  props: FieldInputAsyncSelectProps<
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
    RenderComponent: FieldInputAsyncSelectRender,
  } as FieldInputBaseProps<
    FieldInputAsyncSelectExtendsProps<TOption>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputAsyncSelectRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
  TOption extends FieldInputAsyncSelectOption = FieldInputAsyncSelectOption,
>({
  fieldInputProps: {
    debounceTime,
    defaultOptions = true,
    emptyContent,
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
    valueLabel,
    disabled,
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
  FieldInputAsyncSelectExtendsProps<TOption>,
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
  const [selectedOption, setSelectedOption] = React.useState<TOption | null>(
    null,
  );
  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const loadedInitialRef = React.useRef(false);
  const requestIdRef = React.useRef(0);

  const selectedValue = React.useMemo(
    () => getPrimitiveValue(currentValue),
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
    if (!selectedValue) {
      React.startTransition(() => setSelectedOption(null));
      return;
    }

    const option = options.find(o => o.value === selectedValue);
    if (option) {
      React.startTransition(() => setSelectedOption(option));
      return;
    }

    if (!loadOption) {
      React.startTransition(() =>
        setSelectedOption({
          value: selectedValue,
          label: valueLabel ?? selectedValue,
        } as TOption),
      );
      return;
    }

    let isActive = true;

    loadOption(selectedValue)
      .then(option => {
        if (!isActive) return;

        const nextOption =
          option ??
          ({
            value: selectedValue,
            label: valueLabel ?? selectedValue,
          } as TOption);

        setSelectedOption(nextOption);
        setOptions(currentOptions =>
          mergeOptions(currentOptions, [nextOption]),
        );
      })
      .catch(error => {
        if (!isActive) return;
        onLoadError?.(error);
      });

    return () => {
      isActive = false;
    };
  }, [loadOption, onLoadError, options, selectedValue, valueLabel]);

  const selectOptions = React.useMemo(() => {
    return selectedOption ? mergeOptions(options, [selectedOption]) : options;
  }, [options, selectedOption]);

  const value = React.useMemo(() => {
    if (!selectedValue) return null;

    return (
      selectOptions.find(option => option.value === selectedValue) ??
      selectedOption ??
      ({
        value: selectedValue,
        label: valueLabel ?? selectedValue,
      } as TOption)
    );
  }, [selectOptions, selectedOption, selectedValue, valueLabel]);

  return (
    <Select
      options={selectOptions}
      value={value}
      onValueChange={option =>
        handleValueChange((option ? option.value : '') as TFieldPathValue)
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
      clearable={false}
      debounceTime={debounceTime}
      emptyContent={emptyContent}
      placeholder={placeholder}
    />
  );
}
