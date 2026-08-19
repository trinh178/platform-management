'use client';

import * as React from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Search,
} from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { cn } from '@/shared/lib/utils';

export type TreeOption = {
  label: string;
  value: string;
  children?: TreeOption[];
  disabled?: boolean;
};

export type TreeSelectProps = {
  options: TreeOption[];

  value?: string;
  defaultValue?: string;
  onChange?: (value: string, option: TreeOption) => void;

  placeholder?: string;
  searchPlaceholder?: string;

  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  isError?: boolean;
  searchable?: boolean;

  className?: string;
  inputStyle?: React.CSSProperties;
  controlStyle?: React.CSSProperties;
  controlClassName?: string;
  expandAll?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  renderOption?: (option: TreeOption) => React.ReactNode;
};

export function TreeSelect({
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  searchPlaceholder,
  disabled,
  readOnly,
  loading,
  isError,
  searchable = true,
  className,
  inputStyle,
  controlStyle,
  controlClassName,
  expandAll,
  open: openProp,
  onOpenChange,
  renderOption,
}: TreeSelectProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [search, setSearch] = React.useState('');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const isDisabled = disabled || loading;
  const open = openProp ?? uncontrolledOpen;

  const setOpen = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const setValue = (val: string, option: TreeOption) => {
    if (readOnly) return;

    if (!isControlled) {
      setInternalValue(val);
    }

    onChange?.(val, option);
  };

  const toggle = (val: string) => {
    if (readOnly) return;

    setExpanded(prev => ({
      ...prev,
      [val]: !prev[val],
    }));
  };

  React.useEffect(() => {
    if (!expandAll) return;

    const map: Record<string, boolean> = {};

    const walk = (nodes: TreeOption[]) => {
      nodes.forEach(node => {
        if (node.children?.length) {
          map[node.value] = true;
          walk(node.children);
        }
      });
    };

    walk(options);
    React.startTransition(() => setExpanded(map));
  }, [expandAll, options]);

  const selectedLabel = React.useMemo(() => {
    const find = (nodes: TreeOption[]): string | undefined => {
      for (const node of nodes) {
        if (node.value === currentValue) return node.label;

        if (node.children) {
          const res = find(node.children);
          if (res) return res;
        }
      }

      return undefined;
    };

    return find(options);
  }, [currentValue, options]);

  const handleSelect = (option: TreeOption) => {
    if (option.disabled || readOnly) return;

    setValue(option.value, option);
    setOpen(false);
  };

  const filterTree = React.useMemo(() => {
    if (!search) return options;

    const match = (nodes: TreeOption[]): TreeOption[] => {
      return nodes
        .map(node => {
          const children = node.children ? match(node.children) : [];

          if (
            node.label.toLowerCase().includes(search.toLowerCase()) ||
            children.length
          ) {
            return {
              ...node,
              children,
            };
          }

          return null;
        })
        .filter(Boolean) as TreeOption[];
    };

    return match(options);
  }, [search, options]);

  const renderTree = (nodes: TreeOption[], level = 0) => {
    return nodes.map(node => {
      const hasChildren = !!node.children?.length;
      const isExpanded = expanded[node.value] || search;

      return (
        <div key={node.value}>
          <div
            className={cn(
              'flex items-center gap-2 px-2 py-1 rounded-sm',
              node.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-muted cursor-pointer',
            )}
            style={{ paddingLeft: level * 16 }}
          >
            {hasChildren ? (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90',
                )}
                onClick={() => toggle(node.value)}
              />
            ) : (
              <span className="w-4" />
            )}

            <span className="flex-1 text-sm" onClick={() => handleSelect(node)}>
              {renderOption ? renderOption(node) : node.label}
            </span>

            {currentValue === node.value && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </div>

          {hasChildren && isExpanded && (
            <div>{renderTree(node.children!, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <Popover
      open={isDisabled || readOnly ? false : open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <div
          className={cn(
            'relative w-full',
            isDisabled && 'opacity-50 pointer-events-none',
            'h-9 border border-input rounded-md',
            {
              'border-destructive': isError,
            },
            className,
          )}
        >
          <div className="relative h-full">
            <Input
              readOnly
              value={selectedLabel ?? ''}
              placeholder={placeholder}
              className="focus-visible:ring-0 focus-visible:border-0 border-none shadow-none"
              style={inputStyle}
            />
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

      <PopoverContent align="start" className="p-0 w-[280px]">
        {searchable && (
          <div className="flex items-center gap-2 p-2 border-b">
            <Search className="h-4 w-4 text-muted-foreground" />

            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 border-0 focus-visible:ring-0"
            />
          </div>
        )}

        <div className="p-2 max-h-[260px] overflow-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            renderTree(filterTree)
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
