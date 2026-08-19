'use client';

import React from 'react';
import { CircleX, Pencil, RotateCcw, Save, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form';
import SubSection from '../layout/sub-section';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/shared/lib/utils';

type FieldMode = 'VIEW' | 'EDIT';
type MaybePromise<T> = T | Promise<T>;

interface FieldGroupInlineEditProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  /** Fields to snapshot on edit and restore on cancel. */
  names: FieldPath<TFieldValues>[];
  title?: React.ReactNode;
  description?: React.ReactNode;
  /**
   * - `'VIEW'`: read-only, no actions shown.
   * - `'EDIT'` + `inlineEdit`: locked in VIEW until user clicks pencil.
   * - `'EDIT'` without `inlineEdit`: always editable.
   */
  mode?: FieldMode;
  /** When true (and mode is 'EDIT'), requires explicit edit action — mirrors FieldInputBase behaviour. */
  inlineEdit?: boolean;
  loading?: boolean;
  /** Shows an X button that sets all fields to undefined. */
  clearable?: boolean;
  /** Shows a RotateCcw button that resets all fields to their form default values. */
  resetable?: boolean;
  onSave: (
    getValue: <TName extends FieldPath<TFieldValues>>(
      name: TName,
    ) => FieldPathValue<TFieldValues, TName>,
  ) => MaybePromise<void>;
  /** Called after all fields are cleared to undefined. Use to trigger the update API. */
  onClear?: () => MaybePromise<void>;
  /** Called after all fields are reset to their default values. Use to trigger the update API. */
  onReset?: () => MaybePromise<void>;
  children: (props: { fieldMode: FieldMode }) => React.ReactNode;
  className?: string;
  contentClassName?: string;
}

function getDefaultAtPath(
  defaults: Record<string, unknown> | undefined,
  path: string,
): unknown {
  if (!defaults) return undefined;
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) =>
        acc !== null && typeof acc === 'object'
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      defaults,
    );
}

export default function FieldGroupInlineEdit<TFieldValues extends FieldValues>({
  form,
  names,
  title,
  description,
  mode = 'EDIT',
  inlineEdit,
  loading,
  clearable,
  resetable,
  onSave,
  onClear,
  onReset,
  children,
  className,
  contentClassName,
}: FieldGroupInlineEditProps<TFieldValues>) {
  const t = useTranslations('common.control');
  const [isEditing, setIsEditing] = React.useState(false);
  const snapshotRef = React.useRef<Record<string, unknown>>({});

  React.useEffect(() => {
    if (mode !== 'EDIT') React.startTransition(() => setIsEditing(false));
  }, [mode]);

  const isInlineEditMode = mode === 'EDIT' && !!inlineEdit;
  const fieldMode: FieldMode =
    mode === 'VIEW' || (isInlineEditMode && !isEditing) ? 'VIEW' : 'EDIT';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const watchedValues = form.watch(names as any) as unknown[];

  const hasClearableValue =
    clearable &&
    watchedValues.some(v => v !== undefined && v !== null && v !== '');

  const hasResetableValue =
    resetable &&
    watchedValues.some((current, i) => {
      const defaultVal = getDefaultAtPath(
        form.formState.defaultValues as Record<string, unknown>,
        names[i],
      );
      return JSON.stringify(current) !== JSON.stringify(defaultVal);
    });

  const handleEdit = () => {
    snapshotRef.current = Object.fromEntries(
      names.map(name => [name, form.getValues(name)]),
    );
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onSave(name => form.getValues(name));
    setIsEditing(false);
  };

  const handleCancel = () => {
    names.forEach(name => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setValue(name, snapshotRef.current[name] as any);
    });
    setIsEditing(false);
  };

  const handleClear = async () => {
    names.forEach(name => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setValue(name, undefined as any);
    });
    if (onClear) await onClear();
  };

  const handleReset = async () => {
    names.forEach(name => form.resetField(name));
    if (onReset) await onReset();
  };

  let actions: React.ReactNode;

  if (mode === 'VIEW') {
    actions = undefined;
  } else if (isEditing) {
    // Editing state: save / cancel / reset / clear
    actions = (
      <div className="flex items-center gap-1">
        {hasResetableValue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-xs"
                variant="ghost"
                type="button"
                onClick={handleReset}
                disabled={loading}
              >
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('reset')}</TooltipContent>
          </Tooltip>
        )}
        {hasClearableValue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-xs"
                variant="ghost"
                type="button"
                onClick={handleClear}
                disabled={loading}
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('clear')}</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-xs"
              variant="ghost"
              type="button"
              onClick={handleSave}
              disabled={loading}
            >
              <Save />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('save')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-xs"
              variant="ghost"
              type="button"
              onClick={handleCancel}
              disabled={loading}
            >
              <CircleX />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('cancel')}</TooltipContent>
        </Tooltip>
      </div>
    );
  } else if (isInlineEditMode) {
    // Inline edit mode, not yet editing: only pencil on hover
    actions = (
      <div className="invisible group-hover:visible flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-xs"
              variant="ghost"
              type="button"
              onClick={handleEdit}
              disabled={loading}
            >
              <Pencil />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('edit')}</TooltipContent>
        </Tooltip>
      </div>
    );
  } else if (hasClearableValue || hasResetableValue) {
    // Always-editable EDIT mode: reset / clear on hover
    actions = (
      <div className="invisible group-hover:visible flex items-center gap-1">
        {hasResetableValue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-xs"
                variant="ghost"
                type="button"
                onClick={handleReset}
                disabled={loading}
              >
                <RotateCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('reset')}</TooltipContent>
          </Tooltip>
        )}
        {hasClearableValue && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-xs"
                variant="ghost"
                type="button"
                onClick={handleClear}
                disabled={loading}
              >
                <X />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('clear')}</TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  } else {
    actions = undefined;
  }

  return (
    <SubSection
      title={title}
      description={description}
      actions={actions}
      className={cn(
        'group',
        { 'border-primary border-solid': isEditing },
        className,
      )}
      contentClassName={contentClassName}
    >
      {children({ fieldMode })}
    </SubSection>
  );
}
