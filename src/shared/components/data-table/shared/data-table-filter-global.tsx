import React from 'react';
import { Search } from 'lucide-react';
import { DataTableState } from './types';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/shared/components/ui/input-group';
import { Spinner } from '@/shared/components/ui/spinner';
import { useDebounceCallback } from '@/shared/hooks/use-debounce-callback';
import { cn } from '@/shared/lib/utils';

export interface DataTableFilterGlobalType {
  searchPlaceholder?: string;
}

export default function DataTableFilterGlobal<TData>({
  table,
  isLoading,
  searchPlaceholder,
}: DataTableState<TData> & DataTableFilterGlobalType) {
  const externalValue = (table.getState().globalFilter as string) || '';
  const [value, setValue] = React.useState(externalValue);

  React.useEffect(() => {
    if (externalValue !== value)
      React.startTransition(() => setValue(externalValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalValue]);

  const performSearch = React.useCallback(
    (value: string) => {
      table.setGlobalFilter(value);
    },
    [table],
  );

  const debouncedSearch = useDebounceCallback(performSearch, 500);

  return (
    <InputGroup className="h-8 w-[150px] lg:w-[250px]">
      <InputGroupInput
        placeholder={searchPlaceholder}
        value={value}
        onChange={e => {
          setValue(e.target.value);
          debouncedSearch(e.target.value);
        }}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <Spinner className={cn({ hidden: !isLoading })} />
      </InputGroupAddon>
    </InputGroup>
  );
}
