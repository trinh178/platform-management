import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  DataTableFilterField,
  DataTableFilterOptions,
  FilterOption,
} from './filter-types';
import { BooleanFilter } from './filters/boolean-filter';
import { DateRangeFilter } from './filters/date-range-filter';
import { EnumFilter } from './filters/enum-filter';
import { NumberFilter } from './filters/number-filter';
import { TextFilter } from './filters/text-filter';
import { DataTableState } from './types';
import { Button } from '@/shared/components/ui/button';

// Re-export filter config types để giữ import path cũ
// (`@/shared/components/data-table/shared/data-table-filter`).
export * from './filter-types';

export interface DataTableFilterType {
  filterFields?: DataTableFilterField[];
  /** Options động cho field `type: 'select'`, keyed theo field id (thường từ 1 API multi-column). */
  filterOptions?: DataTableFilterOptions;
}

export default function DataTableFilter<TData>({
  table,
  filterFields,
  filterOptions,
}: DataTableState<TData> & DataTableFilterType) {
  const t = useTranslations();

  if (!filterFields?.length) return null;

  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      {filterFields.map(field => {
        const column = table.getColumn(field.id);
        if (!column) return null;

        if (field.type === 'text')
          return <TextFilter key={field.id} column={column} field={field} />;
        if (field.type === 'number')
          return <NumberFilter key={field.id} column={column} field={field} />;
        if (field.type === 'dateRange')
          return (
            <DateRangeFilter key={field.id} column={column} field={field} />
          );
        if (field.type === 'boolean')
          return <BooleanFilter key={field.id} column={column} field={field} />;

        if (field.type === 'select')
          return (
            <EnumFilter
              key={field.id}
              column={column}
              field={field}
              options={filterOptions?.[field.id] ?? []}
            />
          );

        // enum (mặc định): options tĩnh, translate label i18n
        const enumOptions: FilterOption[] = field.options.map(option => ({
          label: t(option.label),
          value: option.value,
          icon: option.icon,
        }));
        return (
          <EnumFilter
            key={field.id}
            column={column}
            field={field}
            options={enumOptions}
          />
        );
      })}

      {isFiltered && (
        <Button
          variant="ghost"
          onClick={() => table.resetColumnFilters(false)}
          className="h-8 px-2 lg:px-3"
        >
          {t('common.control.reset')}
          <X />
        </Button>
      )}
    </div>
  );
}
