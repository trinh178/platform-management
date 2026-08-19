'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { FileUploadValue } from '../inputs/file-upload';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';
import { cn } from '@/shared/lib/utils';

export type FieldInputAvatarValue = FileUploadValue;

interface FieldInputAvatarExtendsProps {
  accept?: string;
  browseText?: string;
  fallback?: React.ReactNode;
  maxSize?: number;
  previewAlt?: string;
  size?: 'default' | 'lg' | 'sm';
}

export type FieldInputAvatarProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputAvatarExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

function isAvatarValue(value: unknown): value is FieldInputAvatarValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('url' in value || 'file' in value || 'name' in value)
  );
}

function toAvatarValue(file: File): FieldInputAvatarValue {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    file,
  };
}

function getAvatarValue(value: unknown) {
  return isAvatarValue(value) ? value : undefined;
}

function getAvatarClassName(size: FieldInputAvatarExtendsProps['size']) {
  if (size === 'sm') return 'size-10';
  if (size === 'default') return 'size-12';

  return 'size-14';
}

export default function FieldInputAvatar<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputAvatarProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : undefined;

  const p = {
    ...props,
    accept: props.accept ?? 'image/*',
    clearValue,
    componentControlWidthRem: props.componentControlWidthRem ?? 2.5,
    isClearableValue: (value: TFieldPathValue | undefined) =>
      getAvatarValue(value) !== undefined,
    RenderComponent: FieldInputAvatarRender,
  } as FieldInputBaseProps<
    FieldInputAvatarExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputAvatarRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    accept = 'image/*',
    browseText = 'Choose avatar',
    disabled,
    fallback,
    loading,
    maxSize,
    previewAlt,
    size = 'lg',
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
  FieldInputAvatarExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const avatarValue = getAvatarValue(currentValue);
  const [objectUrl, setObjectUrl] = React.useState<string>();
  const isDisabled = disabled || loading;
  const previewUrl = avatarValue?.file ? objectUrl : avatarValue?.url;

  const openFileDialog = React.useCallback(() => {
    if (isDisabled || readOnly) return;

    inputRef.current?.click();
  }, [isDisabled, readOnly]);

  React.useEffect(() => {
    onEditRef.current = openFileDialog;
  }, [onEditRef, openFileDialog]);

  React.useEffect(() => {
    if (!avatarValue?.file) {
      React.startTransition(() => setObjectUrl(undefined));
      return;
    }

    const nextObjectUrl = URL.createObjectURL(avatarValue.file);
    React.startTransition(() => setObjectUrl(nextObjectUrl));

    return () => {
      URL.revokeObjectURL(nextObjectUrl);
    };
  }, [avatarValue?.file]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (maxSize !== undefined && file.size > maxSize) return;

    handleValueChange(toAvatarValue(file) as TFieldPathValue);
  };

  return (
    <div
      className={cn(
        'relative flex h-20 w-full items-center gap-3 rounded-md border border-input bg-background px-3',
        getInputClassName('pe-0'),
        {
          'border-destructive': isError,
          'opacity-50 pointer-events-none': isDisabled,
        },
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={isDisabled || readOnly}
        className="sr-only"
        onChange={handleChange}
      />
      <button
        type="button"
        className="shrink-0 rounded-full text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        disabled={isDisabled || readOnly}
        onClick={openFileDialog}
      >
        <Avatar size={size} className={getAvatarClassName(size)}>
          <AvatarImage src={previewUrl} alt={previewAlt ?? avatarValue?.name} />
          <AvatarFallback>{fallback ?? 'AV'}</AvatarFallback>
        </Avatar>
      </button>
      <div className="min-w-0 flex-1 text-sm" style={componentInputStyle}>
        <div className="truncate font-medium">
          {avatarValue?.name ?? browseText}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {previewUrl ? accept : browseText}
        </div>
      </div>
      {!readOnly && (
        <Button
          type="button"
          variant="link"
          size="icon-sm"
          className={cn(
            'absolute top-1/2 h-8! w-8! -translate-y-1/2',
            componentControlClassName,
          )}
          style={componentControlStyle ?? { right: '0.5rem' }}
          disabled={isDisabled}
          onPointerDown={event => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            openFileDialog();
          }}
        >
          <Camera />
          <span className="sr-only">{browseText}</span>
        </Button>
      )}
    </div>
  );
}
