'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useResources } from '../../services/resource.queries';
import ResourceNode from './resource-node';
import type { StructureSelection } from './selection';

export default function ResourceList({
  domainId,
  selected,
  onSelect,
}: {
  domainId: string;
  selected: StructureSelection;
  onSelect: (selection: StructureSelection) => void;
}) {
  const t = useTranslations();

  const resources = useResources({
    pageIndex: 0,
    pageSize: 100,
    filters: [{ field: 'domainId', value: domainId }],
    sorts: [{ field: 'resourceCode', direction: 'Ascending' }],
  });

  if (resources.isPending) {
    return (
      <div className="flex items-center gap-2 py-1.5 pl-9 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        {t('common.notify.loading')}
      </div>
    );
  }

  if (!resources.data?.items.length) {
    return (
      <div className="py-1.5 pl-9 text-xs text-muted-foreground">
        {t('registry.structure.empty')}
      </div>
    );
  }

  return (
    <div>
      {resources.data.items.map(resource => (
        <ResourceNode
          key={resource.id}
          resource={resource}
          selected={selected}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
