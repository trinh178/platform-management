'use client';

import React from 'react';
import DomainCreateDialog from './domain-create-dialog';
import DomainPanel from './domain-panel';
import EmptyState from './empty-state';
import ResourceCreateDialog from './resource-create-dialog';
import ResourcePanel from './resource-panel';
import type { StructureSelection } from './selection';
import ServiceCreateDialog from './service-create-dialog';
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
  // Kích hoạt từ nút "+"/"Đăng ký ..." trên cây — không có `id` nên mở modal
  // tạo mới thay vì hiện form CREATE ở panel bên phải.
  const [createTarget, setCreateTarget] =
    React.useState<StructureSelection>(null);

  const handleSelect = (next: StructureSelection) => {
    if (next && !next.id) {
      setCreateTarget(next);
      return;
    }
    setSelected(next);
  };

  return (
    <div className="flex min-h-0 flex-1 gap-4">
      <div className="w-80 shrink-0 overflow-hidden rounded-lg border bg-card">
        <ServiceStructureTree selected={selected} onSelect={handleSelect} />
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg border bg-card">
        {selected?.kind === 'service' && (
          <ServicePanel
            key={selected.id}
            id={selected.id}
            onCreated={() => {}}
            onDeleted={() => setSelected(null)}
          />
        )}

        {selected?.kind === 'domain' && (
          <DomainPanel
            key={selected.id}
            id={selected.id}
            onCreated={() => {}}
            onDeleted={() => setSelected(null)}
          />
        )}

        {selected?.kind === 'resource' && (
          <ResourcePanel
            key={selected.id}
            id={selected.id}
            onCreated={() => {}}
            onDeleted={() => setSelected(null)}
          />
        )}

        {!selected && <EmptyState />}
      </div>

      <ServiceCreateDialog
        open={createTarget?.kind === 'service'}
        onOpenChange={open => !open && setCreateTarget(null)}
        onCreated={service => {
          setCreateTarget(null);
          setSelected({ kind: 'service', id: service.id });
        }}
      />

      <DomainCreateDialog
        open={createTarget?.kind === 'domain'}
        onOpenChange={open => !open && setCreateTarget(null)}
        defaultServiceId={
          createTarget?.kind === 'domain' ? createTarget.serviceId : undefined
        }
        onCreated={domain => {
          setCreateTarget(null);
          setSelected({ kind: 'domain', id: domain.id });
        }}
      />

      <ResourceCreateDialog
        open={createTarget?.kind === 'resource'}
        onOpenChange={open => !open && setCreateTarget(null)}
        defaultDomainId={
          createTarget?.kind === 'resource' ? createTarget.domainId : undefined
        }
        onCreated={resource => {
          setCreateTarget(null);
          setSelected({ kind: 'resource', id: resource.id });
        }}
      />
    </div>
  );
}
