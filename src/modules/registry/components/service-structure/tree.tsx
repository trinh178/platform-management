'use client';

import React from 'react';
import { Loader2, Plus, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useServices } from '../../services/service.queries';
import type { StructureSelection } from './selection';
import ServiceNode from './service-node';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useDebounceCallback } from '@/shared/hooks/use-debounce-callback';

export default function ServiceStructureTree({
  selected,
  onSelect,
}: {
  selected: StructureSelection;
  onSelect: (selection: StructureSelection) => void;
}) {
  const t = useTranslations();
  const canCreateService = useHasPermissions('PLM.REGISTRY.SERVICE.CREATE');

  const [searchInput, setSearchInput] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSetSearchTerm = useDebounceCallback(setSearchTerm, 300);

  const services = useServices({
    pageIndex: 0,
    pageSize: 100,
    searchTerm: searchTerm || undefined,
    sorts: [{ field: 'serviceCode', direction: 'Ascending' }],
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-2">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={e => {
            setSearchInput(e.target.value);
            debouncedSetSearchTerm(e.target.value);
          }}
          placeholder={t('registry.structure.searchPlaceholder')}
          className="h-8 border-0 shadow-none focus-visible:ring-0"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {services.isPending ? (
          <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            {t('common.notify.loading')}
          </div>
        ) : services.data?.items.length ? (
          services.data.items.map(service => (
            <ServiceNode
              key={service.id}
              service={service}
              selected={selected}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="p-2 text-sm text-muted-foreground">
            {t('registry.structure.empty')}
          </div>
        )}
      </div>

      {canCreateService && (
        <div className="border-t p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary hover:text-primary"
            onClick={() => onSelect({ kind: 'service' })}
          >
            <Plus />
            {t('registry.service.page.create')}
          </Button>
        </div>
      )}
    </div>
  );
}
