import { Column } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { BooleanFilterField, DataTableFilterValue } from '../filter-types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

const ALL = '__all__';

/** Filter boolean → `Equal` 'true' | 'false'. Chọn "Tất cả" để xóa filter. */
export function BooleanFilter<TData>({
  column,
  field,
}: {
  column: Column<TData, unknown>;
  field: BooleanFilterField;
}) {
  const t = useTranslations();
  const current = column.getFilterValue() as DataTableFilterValue | undefined;
  const value = current?.value ?? ALL;

  const onChange = (next: string) => {
    if (next === ALL) {
      column.setFilterValue(undefined);
    } else {
      column.setFilterValue({
        operator: 'Equal',
        value: next,
      } satisfies DataTableFilterValue);
    }
  };

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        className="h-8 w-auto min-w-[120px] border-dashed"
      >
        <span className="text-muted-foreground mr-1">{t(field.title)}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{t('common.filter.all')}</SelectItem>
        <SelectItem value="true">
          {t(field.trueLabel ?? 'common.filter.yes')}
        </SelectItem>
        <SelectItem value="false">
          {t(field.falseLabel ?? 'common.filter.no')}
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
