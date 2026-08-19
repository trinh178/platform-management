'use client';

import * as React from 'react';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { useDebounceCallback } from '@/shared/hooks/use-debounce-callback';
import { cn } from '@/shared/lib/utils';

export interface SelectProps<T> {
  options: T[];
  value: T | null;

  onValueChange: (value: T | null) => void;
  onSearchChange?: (keyword: string) => void;

  loading?: boolean;

  searchPlaceholder?: string;

  disabled?: boolean;
  readOnly?: boolean;

  isError?: boolean;

  debounceTime?: number;

  searchable?: boolean;
  searchManual?: boolean;

  clearable?: boolean;

  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;

  renderOption: (option: T) => React.ReactNode;
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
}

export function Select<T>({
  options,
  value,
  onValueChange,
  onSearchChange,
  loading,
  searchPlaceholder,
  disabled,
  readOnly,
  isError,
  debounceTime = 500,
  searchable = false,
  searchManual = false,
  clearable = false,
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
}: SelectProps<T>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const listRef = React.useRef<HTMLDivElement>(null);

  const isDisabled = disabled || loading;
  const open = openProp ?? uncontrolledOpen;

  const handleOpenChange = (state: boolean) => {
    if (disabled || readOnly) return;
    if (loading && state) return;

    setUncontrolledOpen(state);
    onOpenChange?.(state);
  };

  React.useEffect(() => {
    if (!open) {
      React.startTransition(() => setKeyword(''));
    }
  }, [open]);

  const performSearch = React.useCallback(
    (value: string) => {
      if (searchManual) {
        onSearchChange?.(value);
      }
    },
    [searchManual, onSearchChange],
  );

  const debouncedSearch = useDebounceCallback(performSearch, debounceTime);

  const handleSearch = (value: string) => {
    setKeyword(value);

    if (searchable) {
      debouncedSearch(value);
    }
  };

  const handleSelect = (option: T) => {
    if (readOnly) return;
    if (isOptionDisabled?.(option)) return;

    onValueChange(option);
    handleOpenChange(false);
  };

  const handleClearPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onValueChange(null);
    handleOpenChange(false);
  };

  const displayValue = value
    ? (renderValue?.(value) ?? getOptionLabel(value))
    : '';

  const filteredOptions = React.useMemo(() => {
    if (!searchable) return options;

    if (searchManual) return options;

    if (!keyword) return options;

    const lower = keyword.toLowerCase();

    return options.filter(option =>
      getOptionLabel(option).toLowerCase().includes(lower),
    );
  }, [options, keyword, searchable, searchManual, getOptionLabel]);

  const selectedKey = value ? getOptionValue(value) : null;

  React.useEffect(() => {
    if (!open || !selectedKey || !listRef.current) return;

    const el = listRef.current.querySelector(
      `[data-key="${selectedKey}"]`,
    ) as HTMLElement | null;

    el?.scrollIntoView({ block: 'nearest' });
  }, [open, selectedKey]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild disabled={isDisabled || readOnly}>
        <div
          className={cn(
            'relative w-full',
            'h-9 border border-input rounded-md bg-background',
            {
              'border-destructive': isError,
              'opacity-50 pointer-events-none': isDisabled,
            },
            className,
          )}
        >
          <div className="relative h-full">
            <Input
              readOnly
              value={typeof displayValue === 'string' ? displayValue : ''}
              placeholder={placeholder}
              className="pr-16 border-none shadow-none focus-visible:ring-0"
              style={inputStyle}
            />

            {value && clearable && !readOnly && !loading && (
              <button
                type="button"
                onPointerDown={handleClearPointerDown}
                onClick={handleClear}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {loading ? (
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
            )}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        {searchable && (
          <div className="flex items-center gap-2 p-2 border-b">
            <Search className="h-4 w-4 text-muted-foreground" />

            <Input
              placeholder={searchPlaceholder}
              value={keyword}
              onChange={e => handleSearch(e.target.value)}
              className="h-8 border-0 focus-visible:ring-0"
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  handleOpenChange(false);
                }
              }}
            />
          </div>
        )}

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
              const selected = key === selectedKey;
              const optionDisabled = isOptionDisabled?.(option);

              return (
                <button
                  key={key}
                  data-key={key}
                  type="button"
                  disabled={optionDisabled}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-2 text-sm',
                    !optionDisabled && 'hover:bg-accent',
                    selected && 'bg-accent',
                    optionDisabled && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {renderOption(option)}

                  {selected && <Check className="h-4 w-4" />}
                </button>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
