'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { Textarea } from '../ui/textarea';
import FieldInputBase, {
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';

interface FieldInputJsonExtendsProps {
  rows?: number;
}

export type FieldInputJsonProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputJsonExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

export default function FieldInputJson<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputJsonProps<
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
      RenderComponent={FieldInputJsonRender}
    />
  );
}

function FieldInputJsonRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { disabled, placeholder, rows = 6 },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
}: FieldInputRenderProps<
  FieldInputJsonExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useFieldEditCallback(onEditRef, () => textareaRef.current?.focus());

  const handleBlur = () => {
    const value = (currentValue as string | undefined)?.trim();
    if (!value) return;
    try {
      handleValueChange(
        JSON.stringify(JSON.parse(value), null, 2) as TFieldPathValue,
      );
    } catch {
      // invalid JSON — giữ nguyên, Zod hiện lỗi
    }
  };

  const stringValue = (currentValue as string | undefined) ?? '';

  if (readOnly) {
    if (!stringValue) {
      return <p className="text-sm text-muted-foreground">-</p>;
    }
    return (
      <pre className="overflow-auto rounded-md bg-muted px-3 py-2 text-xs">
        {stringValue}
      </pre>
    );
  }

  return (
    <Textarea
      ref={textareaRef}
      placeholder={placeholder ?? '{ "key": "value" }'}
      value={stringValue}
      onChange={e => handleValueChange(e.target.value as TFieldPathValue)}
      onBlur={handleBlur}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName('font-mono text-xs')}
      disabled={disabled}
      rows={rows}
    />
  );
}
