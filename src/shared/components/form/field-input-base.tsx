'use client';

import React from 'react';
import _isEqual from 'lodash/isEqual';
import { CircleX, Info, Pencil, RotateCcw, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';
import { Button } from '../ui/button';
import { Field, FieldDescription, FieldError, FieldLabel } from '../ui/field';
import { Spinner } from '../ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { notify } from '@/core/notification';
import { cn } from '@/shared/lib/utils';

export type FieldMode = 'VIEW' | 'EDIT';

type MaybePromise<T> = T | Promise<T>;

type ClearButtonOptions = Pick<
  React.ComponentProps<typeof Button>,
  'className' | 'size' | 'variant'
>;

// Visual constants — kept in rems so they compose with Tailwind defaults.
const CONTROL_BUTTON_WIDTH_REM = 2; // 32px — matches Tailwind h-8/w-8
const CONTROL_BUTTON_GAP_REM = 0.25; // 4px
const CONTROL_GROUP_PADDING_REM = 0.5; // 8px (toolbar inner padding)
const COMPONENT_CONTROL_WIDTH_REM = 2.5; // 40px default for chevron/calendar/etc.
const COMPONENT_CONTROL_EDGE_OFFSET_REM = 0.5; // 8px default right offset (right-2)
const inputPaddingClassNames = [
  '',
  'pe-10',
  'pe-20',
  'pe-28',
  'pe-36',
] as const;

/**
 * Default emptiness check for clearable. Treats undefined/null/'' and `false`
 * as empty. Recurses into arrays and objects. Override via `isClearableValue`.
 */
export function isEmptyFieldValue(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (value === false) return true;
  if (value instanceof Date) return false;
  if (Array.isArray(value)) return value.length === 0;

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(
      isEmptyFieldValue,
    );
  }

  return false;
}

export type FieldInputBaseProps<
  TExtendsProps extends object,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = {
  /** Pass a string to show the label. Pass `""` to hide it but keep the space (grid alignment). Omit to hide it and remove the space entirely. */
  label?: string;
  /** Helper text rendered below the input. */
  description?: string;
  /** Info icon (ⓘ) next to the label that shows this text in a tooltip on hover. */
  tooltip?: string;
  /** Shows a red asterisk (*) after the label text. */
  required?: boolean;
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  name: TName;
  onInlineSave?: (
    name: TName,
    value: TFieldPathValue | undefined,
  ) => MaybePromise<void>;
  loading?: boolean;
  mode?: FieldMode;
  inlineEdit?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  /** Value assigned when the X is clicked. Default preserves `null` fields as `null`, otherwise `undefined` (override per field, e.g. `''` for text, `false` for switch). */
  clearValue?: TFieldPathValue | undefined;
  /**
   * Where the clear button is rendered.
   * - `'base'` (default): inside the base toolbar at the right.
   * - `'manual'`: render component places it via `renderClearButton()`.
   */
  clearButtonPlacement?: 'base' | 'manual';
  /**
   * Where the reset (RotateCcw) button is rendered.
   * - `'base'` (default): inside the base toolbar at the right.
   * - `'manual'`: render component places it via `renderResetButton()`.
   */
  resetButtonPlacement?: 'base' | 'manual';
  /**
   * Where the edit/save/cancel buttons are rendered.
   * - `'base'` (default): inside the base toolbar at the right.
   * - `'manual'`: render component places them via `renderEditButton()` / `renderSaveButton()` / `renderCancelButton()`.
   */
  editButtonPlacement?: 'base' | 'manual';
  /** Override the default emptiness check (which also treats `false`/`[]`/empty-object as empty). */
  isClearableValue?: (value: TFieldPathValue | undefined) => boolean;
  /** Extra className applied to the base controls toolbar wrapper. */
  fieldControlsClassName?: string;
  /** Width in rem of the component's own right-side control (chevron/calendar/generate). Defaults to 2.5rem. */
  componentControlWidthRem?: number;
  onValueChange?: (
    value: TFieldPathValue | undefined,
    name: TName,
    form: UseFormReturn<TFieldValues, TContext, TTransformedValues>,
  ) => void;
  RenderComponent: (
    props: FieldInputRenderProps<
      TExtendsProps,
      TFieldValues,
      TContext,
      TTransformedValues,
      TName,
      TFieldPathValue
    >,
  ) => React.ReactNode;
} & TExtendsProps;

export default function FieldInputBase<
  TExtendsProps extends object,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues = TFieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName> = FieldPathValue<
    TFieldValues,
    TName
  >,
>(
  props: FieldInputBaseProps<
    TExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const { form, name } = props;

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldInputBaseInner
          fieldInputProps={props}
          field={field}
          fieldState={fieldState}
        />
      )}
    />
  );
}

function FieldInputBaseInner<
  TExtendsProps extends object,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps,
  field,
  fieldState,
}: {
  fieldInputProps: FieldInputBaseProps<
    TExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
}) {
  const t = useTranslations();

  const {
    label,
    description,
    tooltip,
    required,
    form,
    name,
    onInlineSave,
    loading,
    mode = 'EDIT',
    inlineEdit,
    className,
    disabled,
    clearable,
    clearValue,
    clearButtonPlacement = 'base',
    resetButtonPlacement = 'base',
    editButtonPlacement = 'base',
    isClearableValue,
    fieldControlsClassName,
    componentControlWidthRem = COMPONENT_CONTROL_WIDTH_REM,
    onValueChange,
    RenderComponent,
  } = fieldInputProps;

  const watchedValue = useWatch({
    control: form.control,
    name,
  }) as TFieldPathValue | undefined;
  const fieldValue = watchedValue;

  const [editButtonEditing, setEditButtonEditing] = React.useState(false);
  const [valueSyncKey, setValueSyncKey] = React.useState(0);
  const [draftValue, setDraftValue] = React.useState<
    TFieldPathValue | undefined
  >(fieldValue);
  const originalValueRef = React.useRef<TFieldPathValue | undefined>(
    fieldValue,
  );
  const inferredClearValueRef = React.useRef<TFieldPathValue | undefined>(
    fieldValue === null ? (null as TFieldPathValue) : undefined,
  );
  const hasExplicitClearValue = Object.prototype.hasOwnProperty.call(
    fieldInputProps,
    'clearValue',
  );

  const isEditButton = mode === 'EDIT' && !!inlineEdit;

  // Sync draft to field value when not inline-editing — fixes async form.reset.
  React.useEffect(() => {
    if (!editButtonEditing) {
      React.startTransition(() => setDraftValue(fieldValue));
      originalValueRef.current = fieldValue;
    }
  }, [fieldValue, editButtonEditing]);

  React.useEffect(() => {
    if (!hasExplicitClearValue && fieldValue === null) {
      inferredClearValueRef.current = null as TFieldPathValue;
    }
  }, [fieldValue, hasExplicitClearValue]);

  // Leave edit-button mode if we switch away from EDIT.
  React.useEffect(() => {
    if (mode !== 'EDIT')
      React.startTransition(() => setEditButtonEditing(false));
  }, [mode]);

  const onEditRef = React.useRef<() => void>(null);

  const readOnly = mode === 'VIEW' || (isEditButton && !editButtonEditing);
  const isError = !!fieldState.invalid || !!fieldState.error;
  const currentValue =
    isEditButton && editButtonEditing ? draftValue : fieldValue;

  const canClear =
    !!clearable &&
    !readOnly &&
    !disabled &&
    !loading &&
    (isClearableValue
      ? isClearableValue(currentValue)
      : !isEmptyFieldValue(currentValue));
  const canReset =
    mode === 'EDIT' &&
    !isEditButton &&
    !readOnly &&
    !disabled &&
    !loading &&
    fieldState.isDirty;

  const baseControlCount =
    (canClear && clearButtonPlacement === 'base' ? 1 : 0) +
    (canReset && resetButtonPlacement === 'base' ? 1 : 0) +
    (isEditButton && editButtonPlacement === 'base'
      ? editButtonEditing
        ? 2
        : 1
      : 0);
  const baseControlsWidthRem =
    baseControlCount === 0
      ? 0
      : CONTROL_GROUP_PADDING_REM +
        baseControlCount * CONTROL_BUTTON_WIDTH_REM +
        (baseControlCount - 1) * CONTROL_BUTTON_GAP_REM;
  const shouldShiftComponentControlOnHover =
    isEditButton &&
    editButtonPlacement === 'base' &&
    !editButtonEditing &&
    baseControlCount > 0;
  const componentControlRightRem =
    baseControlsWidthRem > 0
      ? baseControlsWidthRem + CONTROL_BUTTON_GAP_REM
      : COMPONENT_CONTROL_EDGE_OFFSET_REM;
  const componentControlStyle: React.CSSProperties = {
    '--field-component-control-right': `${componentControlRightRem}rem`,
    '--field-component-control-rest-right': shouldShiftComponentControlOnHover
      ? `${COMPONENT_CONTROL_EDGE_OFFSET_REM}rem`
      : `${componentControlRightRem}rem`,
    '--field-component-control-hover-right': `${componentControlRightRem}rem`,
  } as React.CSSProperties;
  const componentControlClassName = shouldShiftComponentControlOnHover
    ? 'right-[var(--field-component-control-rest-right)] transition-[right] group-hover:right-[var(--field-component-control-hover-right)]'
    : 'right-[var(--field-component-control-right)]';
  const componentInputStyle: React.CSSProperties = {
    paddingRight: `${componentControlRightRem + componentControlWidthRem}rem`,
  };
  const baseInputPaddingClassName =
    inputPaddingClassNames[
      Math.min(baseControlCount, inputPaddingClassNames.length - 1)
    ];

  const commitFieldValue = (value: TFieldPathValue | undefined) => {
    field.onChange(value);

    if (value === undefined) {
      form.setValue(name, value as FieldPathValue<TFieldValues, TName>, {
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    }
  };

  const handleValueChange = (value: TFieldPathValue | undefined) => {
    if (isEditButton && editButtonEditing) {
      setDraftValue(value);
      form.clearErrors(name);
      return;
    }
    commitFieldValue(value);
    onValueChange?.(value, name, form);
  };

  const handleClear = () => {
    handleValueChange(
      hasExplicitClearValue ? clearValue : inferredClearValueRef.current,
    );
    setValueSyncKey(value => value + 1);
  };

  const handleReset = () => {
    form.resetField(name);
    form.clearErrors(name);
    setValueSyncKey(value => value + 1);
    onValueChange?.(form.getValues(name), name, form);
  };

  const getInputClassName = (inputClassName?: string) =>
    cn(
      {
        'border-primary':
          isEditButton && editButtonEditing && !fieldState.invalid,
      },
      baseInputPaddingClassName,
      inputClassName,
    );

  const renderClearButton = (options?: ClearButtonOptions) => {
    if (!canClear) return null;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={cn('h-8! w-8!', options?.className)}
            size={options?.size ?? 'icon-sm'}
            type="button"
            variant={options?.variant ?? 'link'}
            onPointerDown={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
          >
            <X />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('common.control.clear')}</TooltipContent>
      </Tooltip>
    );
  };
  const renderResetButton = () => {
    if (!canReset) return null;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8! w-8!"
            size="icon-sm"
            type="button"
            variant="link"
            onPointerDown={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleReset();
            }}
          >
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('common.control.reset')}</TooltipContent>
      </Tooltip>
    );
  };

  const renderEditButton = () => {
    if (!isEditButton || editButtonEditing) return null;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8! w-8!"
            size="icon-sm"
            type="button"
            variant="link"
            onClick={handleEdit}
          >
            <Pencil />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('common.control.edit')}</TooltipContent>
      </Tooltip>
    );
  };

  const renderSaveButton = () => {
    if (!isEditButton || !editButtonEditing) return null;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8! w-8! animate-in slide-in-from-right"
            size="icon-sm"
            type="button"
            variant="link"
            onClick={handleSave}
            disabled={_isEqual(draftValue, fieldValue)}
          >
            <Save />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('common.control.save')}</TooltipContent>
      </Tooltip>
    );
  };

  const renderCancelButton = () => {
    if (!isEditButton || !editButtonEditing) return null;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="h-8! w-8!"
            size="icon-sm"
            type="button"
            variant="link"
            onClick={handleCancel}
          >
            <CircleX />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('common.control.cancel')}</TooltipContent>
      </Tooltip>
    );
  };

  const handleEdit = () => {
    originalValueRef.current = fieldValue;
    setDraftValue(fieldValue);
    setEditButtonEditing(true);
    onEditRef.current?.();
  };

  const handleSave = async () => {
    commitFieldValue(draftValue);
    const valid = await form.trigger(name);
    if (!valid) {
      notify.error('validation.edit_invalid');
      return;
    }
    onValueChange?.(draftValue, name, form);
    await onInlineSave?.(name, draftValue);
    originalValueRef.current = draftValue;
    setEditButtonEditing(false);
  };

  const handleCancel = () => {
    const original = originalValueRef.current;
    field.onChange(original);
    form.clearErrors(name);
    setDraftValue(original);
    setEditButtonEditing(false);
    setValueSyncKey(value => value + 1);
  };

  const renderInToolbar =
    ((canClear && clearButtonPlacement === 'base') ||
      (canReset && resetButtonPlacement === 'base')) &&
    !(isEditButton && editButtonPlacement === 'base');
  const hasBasePlacement =
    editButtonPlacement === 'base' ||
    clearButtonPlacement === 'base' ||
    resetButtonPlacement === 'base';
  const showToolbar =
    (!disabled && isEditButton && editButtonPlacement === 'base') ||
    renderInToolbar ||
    (!!loading && hasBasePlacement);

  return (
    <Field className={className}>
      <FieldLabel
        className={cn({
          invisible: label === '',
          hidden: label === undefined && !tooltip,
        })}
      >
        {label !== undefined && (label || '_')}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        )}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={-1}
                className="inline-flex cursor-help text-muted-foreground"
              >
                <Info className="size-3.5" />
              </span>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        )}
      </FieldLabel>
      <div className="relative group">
        <RenderComponent
          fieldInputProps={fieldInputProps}
          isEditButton={isEditButton}
          editButtonEditing={editButtonEditing}
          readOnly={readOnly}
          isError={isError}
          currentValue={currentValue}
          handleValueChange={handleValueChange}
          getInputClassName={getInputClassName}
          field={field}
          fieldState={fieldState}
          draftValue={draftValue}
          setDraftValue={setDraftValue}
          onEditRef={onEditRef}
          canClear={canClear}
          handleClear={handleClear}
          renderClearButton={renderClearButton}
          canReset={canReset}
          handleReset={handleReset}
          renderResetButton={renderResetButton}
          renderEditButton={renderEditButton}
          renderSaveButton={renderSaveButton}
          renderCancelButton={renderCancelButton}
          baseControlCount={baseControlCount}
          baseControlsWidthRem={baseControlsWidthRem}
          componentControlStyle={componentControlStyle}
          componentControlClassName={componentControlClassName}
          componentInputStyle={componentInputStyle}
          valueSyncKey={valueSyncKey}
        />

        {showToolbar && (
          <div
            className={cn(
              'hidden group-hover:flex absolute top-0 right-0 h-full overflow-hidden rounded-e-md items-center gap-1 px-1',
              {
                flex:
                  editButtonEditing ||
                  renderInToolbar ||
                  (!!loading && hasBasePlacement),
              },
              fieldControlsClassName,
            )}
          >
            {loading ? (
              <div className="p-2">
                <Spinner />
              </div>
            ) : !editButtonEditing ? (
              <>
                {canClear &&
                  clearButtonPlacement === 'base' &&
                  renderClearButton()}
                {canReset &&
                  resetButtonPlacement === 'base' &&
                  renderResetButton()}
                {isEditButton &&
                  editButtonPlacement === 'base' &&
                  renderEditButton()}
              </>
            ) : (
              <>
                {canClear &&
                  clearButtonPlacement === 'base' &&
                  renderClearButton()}
                {canReset &&
                  resetButtonPlacement === 'base' &&
                  renderResetButton()}
                {editButtonPlacement === 'base' && renderSaveButton()}
                {editButtonPlacement === 'base' && renderCancelButton()}
              </>
            )}
          </div>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
}

/**
 * Register a callback to run when the user clicks the inline-edit pencil button.
 * Typically used by render components to focus the input or open a popup.
 */
export function useFieldEditCallback(
  onEditRef: React.RefObject<(() => void) | null>,
  callback: () => void,
) {
  React.useEffect(() => {
    onEditRef.current = callback;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onEditRef]);
}

export type FieldInputBasePropsExceptRender<
  TExtendsProps extends object,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = Omit<
  FieldInputBaseProps<
    TExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
  'RenderComponent'
>;

export interface FieldInputRenderProps<
  TExtendsProps extends object,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> {
  fieldInputProps: FieldInputBasePropsExceptRender<
    TExtendsProps,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;
  isEditButton?: boolean;
  editButtonEditing: boolean;
  readOnly: boolean;
  isError: boolean;
  currentValue: TFieldPathValue | undefined;
  handleValueChange: (value: TFieldPathValue | undefined) => void;
  getInputClassName: (inputClassName?: string) => string;
  /** Draft value while inline-editing (before Save commits). */
  draftValue: TFieldPathValue | undefined;
  setDraftValue: (value: TFieldPathValue | undefined) => void;
  field: ControllerRenderProps<TFieldValues, TName>;
  fieldState: ControllerFieldState;
  onEditRef: React.RefObject<(() => void) | null>;
  /** True when X should be available (clearable + has value + interactive). */
  canClear: boolean;
  /** Trigger clear. */
  handleClear: () => void;
  /** Render the X button. Returns null if `!canClear`. Used when `clearButtonPlacement='manual'`. */
  renderClearButton: (options?: ClearButtonOptions) => React.ReactNode;
  /** True when RotateCcw should be available (field is dirty + interactive). */
  canReset: boolean;
  /** Trigger reset. */
  handleReset: () => void;
  /** Render the RotateCcw button. Returns null if `!canReset`. Used when `resetButtonPlacement='manual'`. */
  renderResetButton: () => React.ReactNode;
  /** Render the Pencil button. Returns null when not in edit-button mode or already editing. Used when `editButtonPlacement='manual'`. */
  renderEditButton: () => React.ReactNode;
  /** Render the Save button. Returns null when not editing. Used when `editButtonPlacement='manual'`. */
  renderSaveButton: () => React.ReactNode;
  /** Render the Cancel button. Returns null when not editing. Used when `editButtonPlacement='manual'`. */
  renderCancelButton: () => React.ReactNode;
  /** Number of base-rendered controls (clear/pencil/save/cancel). */
  baseControlCount: number;
  /** Pixel-equivalent width (rem) reserved by base controls. */
  baseControlsWidthRem: number;
  /** Spread onto the render component's own right-side control (chevron/calendar/generate). */
  componentControlStyle: React.CSSProperties;
  /** Companion className with hover transition for the component control. */
  componentControlClassName?: string;
  /** Spread onto the input itself to reserve right padding for component's own control. */
  componentInputStyle: React.CSSProperties;
  /** Increments when base controls force the render component to sync its display value. */
  valueSyncKey: number;
}
