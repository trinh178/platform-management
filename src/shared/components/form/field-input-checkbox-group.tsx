'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';
import { cn } from '@/shared/lib/utils';

export interface FieldInputCheckboxGroupOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

interface FieldInputCheckboxGroupExtendsProps {
  options: FieldInputCheckboxGroupOption[];
  direction?: 'horizontal' | 'vertical';
  emptyContent?: React.ReactNode;
}

export type FieldInputCheckboxGroupProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputCheckboxGroupExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

function getPrimitiveValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is string => typeof item === 'string');
}

export default function FieldInputCheckboxGroup<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputCheckboxGroupProps<
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
      getPrimitiveValues(value).length > 0,
    RenderComponent: FieldInputCheckboxGroupRender,
  } as FieldInputBaseProps<
    FieldInputCheckboxGroupExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputCheckboxGroupRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    disabled,
    direction = 'horizontal',
    emptyContent,
    options,
  },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
}: FieldInputRenderProps<
  FieldInputCheckboxGroupExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const firstCheckboxRef = React.useRef<HTMLButtonElement>(null);
  const value = React.useMemo(
    () => getPrimitiveValues(currentValue),
    [currentValue],
  );

  useFieldEditCallback(onEditRef, () => firstCheckboxRef.current?.focus());

  const handleCheckedChange = React.useCallback(
    (optionValue: string, checked: boolean) => {
      const nextValue = checked
        ? [...value, optionValue]
        : value.filter(item => item !== optionValue);

      handleValueChange(nextValue as TFieldPathValue);
    },
    [handleValueChange, value],
  );

  return (
    <div
      className={cn(
        'flex min-h-9 items-center rounded-md border border-input bg-background px-3 py-2 text-sm',
        getInputClassName(),
        {
          'border-destructive': isError,
          'opacity-50 pointer-events-none': disabled,
        },
      )}
    >
      {options.length === 0 ? (
        <span className="text-muted-foreground">{emptyContent}</span>
      ) : (
        <div
          className={cn(
            'flex min-w-0 gap-3',
            direction === 'vertical' && 'flex-col gap-2',
            direction === 'horizontal' && 'flex-wrap items-center',
          )}
        >
          {options.map((option, index) => {
            const checked = value.includes(option.value);
            const optionDisabled = disabled || readOnly || option.disabled;

            return (
              <Label
                key={option.value}
                className={cn('min-w-0 gap-2 font-normal', {
                  'cursor-not-allowed opacity-50': optionDisabled,
                })}
              >
                <Checkbox
                  ref={index === 0 ? firstCheckboxRef : undefined}
                  checked={checked}
                  disabled={optionDisabled}
                  aria-invalid={isError}
                  onCheckedChange={nextChecked =>
                    handleCheckedChange(option.value, nextChecked === true)
                  }
                />
                <span className="truncate">{option.label}</span>
              </Label>
            );
          })}
        </div>
      )}
    </div>
  );
}
