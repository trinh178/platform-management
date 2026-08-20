'use client';

import React from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Domain } from '../../types/domain';
import ResourceList from './resource-list';
import type { StructureSelection } from './selection';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { cn } from '@/shared/lib/utils';

export default function DomainNode({
  domain,
  selected,
  onSelect,
}: {
  domain: Domain;
  selected: StructureSelection;
  onSelect: (selection: StructureSelection) => void;
}) {
  const t = useTranslations();
  const [expanded, setExpanded] = React.useState(false);
  const canCreateResource = useHasPermissions('PLM.REGISTRY.RESOURCE.CREATE');

  const isSelected = selected?.kind === 'domain' && selected.id === domain.id;

  const handleAddResource = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(true);
    onSelect({ kind: 'resource', domainId: domain.id });
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-sm px-2 py-1.5 pl-5 text-sm cursor-pointer hover:bg-muted',
          isSelected && 'bg-primary/10 text-primary hover:bg-primary/10',
        )}
        onClick={() => onSelect({ kind: 'domain', id: domain.id })}
      >
        <button
          type="button"
          className="shrink-0 text-muted-foreground"
          onClick={e => {
            e.stopPropagation();
            setExpanded(v => !v);
          }}
        >
          <ChevronRight
            className={cn(
              'size-4 transition-transform',
              expanded && 'rotate-90',
            )}
          />
        </button>

        <span className="min-w-0 flex-1 truncate">
          <span className="font-medium">{domain.domainCode}</span>{' '}
          <span className="text-muted-foreground">{domain.name}</span>
        </span>

        {canCreateResource && (
          <button
            type="button"
            title={t('registry.resource.page.create')}
            className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-0 hover:bg-background group-hover:opacity-100"
            onClick={handleAddResource}
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>

      {expanded && (
        <ResourceList
          domainId={domain.id}
          selected={selected}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
