'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import InputBase from '../inputs/input-base';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  useFieldEditCallback,
} from './field-input-base';
import { cn } from '@/shared/lib/utils';

type InputProps = Omit<
  React.ComponentProps<typeof InputBase>,
  'defaultValue' | 'disabled' | 'isError' | 'onChange' | 'readOnly' | 'value'
>;

interface FieldInputGeneratedTextExtendsProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> {
  inputProps?: InputProps;
  getGeneratedText?: () => Promise<TFieldPathValue | undefined>;
  autoGenerateIfEmpty?: boolean;
  disableInput?: boolean;
}

export type FieldInputGeneratedTextProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputGeneratedTextExtendsProps<TFieldValues, TName, TFieldPathValue>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

const GENERATED_TEXT_BUTTON_WIDTH_REM = 5.25; // 84px — fits the "Generate" label

export default function FieldInputGeneratedText<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputGeneratedTextProps<
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
    componentControlWidthRem: GENERATED_TEXT_BUTTON_WIDTH_REM,
    RenderComponent: FieldInputGeneratedTextRender,
  } as FieldInputBaseProps<
    FieldInputGeneratedTextExtendsProps<TFieldValues, TName, TFieldPathValue>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;
  return <FieldInputBase {...p} />;
}

function FieldInputGeneratedTextRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    inputProps,
    getGeneratedText,
    loading,
    disabled,
    placeholder,
    autoGenerateIfEmpty,
    disableInput,
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
  FieldInputGeneratedTextExtendsProps<TFieldValues, TName, TFieldPathValue>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const t = useTranslations();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [generateLoading, setGenerateLoading] = React.useState(false);

  useFieldEditCallback(onEditRef, () => inputRef.current?.focus());

  // Auto-generate on mount when field is empty
  React.useEffect(() => {
    if (
      !autoGenerateIfEmpty ||
      !getGeneratedText ||
      (currentValue !== undefined &&
        currentValue !== null &&
        currentValue !== '')
    ) {
      return;
    }
    getGeneratedText()
      .then(code => {
        if (code !== undefined) handleValueChange(code);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerateIfEmpty]);

  const handleGenerate = async () => {
    if (!getGeneratedText) return;
    try {
      setGenerateLoading(true);
      const code = await getGeneratedText();
      handleValueChange(code);
    } finally {
      setGenerateLoading(false);
    }
  };

  const isBusy = loading || generateLoading;

  return (
    <div
      className={cn(
        'relative h-9 w-full overflow-hidden rounded-md border border-input',
        {
          'border-destructive': isError,
        },
        getInputClassName('pe-0'),
      )}
    >
      <InputBase
        ref={inputRef}
        type="text"
        {...inputProps}
        placeholder={placeholder ?? inputProps?.placeholder}
        value={(currentValue as string | undefined) ?? ''}
        onChange={e => handleValueChange(e.target.value as TFieldPathValue)}
        readOnly={readOnly}
        isError={isError}
        className={cn(
          'h-full rounded-none border-0 shadow-none focus-visible:ring-0',
          inputProps?.className,
        )}
        style={{
          ...inputProps?.style,
          ...componentInputStyle,
        }}
        disabled={isBusy || disabled || disableInput}
      />
      <Button
        variant="outline"
        type="button"
        onClick={handleGenerate}
        className={cn(
          'absolute top-1/2 h-8! w-20 -translate-y-1/2 rounded-md',
          componentControlClassName,
        )}
        style={componentControlStyle}
        disabled={isBusy || readOnly || disabled}
      >
        {isBusy ? <Spinner /> : t('common.control.generate')}
      </Button>
    </div>
  );
}
