'use client';

import React from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DefaultValues,
  FieldPath,
  FieldPathValue,
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
  useForm,
} from 'react-hook-form';
import { DataTablePlain, PlainTableColumnDef } from '../data-table/plain';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
  FieldMode,
} from './field-input-base';
import { notify } from '@/core/notification';
import SectionPanel from '@/shared/components/layout/section-panel';
import { Spinner } from '@/shared/components/ui/spinner';
import { cn } from '@/shared/lib/utils';
import { CRUDMode } from '@/shared/types/crud';
import { getCRUDActionLabel } from '@/shared/utils';

export interface FieldInputArrayTableEditorProps<TRow extends FieldValues> {
  form: UseFormReturn<TRow>;
  mode: FieldMode;
  disabled: boolean;
}

interface FieldInputArrayTableExtendsProps<TRow extends FieldValues> {
  /** @internal Original label carried through after base label is suppressed. */
  _label?: string;
  /** Column definitions for DataTablePlain. Edit/delete actions are added automatically in EDIT mode. */
  columns: PlainTableColumnDef<TRow>[];
  /** Creates the initial row value when the user clicks Add. */
  createDefaultRow: () => TRow;
  /** Renders the modal body. Use FieldInput* components with the supplied row form. */
  renderEditor: (
    props: FieldInputArrayTableEditorProps<TRow>,
  ) => React.ReactNode;
  /** Extra options for the row form, typically a validation resolver. */
  rowFormOptions?: UseFormProps<TRow>;
  /** Stable row key. Defaults to the row index. */
  getRowKey?: (row: TRow, index: number) => string;
  /** Custom dialog title. */
  getDialogTitle?: (mode: CRUDMode, row?: TRow) => React.ReactNode;
  /** Custom text shown in DELETE mode. */
  getDeleteDescription?: (row: TRow) => React.ReactNode;
  /** Label for the Add button. */
  addLabel?: React.ReactNode;
  /** Custom empty-state content when the table has no rows. */
  emptyState?: React.ReactNode;
  /** Show skeleton rows while loading. */
  isFetching?: boolean;
  /** Footer ReactNode rendered inside <TableFooter>. */
  footer?: React.ReactNode;
  modalContentClassName?: string;
  /** Optional hook for async validation before committing the row into the array. */
  validateRow?: (
    row: TRow,
    mode: CRUDMode,
    index?: number,
  ) => boolean | Promise<boolean>;
  onAddRow?: (row: TRow, index: number) => void;
  onUpdateRow?: (row: TRow, index: number) => void;
  onRemoveRow?: (row: TRow, index: number) => void;
}

export type FieldInputArrayTableProps<
  TRow extends FieldValues,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputArrayTableExtendsProps<TRow>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

/**
 * FieldInput that stores an editable array of row objects (`TRow[]`).
 *
 * This is for small embedded sub-tables that are submitted together with the
 * parent form, such as employee qualifications during employee create/update.
 */
export default function FieldInputArrayTable<
  TRow extends FieldValues,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputArrayTableProps<
    TRow,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >,
) {
  const { label, ...propsWithoutLabel } = props;

  const clearValue = Object.prototype.hasOwnProperty.call(props, 'clearValue')
    ? props.clearValue
    : ([] as unknown as TFieldPathValue);

  const p = {
    ...propsWithoutLabel,
    label: undefined,
    _label: label,
    clearValue,
    clearButtonPlacement: 'manual' as const,
    resetButtonPlacement: 'manual' as const,
    editButtonPlacement: 'manual' as const,
    RenderComponent: FieldInputArrayTableRender,
  } as FieldInputBaseProps<
    FieldInputArrayTableExtendsProps<TRow>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function FieldInputArrayTableRender<
  TRow extends FieldValues,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    _label,
    columns,
    createDefaultRow,
    renderEditor,
    rowFormOptions,
    getRowKey,
    getDialogTitle,
    getDeleteDescription,
    addLabel,
    emptyState,
    isFetching,
    footer,
    modalContentClassName,
    validateRow,
    onAddRow,
    onUpdateRow,
    onRemoveRow,
    loading,
    disabled,
  },
  currentValue,
  handleValueChange,
  readOnly,
  isError,
  isEditButton,
  editButtonEditing,
  canClear,
  renderClearButton,
  canReset,
  renderResetButton,
  renderEditButton,
  renderSaveButton,
  renderCancelButton,
}: FieldInputRenderProps<
  FieldInputArrayTableExtendsProps<TRow>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const t = useTranslations();

  const rows = React.useMemo(
    () => (Array.isArray(currentValue) ? (currentValue as TRow[]) : []),
    [currentValue],
  );

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<CRUDMode>('CREATE');
  const [editingIndex, setEditingIndex] = React.useState<number | undefined>();
  const [submitting, setSubmitting] = React.useState(false);

  const rowForm = useForm<TRow>({
    ...rowFormOptions,
    reValidateMode: 'onSubmit',
  });

  const closeDialog = React.useCallback(() => {
    setDialogOpen(false);
    setSubmitting(false);
  }, []);

  const openCreate = React.useCallback(() => {
    setDialogMode('CREATE');
    setEditingIndex(undefined);
    rowForm.reset(createDefaultRow() as DefaultValues<TRow>);
    setDialogOpen(true);
  }, [createDefaultRow, rowForm]);

  const openUpdate = React.useCallback(
    (index: number) => {
      setDialogMode('UPDATE');
      setEditingIndex(index);
      rowForm.reset(rows[index] as DefaultValues<TRow>);
      setDialogOpen(true);
    },
    [rowForm, rows],
  );

  const openDelete = React.useCallback(
    (index: number) => {
      setDialogMode('DELETE');
      setEditingIndex(index);
      rowForm.reset(rows[index] as DefaultValues<TRow>);
      setDialogOpen(true);
    },
    [rowForm, rows],
  );

  const commitRows = React.useCallback(
    (nextRows: TRow[]) =>
      handleValueChange(nextRows as unknown as TFieldPathValue),
    [handleValueChange],
  );

  const onSubmit: SubmitHandler<TRow> = React.useCallback(
    async data => {
      setSubmitting(true);
      try {
        const valid = await validateRow?.(data, dialogMode, editingIndex);
        if (valid === false) return;

        if (dialogMode === 'CREATE') {
          const nextRows = [...rows, data];
          commitRows(nextRows);
          onAddRow?.(data, nextRows.length - 1);
        } else if (dialogMode === 'UPDATE' && editingIndex !== undefined) {
          const nextRows = rows.map((row, index) =>
            index === editingIndex ? data : row,
          );
          commitRows(nextRows);
          onUpdateRow?.(data, editingIndex);
        } else if (dialogMode === 'DELETE' && editingIndex !== undefined) {
          const deletedRow = rows[editingIndex];
          const nextRows = rows.filter((_, index) => index !== editingIndex);
          commitRows(nextRows);
          onRemoveRow?.(deletedRow, editingIndex);
        }

        closeDialog();
      } finally {
        setSubmitting(false);
      }
    },
    [
      closeDialog,
      commitRows,
      dialogMode,
      editingIndex,
      onAddRow,
      onRemoveRow,
      onUpdateRow,
      rows,
      validateRow,
    ],
  );

  const onInvalid: SubmitErrorHandler<TRow> = React.useCallback(error => {
    console.error(error);
    notify.error('validation.form_invalid');
  }, []);

  const isEditable = !readOnly && !disabled;
  const currentDialogRow =
    editingIndex === undefined ? undefined : rows[editingIndex];
  const actionLabel = getCRUDActionLabel(t, dialogMode);
  const dialogTitle =
    getDialogTitle?.(dialogMode, currentDialogRow) ?? actionLabel;
  const fieldMode = dialogMode === 'DELETE' ? 'VIEW' : 'EDIT';

  const tableColumns = React.useMemo<PlainTableColumnDef<TRow>[]>(() => {
    const rowNumberCol: PlainTableColumnDef<TRow> = {
      key: '__rowNumber',
      header: t('common.label.no'),
      align: 'center',
      headerClassName: 'w-16',
      className: 'text-muted-foreground tabular-nums',
      render: (_row, index) => index + 1,
    };

    const cols: PlainTableColumnDef<TRow>[] = [rowNumberCol, ...columns];

    if (isEditable || isEditButton) {
      cols.push({
        key: '__actions',
        header: '',
        align: 'center',
        headerClassName: 'w-20',
        render: (_row, index) => (
          <div
            className={cn(
              'flex justify-center gap-1',
              !isEditable && 'invisible',
            )}
          >
            <Button
              size="icon-sm"
              type="button"
              variant="ghost"
              onClick={() => openUpdate(index)}
            >
              <Pencil />
            </Button>
            <Button
              size="icon-sm"
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => openDelete(index)}
            >
              <Trash2 />
            </Button>
          </div>
        ),
      });
    }

    return cols;
  }, [columns, isEditable, isEditButton, openDelete, openUpdate, t]);

  const actions =
    loading || canReset || canClear || isEditable || isEditButton ? (
      <div className="flex items-center gap-1">
        {loading ? (
          <Spinner />
        ) : (
          <>
            {renderEditButton()}
            {renderSaveButton()}
            {renderCancelButton()}
            {canReset && renderResetButton()}
            {canClear && renderClearButton()}
            {isEditable && (
              <Button
                type="button"
                size="sm"
                variant="link"
                className="text-primary"
                onClick={openCreate}
              >
                <Plus />
                {addLabel ?? t('common.control.add')}
              </Button>
            )}
          </>
        )}
      </div>
    ) : undefined;

  return (
    <>
      <SectionPanel
        className={cn(
          isError
            ? 'ring-1 ring-destructive'
            : isEditButton && editButtonEditing && 'ring-1 ring-primary',
        )}
        title={
          _label ? (
            <span className={cn(isError && 'text-destructive')}>{_label}</span>
          ) : undefined
        }
        actions={actions}
      >
        <DataTablePlain
          columns={tableColumns}
          data={rows}
          isFetching={isFetching}
          getRowKey={getRowKey}
          footer={footer}
          emptyState={emptyState}
        />
      </SectionPanel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className={modalContentClassName}
          onPointerDownOutside={e => e.preventDefault()}
          onEscapeKeyDown={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'DELETE'
                ? (getDeleteDescription?.(rowForm.getValues()) ?? '')
                : ''}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={event => {
              event.stopPropagation();
              if (dialogMode === 'DELETE') {
                event.preventDefault();
                void onSubmit(rowForm.getValues());
                return;
              }
              rowForm.handleSubmit(onSubmit, onInvalid)(event);
            }}
          >
            {renderEditor({
              form: rowForm,
              mode: fieldMode,
              disabled: submitting,
            })}

            <div className="mt-4 flex justify-center gap-4">
              <Button
                className="w-26"
                type="submit"
                loading={submitting}
                variant={dialogMode === 'DELETE' ? 'destructive' : 'default'}
              >
                {actionLabel}
              </Button>
              <Button
                variant="outline"
                className="w-26"
                type="button"
                onClick={closeDialog}
                disabled={submitting}
              >
                {t('common.control.cancel')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
