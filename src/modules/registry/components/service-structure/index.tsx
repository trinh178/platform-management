'use client';

import React from 'react';
import DomainPanel from './domain-panel';
import EmptyState from './empty-state';
import ResourcePanel from './resource-panel';
import type { StructureSelection } from './selection';
import ServicePanel from './service-panel';
import ServiceStructureTree from './tree';

export function ServiceStructure({
  initialServiceId,
}: {
  initialServiceId?: string;
}) {
  const [selected, setSelected] = React.useState<StructureSelection>(
    initialServiceId ? { kind: 'service', id: initialServiceId } : null,
  );

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="w-80 shrink-0 overflow-hidden rounded-lg border bg-card">
        <ServiceStructureTree selected={selected} onSelect={setSelected} />
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border bg-card">
        {selected?.kind === 'service' && (
          <ServicePanel
            key={selected.id ?? 'create-service'}
            id={selected.id}
            onCreated={service =>
              setSelected({ kind: 'service', id: service.id })
            }
            onDeleted={() => setSelected(null)}
          />
        )}

        {selected?.kind === 'domain' && (
          <DomainPanel
            key={selected.id ?? `create-domain-${selected.serviceId}`}
            id={selected.id}
            defaultServiceId={selected.serviceId}
            onCreated={domain => setSelected({ kind: 'domain', id: domain.id })}
            onDeleted={() => setSelected(null)}
          />
        )}

        {selected?.kind === 'resource' && (
          <ResourcePanel
            key={selected.id ?? `create-resource-${selected.domainId}`}
            id={selected.id}
            defaultDomainId={selected.domainId}
            onCreated={resource =>
              setSelected({ kind: 'resource', id: resource.id })
            }
            onDeleted={() => setSelected(null)}
          />
        )}

        {!selected && <EmptyState />}
      </div>
    </div>
  );
}
