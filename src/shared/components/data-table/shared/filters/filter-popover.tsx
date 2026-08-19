import React from 'react';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { OPERATOR_LABEL } from '../filter-types';
import { TranslationsKey } from '@/core/i18n/types';
import { Button } from '@/shared/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';
import { FilterOperator } from '@/shared/types/pagination';

/** Trigger (nút dashed) + popover dùng chung cho text/number/date/boolean filter. */
export function FilterPopover({
  title,
  active,
  summary,
  onClear,
  open,
  onOpenChange,
  children,
  contentClassName,
}: {
  title: string;
  active: boolean;
  summary?: React.ReactNode;
  onClear?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  const t = useTranslations();
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle />
          {title}
          {active && summary != null && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <span className="bg-secondary text-secondary-foreground rounded-sm px-1.5 py-0.5 text-xs font-normal">
                {summary}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[260px] space-y-2 p-3', contentClassName)}
        align="start"
      >
        {children}
        {active && onClear && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={onClear}
          >
            {t('common.control.clear_filter')}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Select chọn operator (dùng cho text & number filter). */
export function OperatorSelect({
  value,
  operators,
  onChange,
}: {
  value: FilterOperator;
  operators: FilterOperator[];
  onChange: (operator: FilterOperator) => void;
}) {
  const t = useTranslations();
  return (
    <Select value={value} onValueChange={v => onChange(v as FilterOperator)}>
      <SelectTrigger size="sm" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {operators.map(op => (
          <SelectItem key={op} value={op}>
            {t(OPERATOR_LABEL[op] as TranslationsKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
