'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import InputBase from '../inputs/input-base';
import { InputGroup, InputGroupAddon, InputGroupText } from '../ui/input-group';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';
import { cn } from '@/shared/lib/utils';

type InputProps = Omit<
  React.ComponentProps<typeof InputBase>,
  | 'defaultValue'
  | 'disabled'
  | 'inputMode'
  | 'inputPattern'
  | 'isError'
  | 'maxLength'
  | 'onChange'
  | 'readOnly'
  | 'type'
  | 'value'
>;

interface FieldInputPhoneNumberExtendsProps {
  inputProps?: InputProps;
  countryCode?: string;
  countryCodeName?: string;
  countryOptions?: FieldInputPhoneCountryOption[];
  formatOnBlur?: boolean;
  maxLength?: number;
  preservePlus?: boolean;
  prefix?: React.ReactNode;
  stripNonPhoneChars?: boolean;
  suffix?: React.ReactNode;
}

export interface FieldInputPhoneCountryOption {
  label: string;
  value: string;
}

const DEFAULT_PHONE_COUNTRY_OPTIONS: FieldInputPhoneCountryOption[] = [
  { label: 'VN +84', value: '+84' },
  { label: 'US +1', value: '+1' },
  { label: 'JP +81', value: '+81' },
  { label: 'KR +82', value: '+82' },
  { label: 'CN +86', value: '+86' },
  { label: 'SG +65', value: '+65' },
  { label: 'TH +66', value: '+66' },
  { label: 'MY +60', value: '+60' },
  { label: 'ID +62', value: '+62' },
  { label: 'PH +63', value: '+63' },
];

export type FieldInputPhoneNumberProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputPhoneNumberExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputPhoneNumber<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputPhoneNumberProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : ('' as TFieldPathValue);

  return (
    <FieldInputBase
      {...props}
      clearValue={clearValue}
      RenderComponent={FieldInputPhoneNumberRender}
    />
  );
}

function formatPhoneValue(value: unknown) {
  if (value === undefined || value === null) return '';

  return String(value);
}

function normalizePhoneValue(
  value: string,
  {
    maxLength,
    preservePlus = true,
    stripNonPhoneChars = true,
  }: Pick<
    FieldInputPhoneNumberExtendsProps,
    'maxLength' | 'preservePlus' | 'stripNonPhoneChars'
  >,
) {
  if (!stripNonPhoneChars) {
    return maxLength === undefined ? value : value.slice(0, maxLength);
  }

  const trimmedValue = value.trim();
  const hasPlus = preservePlus && trimmedValue.startsWith('+');
  const digits = trimmedValue.replace(/\D/g, '');
  const nextValue = `${hasPlus ? '+' : ''}${digits}`;

  return maxLength === undefined ? nextValue : nextValue.slice(0, maxLength);
}

function formatPhoneDisplay(value: string) {
  if (!value) return '';

  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 4) return `${hasPlus ? '+' : ''}${digits}`;

  const groups: string[] = [];
  let remainingDigits = digits;

  if (hasPlus) {
    groups.push(remainingDigits.slice(0, 2));
    remainingDigits = remainingDigits.slice(2);
  }

  while (remainingDigits.length > 0) {
    groups.push(remainingDigits.slice(0, 3));
    remainingDigits = remainingDigits.slice(3);
  }

  return `${hasPlus ? '+' : ''}${groups.filter(Boolean).join(' ')}`;
}

function FieldInputPhoneNumberRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    countryCode,
    countryCodeName,
    countryOptions,
    disabled,
    formatOnBlur,
    form,
    inputProps,
    maxLength,
    placeholder,
    prefix,
    preservePlus,
    stripNonPhoneChars,
    suffix,
  },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
  isEditButton,
  editButtonEditing,
  valueSyncKey,
}: FieldInputRenderProps<
  FieldInputPhoneNumberExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = React.useState('');
  const displayValueRef = React.useRef('');
  const resolvedCountryOptions = React.useMemo(() => {
    if (!countryCodeName) return [];

    return countryOptions && countryOptions.length > 0
      ? countryOptions
      : DEFAULT_PHONE_COUNTRY_OPTIONS;
  }, [countryCodeName, countryOptions]);
  const defaultCountryCode = React.useMemo(() => {
    return countryCode ?? resolvedCountryOptions[0]?.value ?? '';
  }, [countryCode, resolvedCountryOptions]);
  const [selectedCountryCode, setSelectedCountryCode] = React.useState(() => {
    if (!countryCodeName) return defaultCountryCode;

    const formValue = form.getValues(
      countryCodeName as FieldPath<TFieldValues>,
    );

    return typeof formValue === 'string' && formValue
      ? formValue
      : defaultCountryCode;
  });

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  const value = React.useMemo(
    () => formatPhoneValue(currentValue),
    [currentValue],
  );
  const valueRef = React.useRef(value);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  React.useEffect(() => {
    if (document.activeElement === inputRef.current) return;

    setDisplayValue(value);
    displayValueRef.current = value;
  }, [value]);

  React.useEffect(() => {
    const nextValue = valueRef.current;

    setDisplayValue(nextValue);
    displayValueRef.current = nextValue;

    if (countryCodeName) {
      const formValue = form.getValues(
        countryCodeName as FieldPath<TFieldValues>,
      );
      setSelectedCountryCode(
        typeof formValue === 'string' && formValue
          ? formValue
          : defaultCountryCode,
      );
    }
  }, [countryCodeName, defaultCountryCode, form, valueSyncKey]);

  React.useEffect(() => {
    if (!countryCodeName) {
      React.startTransition(() => setSelectedCountryCode(defaultCountryCode));
      return;
    }

    const formValue = form.getValues(
      countryCodeName as FieldPath<TFieldValues>,
    );

    if (typeof formValue === 'string' && formValue) {
      React.startTransition(() => setSelectedCountryCode(formValue));
      return;
    }

    React.startTransition(() => setSelectedCountryCode(defaultCountryCode));

    if (defaultCountryCode) {
      form.setValue(
        countryCodeName as FieldPath<TFieldValues>,
        defaultCountryCode as FieldPathValue<
          TFieldValues,
          FieldPath<TFieldValues>
        >,
      );
    }
  }, [countryCodeName, defaultCountryCode, form]);

  const normalizeOptions = React.useMemo(
    () => ({
      maxLength,
      preservePlus: preservePlus ?? !countryCodeName,
      stripNonPhoneChars,
    }),
    [countryCodeName, maxLength, preservePlus, stripNonPhoneChars],
  );

  const countrySelectElement =
    countryCodeName && resolvedCountryOptions.length > 0 ? (
      <select
        aria-label="Country code"
        className="h-7 max-w-28 cursor-pointer rounded-sm bg-transparent pl-0 pr-5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled || readOnly}
        value={selectedCountryCode}
        onClick={event => event.stopPropagation()}
        onChange={event => {
          const nextCountryCode = event.target.value;

          setSelectedCountryCode(nextCountryCode);

          if (countryCodeName) {
            form.setValue(
              countryCodeName as FieldPath<TFieldValues>,
              nextCountryCode as FieldPathValue<
                TFieldValues,
                FieldPath<TFieldValues>
              >,
              {
                shouldDirty: true,
                shouldTouch: true,
              },
            );
          }
        }}
      >
        {resolvedCountryOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : undefined;

  const leadingAddon = prefix ?? countrySelectElement ?? countryCode;
  const hasAddon = leadingAddon !== undefined || suffix !== undefined;
  const inputGroupClassName = cn(
    getInputClassName(inputProps?.className),
    isEditButton && !editButtonEditing && 'pe-0 group-hover:pe-10',
    {
      'border-destructive': isError,
    },
  );
  const inputElement = (
    <InputBase
      data-slot={hasAddon ? 'input-group-control' : undefined}
      ref={inputRef}
      type="tel"
      inputMode="tel"
      {...inputProps}
      placeholder={placeholder ?? inputProps?.placeholder}
      value={displayValue}
      onFocus={e => {
        inputProps?.onFocus?.(e);
        const nextValue = valueRef.current;

        setDisplayValue(nextValue);
        displayValueRef.current = nextValue;
      }}
      onChange={e => {
        const nextValue = normalizePhoneValue(e.target.value, normalizeOptions);

        setDisplayValue(nextValue);
        displayValueRef.current = nextValue;
        handleValueChange(nextValue as TFieldPathValue);
      }}
      onBlur={e => {
        inputProps?.onBlur?.(e);
        if (formatOnBlur) {
          setDisplayValue(formatPhoneDisplay(displayValueRef.current));
        }
      }}
      readOnly={readOnly}
      isError={isError}
      className={
        hasAddon
          ? 'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent'
          : getInputClassName(inputProps?.className)
      }
      disabled={disabled}
      maxLength={maxLength}
    />
  );

  if (!hasAddon) return inputElement;

  return (
    <InputGroup className={inputGroupClassName}>
      {leadingAddon !== undefined && (
        <InputGroupAddon align="inline-start">
          <InputGroupText>{leadingAddon}</InputGroupText>
        </InputGroupAddon>
      )}
      {inputElement}
      {suffix !== undefined && (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{suffix}</InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
