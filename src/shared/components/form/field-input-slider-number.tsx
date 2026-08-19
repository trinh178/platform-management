'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import InputBase from '../inputs/input-base';
import { InputGroup, InputGroupAddon, InputGroupText } from '../ui/input-group';
import { Slider } from '../ui/slider';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';
import { cn } from '@/shared/lib/utils';

type InputProps = Omit<
  React.ComponentProps<typeof InputBase>,
  | 'defaultValue'
  | 'disabled'
  | 'inputMode'
  | 'inputPattern'
  | 'isError'
  | 'max'
  | 'min'
  | 'onChange'
  | 'readOnly'
  | 'step'
  | 'type'
  | 'value'
>;

type SliderMark = {
  value: number;
  label?: React.ReactNode;
};

interface FieldInputSliderNumberExtendsProps {
  inputProps?: InputProps;
  min: number;
  max: number;
  step?: number;
  defaultValue?: number;
  fractionDigits?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  locale?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  showInput?: boolean;
  showValue?: boolean;
  showBounds?: boolean;
  marks?: SliderMark[];
  formatValue?: (value: number | undefined) => React.ReactNode;
}

export type FieldInputSliderNumberProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputSliderNumberExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputSliderNumber<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputSliderNumberProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  return (
    <FieldInputBase<
      FieldInputSliderNumberExtendsProps,
      TFieldValues,
      TContext,
      TTransformedValues,
      TName,
      TFieldPathValue
    >
      {...props}
      RenderComponent={FieldInputSliderNumberRender}
    />
  );
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundToStep(value: number, min: number, step = 1) {
  if (!Number.isFinite(step) || step <= 0) return value;

  const steppedValue = Math.round((value - min) / step) * step + min;
  const decimalLength = String(step).split('.')[1]?.length ?? 0;

  return Number(steppedValue.toFixed(decimalLength));
}

function normalizeValue(
  value: unknown,
  {
    max,
    min,
    step,
  }: Pick<FieldInputSliderNumberExtendsProps, 'max' | 'min' | 'step'>,
) {
  if (value === undefined || value === null || value === '') return undefined;

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) return undefined;

  return clampNumber(roundToStep(numberValue, min, step), min, max);
}

function getFractionRange({
  fractionDigits,
  maxFractionDigits,
  minFractionDigits,
}: Pick<
  FieldInputSliderNumberExtendsProps,
  'fractionDigits' | 'maxFractionDigits' | 'minFractionDigits'
>) {
  return {
    minimumFractionDigits: fractionDigits ?? minFractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? maxFractionDigits ?? 20,
  };
}

function formatNumber(
  value: number | undefined,
  options: Pick<
    FieldInputSliderNumberExtendsProps,
    | 'fractionDigits'
    | 'locale'
    | 'maxFractionDigits'
    | 'minFractionDigits'
    | 'prefix'
    | 'suffix'
  >,
): React.ReactNode {
  if (value === undefined) return '';

  const formattedValue = new Intl.NumberFormat(options.locale ?? 'en-US', {
    ...getFractionRange(options),
  }).format(value);

  return (
    <>
      {options.prefix}
      {formattedValue}
      {options.suffix}
    </>
  );
}

function formatInputValue(value: number | undefined) {
  return value === undefined ? '' : String(value);
}

function getMarkPosition(value: number, min: number, max: number) {
  if (max <= min) return 0;

  return ((value - min) / (max - min)) * 100;
}

function FieldInputSliderNumberRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    defaultValue,
    disabled,
    formatValue,
    fractionDigits,
    inputProps,
    locale,
    marks,
    max,
    maxFractionDigits,
    min,
    minFractionDigits,
    placeholder,
    prefix,
    showBounds = false,
    showInput = false,
    showValue = true,
    step = 1,
    suffix,
  },
  currentValue,
  handleClear,
  handleValueChange,
  readOnly,
  isError,
  isEditButton,
  editButtonEditing,
  baseControlsWidthRem,
}: FieldInputRenderProps<
  FieldInputSliderNumberExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const value = normalizeValue(currentValue, { max, min, step });
  const fallbackValue = normalizeValue(defaultValue ?? min, { max, min, step });
  const sliderValue = value ?? fallbackValue ?? min;
  const [inputDisplayValue, setInputDisplayValue] = React.useState(
    formatInputValue(value),
  );
  const [inputFocused, setInputFocused] = React.useState(false);
  const isInteractive = !readOnly && !disabled;
  const formatOptions = {
    fractionDigits,
    locale,
    maxFractionDigits,
    minFractionDigits,
    prefix,
    suffix,
  };
  const formattedValue = formatValue
    ? formatValue(value)
    : formatNumber(value, formatOptions);
  const formattedSliderValue = formatValue
    ? formatValue(sliderValue)
    : formatNumber(sliderValue, formatOptions);
  const controlPaddingStyle = React.useMemo(
    () =>
      baseControlsWidthRem > 0
        ? ({
            paddingRight: `${baseControlsWidthRem + 0.75}rem`,
          } satisfies React.CSSProperties)
        : undefined,
    [baseControlsWidthRem],
  );
  const renderedInputValue = inputFocused
    ? inputDisplayValue
    : formatInputValue(value);
  const hasInputAddon = prefix !== undefined || suffix !== undefined;
  const sortedMarks = React.useMemo(
    () =>
      [...(marks ?? [])]
        .filter(mark => mark.value >= min && mark.value <= max)
        .sort((first, second) => first.value - second.value),
    [marks, max, min],
  );

  const commitValue = React.useCallback(
    (nextValue: number) => {
      handleValueChange(
        normalizeValue(nextValue, { max, min, step }) as TFieldPathValue,
      );
    },
    [handleValueChange, max, min, step],
  );
  const commitInputValue = React.useCallback(
    (nextValue: string) => {
      if (nextValue.trim() === '') {
        handleClear();
        setInputDisplayValue('');
        return;
      }

      const normalizedValue = normalizeValue(nextValue, { max, min, step });

      handleValueChange(normalizedValue as TFieldPathValue);
      setInputDisplayValue(formatInputValue(normalizedValue));
    },
    [handleClear, handleValueChange, max, min, step],
  );

  return (
    <div
      className={cn(
        'flex min-h-9 flex-col justify-center rounded-md border border-input bg-background px-3 py-0 shadow-xs transition-[color,box-shadow]',
        'focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
        {
          'border-destructive': isError,
          'border-primary': isEditButton && editButtonEditing && !isError,
          'opacity-50': disabled,
        },
      )}
      style={controlPaddingStyle}
    >
      <div className="flex h-8 items-center gap-3">
        <div className="min-w-0 flex-1">
          <Slider
            min={min}
            max={max}
            step={step}
            value={[sliderValue]}
            disabled={!isInteractive}
            aria-label={placeholder ?? 'Slider number'}
            onValueChange={nextValue => {
              const [nextNumber] = nextValue;

              if (nextNumber === undefined) return;

              commitValue(nextNumber);
            }}
          />
        </div>

        {showInput ? (
          hasInputAddon ? (
            <InputGroup
              className="h-7 w-28 min-w-0 shadow-none"
              isError={isError}
            >
              {prefix !== undefined && (
                <InputGroupAddon align="inline-start" className="py-0 pl-2">
                  <InputGroupText className="text-xs">{prefix}</InputGroupText>
                </InputGroupAddon>
              )}
              <InputBase
                data-slot="input-group-control"
                {...inputProps}
                type="number"
                inputMode="decimal"
                min={min}
                max={max}
                step={step}
                placeholder={placeholder ?? inputProps?.placeholder}
                value={renderedInputValue}
                onChange={event => {
                  setInputDisplayValue(event.target.value);
                }}
                onFocus={event => {
                  inputProps?.onFocus?.(event);
                  setInputDisplayValue(formatInputValue(value));
                  setInputFocused(true);
                }}
                onBlur={event => {
                  inputProps?.onBlur?.(event);
                  setInputFocused(false);
                  commitInputValue(event.target.value);
                }}
                onKeyDown={event => {
                  inputProps?.onKeyDown?.(event);

                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitInputValue(event.currentTarget.value);
                    event.currentTarget.blur();
                  }
                }}
                readOnly={readOnly}
                disabled={disabled}
                isError={isError}
                className={cn(
                  'h-7 min-w-0 flex-1 rounded-none border-0 bg-transparent px-2 text-right shadow-none focus-visible:ring-0 dark:bg-transparent',
                  inputProps?.className,
                )}
              />
              {suffix !== undefined && (
                <InputGroupAddon align="inline-end" className="py-0 pr-2">
                  <InputGroupText className="text-xs">{suffix}</InputGroupText>
                </InputGroupAddon>
              )}
            </InputGroup>
          ) : (
            <InputBase
              {...inputProps}
              type="number"
              inputMode="decimal"
              min={min}
              max={max}
              step={step}
              placeholder={placeholder ?? inputProps?.placeholder}
              value={renderedInputValue}
              onChange={event => {
                setInputDisplayValue(event.target.value);
              }}
              onFocus={event => {
                inputProps?.onFocus?.(event);
                setInputDisplayValue(formatInputValue(value));
                setInputFocused(true);
              }}
              onBlur={event => {
                inputProps?.onBlur?.(event);
                setInputFocused(false);
                commitInputValue(event.target.value);
              }}
              onKeyDown={event => {
                inputProps?.onKeyDown?.(event);

                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitInputValue(event.currentTarget.value);
                  event.currentTarget.blur();
                }
              }}
              readOnly={readOnly}
              disabled={disabled}
              isError={isError}
              className={cn('h-7 w-20 px-2 text-right', inputProps?.className)}
            />
          )
        ) : (
          showValue && (
            <div className="min-w-14 rounded-md bg-muted px-2 py-0.5 text-center text-xs font-medium tabular-nums text-foreground">
              {formattedValue || formattedSliderValue}
            </div>
          )
        )}
      </div>

      {(showBounds || sortedMarks.length > 0) && (
        <div className="mt-2 text-xs text-muted-foreground">
          {sortedMarks.length > 0 ? (
            <div className="relative h-4">
              {sortedMarks.map(mark => (
                <span
                  key={mark.value}
                  className="absolute max-w-24 -translate-x-1/2 truncate tabular-nums first:translate-x-0 last:-translate-x-full"
                  style={{
                    left: `${getMarkPosition(mark.value, min, max)}%`,
                  }}
                >
                  {mark.label ??
                    (formatValue
                      ? formatValue(mark.value)
                      : formatNumber(mark.value, formatOptions))}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <span className="tabular-nums">
                {formatValue
                  ? formatValue(min)
                  : formatNumber(min, formatOptions)}
              </span>
              <span className="tabular-nums">
                {formatValue
                  ? formatValue(max)
                  : formatNumber(max, formatOptions)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
