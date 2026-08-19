import React from 'react';
import { Column } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { DataTableFilterValue, DateRangeFilterField } from '../filter-types';
import { FilterPopover } from './filter-popover';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

const startOfDay = (date: string) => `${date}T00:00:00`;
const endOfDay = (date: string) => `${date}T23:59:59.999`;
const datePart = (iso?: string) => (iso ? iso.slice(0, 10) : '');

/**
 * Filter khoảng ngày. Cả hai đầu → `Between`; chỉ một đầu →
 * `GreaterThanOrEqual` / `LessThanOrEqual`. Giá trị gửi đi là ISO datetime
 * (đầu ngày / cuối ngày) để bao trọn ngày được chọn.
 */
export function DateRangeFilter<TData>({
  column,
  field,
}: {
  column: Column<TData, unknown>;
  field: DateRangeFilterField;
}) {
  const t = useTranslations();
  const current = column.getFilterValue() as DataTableFilterValue | undefined;

  const readBounds = (v?: DataTableFilterValue) => {
    if (!v) return { from: '', to: '' };
    if (v.operator === 'Between')
      return { from: datePart(v.values?.[0]), to: datePart(v.values?.[1]) };
    if (v.operator === 'GreaterThanOrEqual')
      return { from: datePart(v.value), to: '' };
    if (v.operator === 'LessThanOrEqual')
      return { from: '', to: datePart(v.value) };
    return { from: '', to: '' };
  };

  const [open, setOpen] = React.useState(false);
  const [from, setFrom] = React.useState(() => readBounds(current).from);
  const [to, setTo] = React.useState(() => readBounds(current).to);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const b = readBounds(current);
      setFrom(b.from);
      setTo(b.to);
    }
    setOpen(next);
  };

  const apply = () => {
    if (from && to) {
      column.setFilterValue({
        operator: 'Between',
        values: [startOfDay(from), endOfDay(to)],
      } satisfies DataTableFilterValue);
    } else if (from) {
      column.setFilterValue({
        operator: 'GreaterThanOrEqual',
        value: startOfDay(from),
      } satisfies DataTableFilterValue);
    } else if (to) {
      column.setFilterValue({
        operator: 'LessThanOrEqual',
        value: endOfDay(to),
      } satisfies DataTableFilterValue);
    } else {
      column.setFilterValue(undefined);
    }
    setOpen(false);
  };

  const bounds = readBounds(current);
  const summary = current
    ? `${bounds.from || '…'} → ${bounds.to || '…'}`
    : undefined;

  return (
    <FilterPopover
      title={t(field.title)}
      active={!!current}
      summary={summary}
      open={open}
      onOpenChange={handleOpenChange}
      contentClassName="w-[280px]"
      onClear={() => {
        column.setFilterValue(undefined);
        setOpen(false);
      }}
    >
      <div className="space-y-2">
        <label className="text-muted-foreground text-xs">
          {t('common.filter.from')}
        </label>
        <Input
          type="date"
          value={from}
          max={to || undefined}
          onChange={e => setFrom(e.target.value)}
        />
        <label className="text-muted-foreground text-xs">
          {t('common.filter.to')}
        </label>
        <Input
          type="date"
          value={to}
          min={from || undefined}
          onChange={e => setTo(e.target.value)}
        />
      </div>
      <Button size="sm" className="w-full" onClick={apply}>
        {t('common.filter.apply')}
      </Button>
    </FilterPopover>
  );
}
