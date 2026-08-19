'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { Label } from '../ui/label';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';
import { cn } from '@/shared/lib/utils';

export interface FieldInputRadioGroupOption {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}

interface FieldInputRadioGroupExtendsProps {
  options: FieldInputRadioGroupOption[];
  direction?: 'horizontal' | 'vertical';
  emptyContent?: React.ReactNode;
}

export type FieldInputRadioGroupProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputRadioGroupExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputRadioGroup<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputRadioGroupProps<
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

  const p = {
    ...props,
    clearValue,
    RenderComponent: FieldInputRadioGroupRender,
  } as FieldInputBaseProps<
    FieldInputRadioGroupExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputRadioGroupRender<
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
    name,
    options,
  },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
}: FieldInputRenderProps<
  FieldInputRadioGroupExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const firstRadioRef = React.useRef<HTMLInputElement>(null);

  useFieldEditCallback(onEditRef, () => firstRadioRef.current?.focus());

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
            const inputId = `${name}-${option.value}`;
            const optionDisabled = disabled || readOnly || option.disabled;

            return (
              <Label
                key={option.value}
                htmlFor={inputId}
                className={cn('min-w-0 gap-2 font-normal', {
                  'cursor-not-allowed opacity-50': optionDisabled,
                })}
              >
                <input
                  ref={index === 0 ? firstRadioRef : undefined}
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={currentValue === option.value}
                  disabled={optionDisabled}
                  className="size-4 shrink-0 accent-primary"
                  onChange={() =>
                    handleValueChange(option.value as TFieldPathValue)
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
