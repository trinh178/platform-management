'use client';

import React from 'react';
import { ChevronRight, Plus, Server } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Service } from '../../types/service';
import DomainList from './domain-list';
import type { StructureSelection } from './selection';
import StatusDot from './status-dot';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { cn } from '@/shared/lib/utils';

export default function ServiceNode({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: StructureSelection;
  onSelect: (selection: StructureSelection) => void;
}) {
  const t = useTranslations();
  const [expanded, setExpanded] = React.useState(false);
  const canCreateDomain = useHasPermissions('PLM.REGISTRY.DOMAIN.CREATE');

  const isSelected = selected?.kind === 'service' && selected.id === service.id;

  const handleAddDomain = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(true);
    onSelect({ kind: 'domain', serviceId: service.id });
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-muted',
          isSelected && 'bg-primary/10 text-primary hover:bg-primary/10',
        )}
        onClick={() => onSelect({ kind: 'service', id: service.id })}
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

        <Server className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />

        <StatusDot status={service.status} />

        <span className="min-w-0 flex-1 truncate">
          <span className="font-semibold">{service.serviceCode}</span>{' '}
          <span className="text-muted-foreground">{service.name}</span>
        </span>

        {canCreateDomain && (
          <button
            type="button"
            title={t('registry.domain.page.create')}
            className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-0 hover:bg-background group-hover:opacity-100"
            onClick={handleAddDomain}
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>

      {expanded && (
        <DomainList
          serviceId={service.id}
          selected={selected}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
