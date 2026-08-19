import { Column } from '@tanstack/react-table';
import { Check, PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DataTableFilterValue,
  EnumFilterField,
  FilterOption,
  SelectFilterField,
} from '../filter-types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';

/**
 * Filter chọn nhiều — dùng chung cho `enum` (options tĩnh) và `select`
 * (options động từ API). `options` đã được dispatcher resolve sẵn (label string).
 * Multi-select → `{ operator: 'In', values }`; single → `{ operator: 'Equal', value }`.
 */
export function EnumFilter<TData>({
  column,
  field,
  options,
}: {
  column: Column<TData, unknown>;
  field: EnumFilterField | SelectFilterField;
  options: FilterOption[];
}) {
  const t = useTranslations();
  const multiple = field.multiple ?? true;
  const current = column.getFilterValue() as DataTableFilterValue | undefined;
  const selected = new Set(
    current?.values ?? (current?.value != null ? [current.value] : []),
  );

  const commit = (next: Set<string>) => {
    const arr = Array.from(next);
    if (arr.length === 0) {
      column.setFilterValue(undefined);
    } else if (multiple) {
      column.setFilterValue({
        operator: 'In',
        values: arr,
      } satisfies DataTableFilterValue);
    } else {
      column.setFilterValue({
        operator: 'Equal',
        value: arr[0],
      } satisfies DataTableFilterValue);
    }
  };

  const toggle = (value: string) => {
    const next = new Set(multiple ? selected : []);
    if (selected.has(value)) next.delete(value);
    else next.add(value);
    commit(next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle />
          {t(field.title)}
          {selected.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selected.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selected.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {t('common.table.items_selected', { count: selected.size })}
                  </Badge>
                ) : (
                  options
                    .filter(option => selected.has(option.value))
                    .map(option => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-55 p-0" align="start">
        <Command>
          <CommandInput placeholder={t(field.title)} />
          <CommandList>
            <CommandEmpty>{t('common.table.no_results')}</CommandEmpty>
            <CommandGroup>
              {options.map(option => {
                const isSelected = selected.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggle(option.value)}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground mr-2 h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    {t('common.control.clear_filter')}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
