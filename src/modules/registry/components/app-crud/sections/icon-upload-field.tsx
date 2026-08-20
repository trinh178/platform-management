'use client';

import React from 'react';
import { ImageOff, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { notify } from '@/core/notification';
import { useAssetUpload } from '@/modules/registry/services/asset.mutation';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from '@/shared/components/form/field-input-base';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const MAX_ICON_SIZE = 2 * 1024 * 1024; // 2MB
const ICON_ACCEPT = 'image/png,image/jpeg,image/svg+xml,image/webp';

export type IconUploadFieldProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  object,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

// Field upload icon cho App — thay vì nhập tay URL, ảnh được upload qua PLM
// backend (forward lên Asset Service, xem docs.business/external-services.yaml)
// và trả về url để lưu vào field `iconUrl` (string) như bình thường.
export default function IconUploadField<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: IconUploadFieldProps<
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : (undefined as TFieldPathValue);

  const p = {
    ...props,
    clearValue,
    RenderComponent: IconUploadRender,
  } as FieldInputBaseProps<
    object,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function IconUploadRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
  componentControlStyle,
  componentControlClassName,
}: FieldInputRenderProps<
  object,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const t = useTranslations();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const upload = useAssetUpload();

  const iconUrl = typeof currentValue === 'string' ? currentValue : undefined;
  const isDisabled = readOnly || upload.isPending;

  const handleOpenFileDialog = React.useCallback(() => {
    if (isDisabled) return;
    inputRef.current?.click();
  }, [isDisabled]);

  React.useEffect(() => {
    onEditRef.current = handleOpenFileDialog;
  }, [onEditRef, handleOpenFileDialog]);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_ICON_SIZE) {
      notify.error('registry.app.validation.iconTooLarge');
      return;
    }

    try {
      const asset = await upload.mutateAsync({ file, category: 'APP_ICON' });
      handleValueChange(asset.url as TFieldPathValue);
    } catch {
      notify.error('common.notify.error');
    }
  };

  return (
    <div
      className={cn(
        'relative h-9 w-full rounded-md border border-input bg-background',
        {
          'border-destructive': isError,
          'opacity-50 pointer-events-none': isDisabled,
        },
        getInputClassName('pe-0'),
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ICON_ACCEPT}
        disabled={isDisabled}
        className="sr-only"
        onChange={handleChange}
      />

      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        className="flex h-full w-full min-w-0 items-center gap-2 overflow-hidden px-3 text-left text-sm"
        onClick={handleOpenFileDialog}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenFileDialog();
          }
        }}
      >
        {iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={iconUrl}
            alt=""
            className="size-5 shrink-0 rounded-sm border object-cover"
          />
        ) : (
          <ImageOff className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          {upload.isPending
            ? t('common.notify.loading')
            : iconUrl
              ? iconUrl
              : t('registry.app.controls.uploadIcon')}
        </span>
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
          style={componentControlStyle}
          disabled={isDisabled}
          loading={upload.isPending}
          onPointerDown={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            handleOpenFileDialog();
          }}
        >
          <Upload />
        </Button>
      )}
    </div>
  );
}
