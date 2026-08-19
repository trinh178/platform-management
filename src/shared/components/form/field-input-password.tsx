'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import InputBase from '../inputs/input-base';
import { Button } from '../ui/button';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

type InputProps = Omit<
  React.ComponentProps<typeof InputBase>,
  | 'defaultValue'
  | 'disabled'
  | 'isError'
  | 'onChange'
  | 'readOnly'
  | 'type'
  | 'value'
>;

interface FieldInputPasswordExtendsProps {
  inputProps?: InputProps;
  showToggle?: boolean;
}

export type FieldInputPasswordProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputPasswordExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputPassword<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputPasswordProps<
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
      componentControlWidthRem={props.showToggle === false ? 0 : undefined}
      RenderComponent={FieldInputPasswordRender}
    />
  );
}

function FieldInputPasswordRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { disabled, inputProps, placeholder, showToggle = true },
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
  FieldInputPasswordExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [visible, setVisible] = React.useState(false);

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  return (
    <div className="relative">
      <InputBase
        ref={inputRef}
        type={visible ? 'text' : 'password'}
        autoComplete="current-password"
        {...inputProps}
        placeholder={placeholder ?? inputProps?.placeholder}
        value={(currentValue as string | undefined) ?? ''}
        onChange={e => handleValueChange(e.target.value as TFieldPathValue)}
        readOnly={readOnly}
        isError={isError}
        className={getInputClassName(inputProps?.className)}
        style={{
          ...inputProps?.style,
          ...(showToggle ? componentInputStyle : undefined),
        }}
        disabled={disabled}
      />

      {showToggle && (
        <Button
          type="button"
          variant="link"
          size="icon-sm"
          className={`absolute top-1/2 h-8! w-8! -translate-y-1/2 ${componentControlClassName ?? ''}`}
          style={componentControlStyle}
          disabled={disabled}
          onPointerDown={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setVisible(value => !value);
          }}
        >
          {visible ? <EyeOff /> : <Eye />}
          <span className="sr-only">
            {visible ? 'Hide password' : 'Show password'}
          </span>
        </Button>
      )}
    </div>
  );
}
