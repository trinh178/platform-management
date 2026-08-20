'use client';

import React from 'react';
import { ImageOff, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { notify } from '@/core/notification';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from '@/shared/components/form/field-input-base';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { useAssetUpload } from '@/shared/services/asset.mutation';

const MAX_ASSET_SIZE = 2 * 1024 * 1024; // 2MB
const IMAGE_ACCEPT =
  'image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon';

type AssetRefUploadFieldExtraProps = {
  /** Category gửi kèm lên Asset Service, vd ORGANIZATION_LOGO, BRANDING_FAVICON. */
  category: string;
  /**
   * URL preview hiện tại (resolve từ nested AssetRef trả về ở GET, vd
   * `data.logo?.url`) — field chỉ lưu assetId, không lưu url.
   */
  previewUrl?: string;
};

export type AssetRefUploadFieldProps<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  AssetRefUploadFieldExtraProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

// Field upload logo/favicon dùng chung cho Organization/Branding Settings — khác
// với Registry's IconUploadField ở chỗ field chỉ lưu `assetId` (uuid), không lưu
// url trực tiếp; xem docs.business/shared/entities.yaml#AssetRef.
export default function AssetRefUploadField<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: AssetRefUploadFieldProps<
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
    RenderComponent: AssetRefUploadRender,
  } as FieldInputBaseProps<
    AssetRefUploadFieldExtraProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function AssetRefUploadRender<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: { category, previewUrl: knownPreviewUrl },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  getInputClassName,
  onEditRef,
  componentControlStyle,
  componentControlClassName,
}: FieldInputRenderProps<
  AssetRefUploadFieldExtraProps,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const t = useTranslations();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const upload = useAssetUpload();
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = React.useState<
    string | undefined
  >(undefined);

  const assetId = typeof currentValue === 'string' ? currentValue : undefined;
  const previewUrl =
    uploadedPreviewUrl ?? (assetId ? knownPreviewUrl : undefined);
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

    if (file.size > MAX_ASSET_SIZE) {
      notify.error('settings.common.validation.assetTooLarge');
      return;
    }

    try {
      const asset = await upload.mutateAsync({ file, category });
      setUploadedPreviewUrl(asset.url);
      handleValueChange(asset.id as TFieldPathValue);
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
        accept={IMAGE_ACCEPT}
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
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="size-5 shrink-0 rounded-sm border object-cover"
          />
        ) : (
          <ImageOff className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="min-w-0 flex-1 truncate text-muted-foreground">
          {upload.isPending
            ? t('common.notify.loading')
            : assetId
              ? assetId
              : t('settings.common.controls.uploadAsset')}
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
