'use client';

import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form';
import { DataTablePlain, PlainTableColumnDef } from '../data-table/plain';
import { Select } from '../inputs/select';
import { Button } from '../ui/button';
import FieldInputBase, {
  FieldInputBaseProps,
  FieldInputBasePropsExceptRender,
  FieldInputRenderProps,
} from './field-input-base';
import SectionPanel from '@/shared/components/layout/section-panel';
import { Spinner } from '@/shared/components/ui/spinner';
import { cn } from '@/shared/lib/utils';

interface FieldInputEntityTableExtendsProps<TRow> {
  /** @internal Original label carried through after base label is suppressed. */
  _label?: string;
  /** Column definitions for the DataTablePlain (the delete column is added automatically). */
  columns: PlainTableColumnDef<TRow>[];
  /**
   * Load entity options for the search dropdown.
   * Return the full TRow objects — they will be stored directly in the field value.
   */
  loadOptions: (keyword: string) => Promise<TRow[]>;
  /** Extract the unique id from a row. Used to prevent duplicates and as the default row key. */
  getRowValue: (row: TRow) => string;
  /** Label shown for each option in the search dropdown. */
  getRowLabel: (row: TRow) => string;
  /** Pre-populate the dropdown with an initial list or `true` to auto-load on first open. Default `true`. */
  defaultOptions?: TRow[] | boolean;
  /** Load initial options when the dropdown opens for the first time. Default `true`. */
  loadOnOpen?: boolean;
  /** Minimum keyword length before triggering `loadOptions`. Default `0`. */
  minSearchLength?: number;
  /** Debounce delay (ms) before triggering `loadOptions` after typing. */
  debounceTime?: number;
  /** Placeholder text on the search-and-add select. */
  searchPlaceholder?: string;
  /** Called when a load error occurs. */
  onLoadError?: (error: unknown) => void;
  /** Custom empty-state content when the table has no rows. */
  emptyState?: React.ReactNode;
  /** Show skeleton rows while the initial data is loading. */
  isFetching?: boolean;
  /** Footer ReactNode rendered inside <TableFooter> — typically a totals row. */
  footer?: React.ReactNode;
  /** Called after a row is removed (after the value is already updated). */
  onRemoveRow?: (row: TRow, index: number) => void;
}

export type FieldInputEntityTableProps<
  TRow,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
> = FieldInputBasePropsExceptRender<
  FieldInputEntityTableExtendsProps<TRow>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>;

/**
 * FieldInput that stores an array of entity rows (`TRow[]`) displayed as a plain table.
 *
 * - **Add:** A search-and-select dropdown below the table lets the user search and pick
 *   entities. Selecting one appends the full `TRow` object to the value. Already-added
 *   rows are filtered from the dropdown so the same entity cannot be added twice.
 * - **Remove:** Each row has an auto-generated delete button (hidden in VIEW mode).
 * - **Clear:** Removes all rows (clears to `[]`).
 * - **Inline edit** (`inlineEdit`): add/remove changes are held in draft and only
 *   committed to react-hook-form after the user clicks Save.
 */
export default function FieldInputEntityTable<
  TRow,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>(
  props: FieldInputEntityTableProps<
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
    RenderComponent: FieldInputEntityTableRender,
  } as FieldInputBaseProps<
    FieldInputEntityTableExtendsProps<TRow>,
    TFieldValues,
    TContext,
    TTransformedValues,
    TName,
    TFieldPathValue
  >;

  return <FieldInputBase {...p} />;
}

function mergeRows<TRow>(
  current: TRow[],
  next: TRow[],
  getRowValue: (row: TRow) => string,
): TRow[] {
  const map = new Map<string, TRow>();
  current.forEach(row => map.set(getRowValue(row), row));
  next.forEach(row => map.set(getRowValue(row), row));
  return Array.from(map.values());
}

type DisplayItem<TRow> = { row: TRow; deleted: boolean; isNew: boolean };

function FieldInputEntityTableRender<
  TRow,
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
  TName extends FieldPath<TFieldValues>,
  TFieldPathValue extends FieldPathValue<TFieldValues, TName>,
>({
  fieldInputProps: {
    _label,
    columns,
    loadOptions,
    getRowValue,
    getRowLabel,
    defaultOptions = true,
    loadOnOpen = true,
    minSearchLength = 0,
    debounceTime,
    searchPlaceholder,
    placeholder,
    onLoadError,
    emptyState,
    isFetching,
    footer,
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
  valueSyncKey,
  onEditRef,
}: FieldInputRenderProps<
  FieldInputEntityTableExtendsProps<TRow>,
  TFieldValues,
  TContext,
  TTransformedValues,
  TName,
  TFieldPathValue
>) {
  const t = useTranslations();

  // Committed rows from form value — used in VIEW mode.
  const rows = React.useMemo(
    () => (Array.isArray(currentValue) ? (currentValue as TRow[]) : []),
    [currentValue],
  );

  // Stable ref so effects can read currentValue without adding it to deps.
  const currentValueRef = React.useRef(currentValue);
  React.useLayoutEffect(() => {
    currentValueRef.current = currentValue;
  });

  // Local display state: rows in stable insertion order, including soft-deleted.
  const [displayItems, setDisplayItems] = React.useState<DisplayItem<TRow>[]>(
    () => rows.map(row => ({ row, deleted: false, isNew: false })),
  );

  // Reset display items from the current form value (handles clear/reset/entering-edit).
  const syncFromValue = React.useCallback(() => {
    const current = Array.isArray(currentValueRef.current)
      ? (currentValueRef.current as TRow[])
      : [];
    setDisplayItems(
      current.map(row => ({ row, deleted: false, isNew: false })),
    );
  }, []);

  React.useEffect(() => {
    syncFromValue();
  }, [valueSyncKey, syncFromValue]);
  // When inline-edit starts, sync so previous session's soft-deletes don't reappear.
  React.useEffect(() => {
    if (editButtonEditing) syncFromValue();
  }, [editButtonEditing, syncFromValue]);

  // O(1) lookups for soft-deleted and newly-added keys.
  const deletedKeySet = React.useMemo(
    () =>
      new Set(displayItems.filter(i => i.deleted).map(i => getRowValue(i.row))),
    [displayItems, getRowValue],
  );
  const newKeySet = React.useMemo(
    () =>
      new Set(
        displayItems
          .filter(i => i.isNew && !i.deleted)
          .map(i => getRowValue(i.row)),
      ),
    [displayItems, getRowValue],
  );

  // ── Async options loading ────────────────────────────────────────────────
  const [options, setOptions] = React.useState<TRow[]>(
    Array.isArray(defaultOptions) ? defaultOptions : [],
  );
  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const [openDropdown, setOpenDropdown] = React.useState(false);
  const loadedInitialRef = React.useRef(false);
  const requestIdRef = React.useRef(0);

  const load = React.useCallback(
    async (keyword: string) => {
      const requestId = ++requestIdRef.current;
      setOptionsLoading(true);
      try {
        const next = await loadOptions(keyword);
        if (requestId !== requestIdRef.current) return;
        setOptions(current =>
          keyword ? next : mergeRows(current, next, getRowValue),
        );
        loadedInitialRef.current = loadedInitialRef.current || !keyword;
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        onLoadError?.(error);
      } finally {
        if (requestId === requestIdRef.current) setOptionsLoading(false);
      }
    },
    [loadOptions, getRowValue, onLoadError],
  );

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setOpenDropdown(open);
      if (
        open &&
        loadOnOpen &&
        !loadedInitialRef.current &&
        defaultOptions === true
      ) {
        load('');
      }
    },
    [defaultOptions, load, loadOnOpen],
  );

  const handleSearchChange = React.useCallback(
    (keyword: string) => {
      if (keyword.length < minSearchLength) {
        setOptions(Array.isArray(defaultOptions) ? defaultOptions : []);
        return;
      }
      load(keyword);
    },
    [defaultOptions, load, minSearchLength],
  );

  React.useEffect(() => {
    if (!Array.isArray(defaultOptions)) return;
    React.startTransition(() => setOptions(defaultOptions));
  }, [defaultOptions]);

  React.useEffect(() => {
    if (readOnly) React.startTransition(() => setOpenDropdown(false));
  }, [readOnly]);

  React.useEffect(() => {
    onEditRef.current = () => {
      setOpenDropdown(true);
      if (loadOnOpen && !loadedInitialRef.current && defaultOptions === true) {
        load('');
      }
    };
  }, [defaultOptions, load, loadOnOpen, onEditRef]); // onEditRef is a stable ref

  // ── Row add / soft-delete / restore ──────────────────────────────────────
  // Includes both active and soft-deleted so the dropdown never re-offers them.
  const addedIds = React.useMemo(
    () => new Set(displayItems.map(i => getRowValue(i.row))),
    [displayItems, getRowValue],
  );

  const [addKey, setAddKey] = React.useState(0);

  const commit = React.useCallback(
    (items: DisplayItem<TRow>[]) =>
      handleValueChange(
        items
          .filter(i => !i.deleted)
          .map(i => i.row) as unknown as TFieldPathValue,
      ),
    [handleValueChange],
  );

  const addRow = React.useCallback(
    (option: TRow) => {
      if (addedIds.has(getRowValue(option))) return;
      const next = [
        ...displayItems,
        { row: option, deleted: false, isNew: true },
      ];
      setDisplayItems(next);
      commit(next);
      setAddKey(k => k + 1);
    },
    [displayItems, addedIds, getRowValue, commit],
  );

  const softDeleteRow = React.useCallback(
    (row: TRow) => {
      const key = getRowValue(row);
      const item = displayItems.find(i => getRowValue(i.row) === key);
      const idx = displayItems
        .filter(i => !i.deleted)
        .findIndex(i => getRowValue(i.row) === key);
      // Newly-added rows are removed immediately; existing rows are soft-deleted.
      const next = item?.isNew
        ? displayItems.filter(i => getRowValue(i.row) !== key)
        : displayItems.map(i =>
            getRowValue(i.row) === key ? { ...i, deleted: true } : i,
          );
      setDisplayItems(next);
      commit(next);
      onRemoveRow?.(row, idx);
    },
    [displayItems, getRowValue, commit, onRemoveRow],
  );

  const restoreRow = React.useCallback(
    (row: TRow) => {
      const key = getRowValue(row);
      const next = displayItems.map(i =>
        getRowValue(i.row) === key ? { ...i, deleted: false } : i,
      );
      setDisplayItems(next);
      commit(next);
    },
    [displayItems, getRowValue, commit],
  );

  const availableOptions = React.useMemo(
    () => options.filter(o => !addedIds.has(getRowValue(o))),
    [options, addedIds, getRowValue],
  );

  // ── Table columns ────────────────────────────────────────────────────────
  const tableColumns = React.useMemo<PlainTableColumnDef<TRow>[]>(() => {
    const rowNumberCol: PlainTableColumnDef<TRow> = {
      key: '__rowNumber',
      header: t('common.label.no'),
      align: 'center',
      headerClassName: 'w-16',
      className: 'text-muted-foreground tabular-nums',
      render: (_row, index) => index + 1,
    };

    // Wrap every data column: soft-deleted cells get strikethrough + muted text.
    const styledCols: PlainTableColumnDef<TRow>[] = columns.map(col => ({
      ...col,
      render: (row: TRow, index: number) => {
        const content = col.render(row, index);
        return deletedKeySet.has(getRowValue(row)) ? (
          <span className="text-muted-foreground line-through">{content}</span>
        ) : (
          content
        );
      },
    }));

    const isEditable = !readOnly && !disabled;

    if (!isEditable && !isEditButton) return [rowNumberCol, ...styledCols];

    return [
      rowNumberCol,
      ...styledCols,
      {
        key: '__remove',
        header: '',
        align: 'center' as const,
        headerClassName: 'w-12',
        render: (row: TRow) => (
          <div
            className={cn('flex justify-center', !isEditable && 'invisible')}
          >
            {deletedKeySet.has(getRowValue(row)) ? (
              <Button
                size="icon-sm"
                type="button"
                variant="ghost"
                onClick={() => restoreRow(row)}
              >
                <RotateCcw />
              </Button>
            ) : (
              <Button
                size="icon-sm"
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => softDeleteRow(row)}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        ),
      },
    ];
  }, [
    t,
    columns,
    deletedKeySet,
    readOnly,
    disabled,
    isEditButton,
    getRowValue,
    softDeleteRow,
    restoreRow,
  ]);

  // VIEW mode shows only committed rows; EDIT mode shows all including soft-deleted.
  const tableData = React.useMemo(
    () => (readOnly ? rows : displayItems.map(i => i.row)),
    [readOnly, rows, displayItems],
  );

  const getRowClassName = React.useCallback(
    (row: TRow) => {
      const key = getRowValue(row);
      if (deletedKeySet.has(key)) return 'bg-destructive/5';
      if (newKeySet.has(key)) return 'bg-primary/5';
      return undefined;
    },
    [deletedKeySet, newKeySet, getRowValue],
  );

  const isEditable = !readOnly && !disabled;

  const actions =
    loading || canReset || canClear || isEditButton ? (
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
          </>
        )}
      </div>
    ) : undefined;

  return (
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
      {isEditable && (
        <div className="mb-2">
          <Select<TRow>
            key={addKey}
            options={availableOptions}
            value={null}
            onValueChange={option => option && addRow(option)}
            getOptionValue={getRowValue}
            getOptionLabel={getRowLabel}
            renderOption={row => getRowLabel(row)}
            open={openDropdown}
            onOpenChange={handleOpenChange}
            loading={optionsLoading}
            searchable
            searchManual
            onSearchChange={handleSearchChange}
            debounceTime={debounceTime}
            placeholder={
              placeholder ?? t('components.entity_table.add_placeholder')
            }
            searchPlaceholder={searchPlaceholder}
            clearable={false}
          />
        </div>
      )}

      <DataTablePlain
        columns={tableColumns}
        data={tableData}
        isFetching={isFetching}
        getRowKey={row => getRowValue(row)}
        getRowClassName={!readOnly ? getRowClassName : undefined}
        footer={footer}
        emptyState={emptyState}
      />
    </SectionPanel>
  );
}
