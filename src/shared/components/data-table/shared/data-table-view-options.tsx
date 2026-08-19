import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { IconChevronDown, IconLayoutColumns } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { DataTableState } from './types';
import { TranslationsKey } from '@/core/i18n/types';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from '@/shared/components/ui/dropdown-menu';

export default function DataTableViewOptions<TData>({
  table,
}: DataTableState<TData>) {
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <IconLayoutColumns />
          <span className="hidden lg:inline">
            {t('common.table.customize_columns')}
          </span>
          <span className="lg:hidden">{t('common.table.columns')}</span>
          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {table
          .getAllColumns()
          .filter(column => column.getCanHide())
          .map(column => {
            const header = column.columnDef.header;
            const label =
              typeof header === 'string'
                ? t(header as TranslationsKey)
                : (column.columnDef.meta?.label ?? column.id);
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={value => column.toggleVisibility(!!value)}
              >
                {label}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
