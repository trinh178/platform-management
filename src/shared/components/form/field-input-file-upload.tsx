'use client';

import React from 'react';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import FileUpload, { FileUploadValue } from '../inputs/file-upload';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';

export type FieldInputFileUploadValue = FileUploadValue;

type FieldInputFileUploadExtendsProps = Pick<
  React.ComponentProps<typeof FileUpload>,
  | 'accept'
  | 'browseText'
  | 'emptyText'
  | 'formatFileSize'
  | 'maxFiles'
  | 'maxSize'
  | 'maxVisibleFiles'
  | 'multiple'
  | 'placeholder'
>;

export type FieldInputFileUploadProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputFileUploadExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

function getFileUploadValues(value: unknown): FileUploadValue[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(
      (item): item is FileUploadValue =>
        typeof item === 'object' && item !== null && 'name' in item,
    );
  }

  if (typeof value === 'object' && value !== null && 'name' in value) {
    return [value as FileUploadValue];
  }

  return [];
}

export default function FieldInputFileUpload<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputFileUploadProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : props.multiple
      ? ([] as TFieldPathValue)
      : undefined;

  const p = {
    ...props,
    clearValue,
    isClearableValue: (value: TFieldPathValue | undefined) =>
      getFileUploadValues(value).length > 0,
    RenderComponent: FieldInputFileUploadRender,
  } as FieldInputBaseProps<
    FieldInputFileUploadExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputFileUploadRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    accept,
    browseText,
    disabled,
    emptyText,
    formatFileSize,
    loading,
    maxFiles,
    maxSize,
    maxVisibleFiles,
    multiple,
    placeholder,
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
  FieldInputFileUploadExtendsProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const openFileDialogRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    onEditRef.current = () => {
      openFileDialogRef.current?.();
    };
  }, [onEditRef]);

  return (
    <FileUpload
      value={currentValue as FileUploadValue | FileUploadValue[] | undefined}
      onValueChange={value => handleValueChange(value as TFieldPathValue)}
      readOnly={readOnly}
      isError={isError}
      className={getInputClassName('pe-0')}
      inputStyle={componentInputStyle}
      controlStyle={componentControlStyle}
      controlClassName={componentControlClassName}
      loading={loading}
      disabled={disabled}
      multiple={multiple}
      accept={accept}
      maxFiles={maxFiles}
      maxSize={maxSize}
      placeholder={placeholder}
      browseText={browseText}
      emptyText={emptyText}
      maxVisibleFiles={maxVisibleFiles}
      formatFileSize={formatFileSize}
      openFileDialogRef={openFileDialogRef}
    />
  );
}
