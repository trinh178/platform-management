'use client';

import * as React from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/shared/components/ui/popover';
import { useDebounceCallback } from '@/shared/hooks/use-debounce-callback';
import { cn } from '@/shared/lib/utils';

export interface ComboboxProps<T> {
  options: T[];
  value?: string;
  onValueChange: (value: string) => void;
  onSearchChange?: (keyword: string) => void;
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  isError?: boolean;
  debounceTime?: number;
  searchManual?: boolean;
  allowCustom?: boolean;
  openOnInput?: boolean;
  openOnFocus?: boolean;
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

export function Combobox<T>({
  options,
  value = '',
  onValueChange,
  onSearchChange,
  loading,
  disabled,
  readOnly,
  isError,
  debounceTime = 500,
  searchManual = false,
  allowCustom = true,
  openOnInput = true,
  openOnFocus = true,
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
}: ComboboxProps<T>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [anchorWidth, setAnchorWidth] = React.useState<number>();
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const isDisabled = disabled || loading;
  const open = openProp ?? uncontrolledOpen;

  const selectedOption = React.useMemo(
    () => options.find(option => getOptionValue(option) === value) ?? null,
    [getOptionValue, options, value],
  );

  const selectedDisplayValue = selectedOption
    ? renderValue?.(selectedOption)
    : undefined;

  React.useEffect(() => {
    if (open) return;
    if (selectedOption) {
      const display =
        typeof selectedDisplayValue === 'string'
          ? selectedDisplayValue
          : getOptionLabel(selectedOption);

      React.startTransition(() => setInputValue(display));
      return;
    }

    React.startTransition(() => setInputValue(value));
  }, [getOptionLabel, open, selectedDisplayValue, selectedOption, value]);

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

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);

    if (openOnInput) {
      handleOpenChange(true);
    }

    if (allowCustom) {
      onValueChange(nextValue);
    }

    if (searchManual) {
      debouncedSearch(nextValue);
    }
  };

  const filteredOptions = React.useMemo(() => {
    if (searchManual || !inputValue) return options;

    const lower = inputValue.toLowerCase();

    return options.filter(option =>
      getOptionLabel(option).toLowerCase().includes(lower),
    );
  }, [getOptionLabel, inputValue, options, searchManual]);

  const handleSelect = (option: T) => {
    if (readOnly) return;
    if (isOptionDisabled?.(option)) return;

    const nextValue = getOptionValue(option);
    const nextLabel = getOptionLabel(option);

    setInputValue(nextLabel);
    onValueChange(nextValue);
    handleOpenChange(false);
  };

  React.useEffect(() => {
    if (!open || !value || !listRef.current) return;

    const el = listRef.current.querySelector(
      `[data-key="${value}"]`,
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
            'relative w-full',
            'h-9 rounded-md border border-input bg-background',
            {
              'border-destructive': isError,
              'opacity-50 pointer-events-none': isDisabled,
            },
            className,
          )}
        >
          <Input
            ref={inputRef}
            value={inputValue}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={isDisabled}
            isError={isError}
            className="h-full border-0 bg-transparent shadow-none focus-visible:ring-0"
            style={inputStyle}
            onFocus={() => {
              if (openOnFocus) setTimeout(() => handleOpenChange(true), 0);
            }}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                handleOpenChange(false);
                return;
              }

              if (e.key === 'ArrowDown') {
                e.preventDefault();
                handleOpenChange(true);
              }
            }}
          />

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
        className="w-[--radix-popover-trigger-width] p-0"
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
              const selected = key === value;
              const optionDisabled = isOptionDisabled?.(option);

              return (
                <button
                  key={key}
                  data-key={key}
                  type="button"
                  disabled={optionDisabled}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm',
                    !optionDisabled && 'hover:bg-accent',
                    selected && 'bg-accent',
                    optionDisabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">
                    {renderOption
                      ? renderOption(option)
                      : getOptionLabel(option)}
                  </span>

                  {selected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
