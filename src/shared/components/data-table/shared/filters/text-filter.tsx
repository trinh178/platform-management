import React from 'react';
import { Column } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import {
  DataTableFilterValue,
  OPERATOR_LABEL,
  TEXT_OPERATORS,
  TextFilterField,
  operatorTakesNoInput,
} from '../filter-types';
import { FilterPopover, OperatorSelect } from './filter-popover';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { FilterOperator } from '@/shared/types/pagination';

export function TextFilter<TData>({
  column,
  field,
}: {
  column: Column<TData, unknown>;
  field: TextFilterField;
}) {
  const t = useTranslations();
  const operators = field.operators?.length ? field.operators : TEXT_OPERATORS;
  const current = column.getFilterValue() as DataTableFilterValue | undefined;

  const [open, setOpen] = React.useState(false);
  const [operator, setOperator] = React.useState<FilterOperator>(
    current?.operator ?? operators[0],
  );
  const [value, setValue] = React.useState(current?.value ?? '');

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOperator(current?.operator ?? operators[0]);
      setValue(current?.value ?? '');
    }
    setOpen(next);
  };

  const apply = () => {
    if (operatorTakesNoInput(operator)) {
      column.setFilterValue({ operator } satisfies DataTableFilterValue);
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
      {!operatorTakesNoInput(operator) && (
        <Input
          autoFocus
          placeholder={t('common.filter.valuePlaceholder')}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && apply()}
        />
      )}
      <Button size="sm" className="w-full" onClick={apply}>
        {t('common.filter.apply')}
      </Button>
    </FilterPopover>
  );
}
