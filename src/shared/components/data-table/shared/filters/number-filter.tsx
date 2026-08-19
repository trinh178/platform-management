import React from 'react';
import { Column } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  DataTableFilterValue,
  NUMBER_OPERATORS,
  NumberFilterField,
  OPERATOR_LABEL,
  operatorTakesNoInput,
  operatorTakesRange,
} from '../filter-types';
import { FilterPopover, OperatorSelect } from './filter-popover';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FilterOperator } from '@/shared/types/pagination';

export function NumberFilter<TData>({
  column,
  field,
}: {
  column: Column<TData, unknown>;
  field: NumberFilterField;
}) {
  const t = useTranslations();
  const operators = field.operators?.length
    ? field.operators
    : NUMBER_OPERATORS;
  const current = column.getFilterValue() as DataTableFilterValue | undefined;

  const [open, setOpen] = React.useState(false);
  const [operator, setOperator] = React.useState<FilterOperator>(
    current?.operator ?? operators[0],
  );
  const [value, setValue] = React.useState(current?.value ?? '');
  const [min, setMin] = React.useState(current?.values?.[0] ?? '');
  const [max, setMax] = React.useState(current?.values?.[1] ?? '');

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOperator(current?.operator ?? operators[0]);
      setValue(current?.value ?? '');
      setMin(current?.values?.[0] ?? '');
      setMax(current?.values?.[1] ?? '');
    }
    setOpen(next);
  };

  const apply = () => {
    if (operatorTakesNoInput(operator)) {
      column.setFilterValue({ operator } satisfies DataTableFilterValue);
    } else if (operatorTakesRange(operator)) {
      if (min.trim() === '' && max.trim() === '') {
        column.setFilterValue(undefined);
      } else {
        column.setFilterValue({
          operator,
          values: [min.trim(), max.trim()],
        } satisfies DataTableFilterValue);
      }
    } else if (value.trim() === '') {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue({
        operator,
        value: value.trim(),
      } satisfies DataTableFilterValue);
    }
    setOpen(false);
  };

  const summary = current
    ? operatorTakesNoInput(current.operator)
      ? t(OPERATOR_LABEL[current.operator])
      : operatorTakesRange(current.operator)
        ? `${current.values?.[0] ?? ''} – ${current.values?.[1] ?? ''}`
        : `${t(OPERATOR_LABEL[current.operator])}: ${current.value ?? ''}`
    : undefined;

  return (
    <FilterPopover
      title={t(field.title)}
      active={!!current}
      summary={summary}
      open={open}
      onOpenChange={handleOpenChange}
      onClear={() => {
        column.setFilterValue(undefined);
        setOpen(false);
      }}
    >
      <OperatorSelect
        value={operator}
        operators={operators}
        onChange={setOperator}
      />
      {operatorTakesRange(operator) ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={t('common.filter.min')}
            value={min}
            onChange={e => setMin(e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder={t('common.filter.max')}
            value={max}
            onChange={e => setMax(e.target.value)}
          />
        </div>
      ) : (
        !operatorTakesNoInput(operator) && (
          <Input
            type="number"
            autoFocus
            placeholder={t('common.filter.valuePlaceholder')}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && apply()}
          />
        )
      )}
      <Button size="sm" className="w-full" onClick={apply}>
        {t('common.filter.apply')}
      </Button>
    </FilterPopover>
  );
}
