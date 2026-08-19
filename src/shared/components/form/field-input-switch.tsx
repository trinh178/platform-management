'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/lib/utils';

interface FieldInputSwitchExtendsProps {
  switchProps?: Omit<
    React.ComponentProps<typeof Switch>,
    'checked' | 'defaultChecked' | 'onCheckedChange'
  >;
}

export type FieldInputSwitchProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputSwitchExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputSwitch<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputSwitchProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : (false as TFieldPathValue);

  return (
    <FieldInputBase
      {...props}
      clearValue={clearValue}
      RenderComponent={FieldInputSwitchRender}
    />
  );
}

function FieldInputSwitchRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { switchProps, disabled },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
}: FieldInputRenderProps<
  FieldInputSwitchExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const switchRef = React.useRef<HTMLButtonElement>(null);

  useFieldEditCallback(onEditRef, () => switchRef.current?.focus());

  return (
    <div
      className={cn(
        'flex min-h-9 items-center rounded-md border border-input px-3',
        getInputClassName(),
        {
          'border-destructive': isError,
        },
      )}
    >
      <Switch
        {...switchProps}
        ref={switchRef}
        checked={!!currentValue}
        onCheckedChange={checked =>
          handleValueChange(checked as TFieldPathValue)
        }
        disabled={disabled || readOnly}
        aria-invalid={isError}
        className={switchProps?.className}
      />
    </div>
  );
}
