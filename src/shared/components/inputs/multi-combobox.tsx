'use client';

import * as React from 'react';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/shared/components/ui/popover';
import { useDebounceCallback } from '@/shared/hooks/use-debounce-callback';
import { cn } from '@/shared/lib/utils';

export interface MultiComboboxProps<T> {
  options: T[];
  value?: string[];
  onValueChange: (value: string[]) => void;
  onSearchChange?: (keyword: string) => void;
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  isError?: boolean;
  debounceTime?: number;
  searchManual?: boolean;
  allowCustom?: boolean;
  openOnFocus?: boolean;
  openOnInput?: boolean;
  addOnBlur?: boolean;
  maxValues?: number;
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  renderOption?: (option: T) => React.ReactNode;
  renderValue?: (option: T) => React.ReactNode;
  isOptionDisabled?: (option: T) => boolean;
  emptyContent?: React.ReactNode;
  className?: string;
  placeholder?: string;
  inputStyle?: React.CSSProperties;
  controlStyle?: React.CSSProperties;
  controlClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

function addUniqueValue(
  values: string[],
  nextValue: string,
  maxValues?: number,
) {
  const trimmedValue = nextValue.trim();

  if (!trimmedValue) return values;
  if (values.includes(trimmedValue)) return values;
  if (maxValues !== undefined && values.length >= maxValues) return values;

  return [...values, trimmedValue];
}

export function MultiCombobox<T>({
  options,
  value = [],
  onValueChange,
  onSearchChange,
  loading,
  disabled,
  readOnly,
  isError,
  debounceTime = 500,
  searchManual = false,
  allowCustom = true,
  openOnFocus = true,
  openOnInput = true,
  addOnBlur = true,
  maxValues,
  getOptionValue,
  getOptionLabel,
  renderOption,
  renderValue,
  isOptionDisabled,
  emptyContent,
  className,
  placeholder,
  inputStyle,
  controlStyle,
  controlClassName,
  open: openProp,
  onOpenChange,
  inputRef,
}: MultiComboboxProps<T>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [anchorWidth, setAnchorWidth] = React.useState<number>();
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const isDisabled = disabled || loading;
  const open = openProp ?? uncontrolledOpen;
  const selectedKeys = React.useMemo(() => new Set(value), [value]);

  const handleOpenChange = React.useCallback(
    (state: boolean) => {
      if (disabled || readOnly) return;
      if (loading && state) return;

      setUncontrolledOpen(state);
      onOpenChange?.(state);
    },
    [disabled, loading, onOpenChange, readOnly],
  );

  const performSearch = React.useCallback(
    (keyword: string) => {
      onSearchChange?.(keyword);
    },
    [onSearchChange],
  );
  const debouncedSearch = useDebounceCallback(performSearch, debounceTime);

  const filteredOptions = React.useMemo(() => {
    if (searchManual || !inputValue) return options;

    const lower = inputValue.toLowerCase();

    return options.filter(option =>
      getOptionLabel(option).toLowerCase().includes(lower),
    );
  }, [getOptionLabel, inputValue, options, searchManual]);

  const selectedItems = React.useMemo(
    () =>
      value.map(selectedValue => {
        const option = options.find(
          item => getOptionValue(item) === selectedValue,
        );

        return {
          value: selectedValue,
          label: option ? getOptionLabel(option) : selectedValue,
          option,
        };
      }),
    [getOptionLabel, getOptionValue, options, value],
  );

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);

    if (openOnInput) {
      handleOpenChange(true);
    }

    if (searchManual) {
      debouncedSearch(nextValue);
    }
  };

  const handleCommitCustomValue = React.useCallback(() => {
    if (!allowCustom || readOnly) return;

    const nextValue = addUniqueValue(value, inputValue, maxValues);

    if (nextValue === value) return;

    onValueChange(nextValue);
    setInputValue('');
  }, [allowCustom, inputValue, maxValues, onValueChange, readOnly, value]);

  const handleToggleOption = (option: T) => {
    if (readOnly) return;
    if (isOptionDisabled?.(option)) return;

    const optionValue = getOptionValue(option);
    const nextValue = selectedKeys.has(optionValue)
      ? value.filter(item => item !== optionValue)
      : addUniqueValue(value, optionValue, maxValues);

    onValueChange(nextValue);
    setInputValue('');
  };

  const handleRemoveValue = (removedValue: string) => {
    if (readOnly) return;

    onValueChange(value.filter(item => item !== removedValue));
  };

  React.useEffect(() => {
    if (!open || !listRef.current) return;

    const el = listRef.current.querySelector(
      `[data-key="${value[0] ?? ''}"]`,
    ) as HTMLElement | null;

    el?.scrollIntoView({ block: 'nearest' });
  }, [open, value]);

  React.useEffect(() => {
    if (!open) return;

    setAnchorWidth(anchorRef.current?.offsetWidth);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={cn(
            'relative flex min-h-9 w-full items-center rounded-md border border-input bg-background',
            {
              'border-destructive': isError,
              'opacity-50 pointer-events-none': isDisabled,
            },
            className,
          )}
        >
          <div
            className="flex min-h-9 min-w-0 flex-1 flex-wrap items-center gap-1 px-3 py-1 text-sm"
            style={inputStyle}
          >
            {selectedItems.map(item => (
              <Badge
                key={item.value}
                variant="secondary"
                className="max-w-[9rem] rounded-md"
              >
                <span className="truncate">
                  {item.option && renderValue
                    ? renderValue(item.option)
                    : item.label}
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    className="ml-1 rounded-sm hover:text-destructive"
                    onPointerDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveValue(item.value);
                    }}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove</span>
                  </button>
                )}
              </Badge>
            ))}

            <Input
              ref={inputRef}
              value={inputValue}
              placeholder={selectedItems.length === 0 ? placeholder : undefined}
              readOnly={readOnly}
              disabled={isDisabled}
              isError={isError}
              className="h-7 min-w-[7rem] flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              onFocus={() => {
                if (openOnFocus) setTimeout(() => handleOpenChange(true), 0);
              }}
              onChange={e => handleInputChange(e.target.value)}
              onBlur={() => {
                if (!addOnBlur || open) return;

                handleCommitCustomValue();
              }}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  handleOpenChange(false);
                  return;
                }

                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  handleOpenChange(true);
                  return;
                }

                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCommitCustomValue();
                }
              }}
            />
          </div>

          {readOnly || loading ? (
            loading ? (
              <Loader2
                className={cn(
                  'absolute top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground',
                  controlClassName,
                )}
                style={controlStyle ?? { right: '0.5rem' }}
              />
            ) : (
              <ChevronDown
                className={cn(
                  'absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
                  controlClassName,
                )}
                style={controlStyle ?? { right: '0.5rem' }}
              />
            )
          ) : (
            <button
              type="button"
              tabIndex={-1}
              className={cn(
                'absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground',
                controlClassName,
              )}
              style={controlStyle ?? { right: '0.5rem' }}
              disabled={isDisabled}
              onPointerDown={e => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenChange(!open);
              }}
            >
              <ChevronDown className="h-4 w-4" />
              <span className="sr-only">Open options</span>
            </button>
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="p-0"
        align="start"
        style={{ width: anchorWidth }}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <div
          ref={listRef}
          className="max-h-[min(300px,calc(100vh-200px))] overflow-y-auto"
        >
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}

          {!loading && filteredOptions.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {emptyContent ?? 'No results'}
            </div>
          )}

          {!loading &&
            filteredOptions.map(option => {
              const key = getOptionValue(option);
              const selected = selectedKeys.has(key);
              const optionDisabled = isOptionDisabled?.(option);

              return (
                <button
                  key={key}
                  data-key={key}
                  type="button"
                  disabled={optionDisabled}
                  onClick={() => handleToggleOption(option)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                    !optionDisabled && 'hover:bg-accent',
                    selected && 'bg-accent',
                    optionDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input',
                      selected &&
                        'border-primary bg-primary text-primary-foreground',
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {renderOption
                      ? renderOption(option)
                      : getOptionLabel(option)}
                  </span>
                </button>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
