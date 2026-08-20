'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDomains } from '../../services/domain.queries';
import DomainNode from './domain-node';
import type { StructureSelection } from './selection';

export default function DomainList({
  serviceId,
  selected,
  onSelect,
}: {
  serviceId: string;
  selected: StructureSelection;
  onSelect: (selection: StructureSelection) => void;
}) {
  const t = useTranslations();

  const domains = useDomains({
    pageIndex: 0,
    pageSize: 100,
    filters: [{ field: 'serviceId', value: serviceId }],
    sorts: [{ field: 'domainCode', direction: 'Ascending' }],
  });

  if (domains.isPending) {
    return (
      <div className="flex items-center gap-2 py-1.5 pl-5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        {t('common.notify.loading')}
      </div>
    );
  }

  if (!domains.data?.items.length) {
    return (
      <div className="py-1.5 pl-5 text-xs text-muted-foreground">
        {t('registry.structure.empty')}
      </div>
    );
  }

  return (
    <div>
      {domains.data.items.map(domain => (
        <DomainNode
          key={domain.id}
          domain={domain}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
