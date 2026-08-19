'use client';

import * as React from 'react';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { useDebounceCallback } from '@/shared/hooks/use-debounce-callback';
import { cn } from '@/shared/lib/utils';

export interface MultiSelectProps<T> {
  options: T[];
  value?: string[];

  onValueChange: (value: string[]) => void;
  onSearchChange?: (keyword: string) => void;

  loading?: boolean;

  searchPlaceholder?: string;

  disabled?: boolean;
  readOnly?: boolean;

  isError?: boolean;

  debounceTime?: number;

  searchable?: boolean;
  searchManual?: boolean;

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

  maxVisibleValues?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MultiSelect<T>({
  options,
  value = [],
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
  maxVisibleValues = 2,
  open: openProp,
  onOpenChange,
}: MultiSelectProps<T>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const listRef = React.useRef<HTMLDivElement>(null);

  const selectedKeys = React.useMemo(() => new Set(value), [value]);
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
    (nextKeyword: string) => {
      if (searchManual) {
        onSearchChange?.(nextKeyword);
      }
    },
    [searchManual, onSearchChange],
  );

  const debouncedSearch = useDebounceCallback(performSearch, debounceTime);

  const handleSearch = (nextKeyword: string) => {
    setKeyword(nextKeyword);

    if (searchable) {
      debouncedSearch(nextKeyword);
    }
  };

  const handleSelect = (option: T) => {
    if (readOnly) return;
    if (isOptionDisabled?.(option)) return;

    const optionValue = getOptionValue(option);
    const nextValue = selectedKeys.has(optionValue)
      ? value.filter(item => item !== optionValue)
      : [...value, optionValue];

    onValueChange(nextValue);
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchable) return options;
    if (searchManual) return options;
    if (!keyword) return options;

    const lower = keyword.toLowerCase();

    return options.filter(option =>
      getOptionLabel(option).toLowerCase().includes(lower),
    );
  }, [options, keyword, searchable, searchManual, getOptionLabel]);

  const selectedOptions = React.useMemo(
    () =>
      value.map(selectedValue => {
        const option = options.find(o => getOptionValue(o) === selectedValue);

        return {
          value: selectedValue,
          label: option ? getOptionLabel(option) : selectedValue,
          option,
        };
      }),
    [options, value, getOptionLabel, getOptionValue],
  );
  const visibleValues = selectedOptions.slice(0, maxVisibleValues);
  const hiddenCount = Math.max(
    selectedOptions.length - visibleValues.length,
    0,
  );

  React.useEffect(() => {
    if (!open || value.length === 0 || !listRef.current) return;

    const el = listRef.current.querySelector(
      `[data-key="${value[0]}"]`,
    ) as HTMLElement | null;

    el?.scrollIntoView({ block: 'nearest' });
  }, [open, value]);

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
          <div
            className="flex h-full min-w-0 items-center gap-1 overflow-hidden px-3 text-sm"
            style={inputStyle}
          >
            {selectedOptions.length === 0 ? (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            ) : (
              <>
                {visibleValues.map(item => (
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
                  </Badge>
                ))}

                {hiddenCount > 0 && (
                  <Badge variant="outline" className="rounded-md">
                    +{hiddenCount}
                  </Badge>
                )}
              </>
            )}
          </div>

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
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        {searchable && (
          <div className="flex items-center gap-2 border-b p-2">
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
              const selected = selectedKeys.has(key);
              const optionDisabled = isOptionDisabled?.(option);

              return (
                <button
                  key={key}
                  data-key={key}
                  type="button"
                  disabled={optionDisabled}
                  onClick={() => handleSelect(option)}
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
                    {renderOption(option)}
                  </span>
                </button>
              );
            })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
