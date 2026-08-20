'use client';

import type { Resource } from '../../types/resource';
import type { StructureSelection } from './selection';
import { cn } from '@/shared/lib/utils';

export default function ResourceNode({
  resource,
  selected,
  onSelect,
}: {
  resource: Resource;
  selected: StructureSelection;
  onSelect: (selection: StructureSelection) => void;
}) {
  const isSelected =
    selected?.kind === 'resource' && selected.id === resource.id;

  return (
    <div
      role="button"
      onClick={() => onSelect({ kind: 'resource', id: resource.id })}
      className={cn(
        'flex items-center gap-1.5 rounded-sm px-2 py-1.5 pl-9 text-sm cursor-pointer hover:bg-muted',
        isSelected && 'bg-primary/10 text-primary hover:bg-primary/10',
      )}
    >
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium">{resource.resourceCode}</span>{' '}
        <span className="text-muted-foreground">{resource.name}</span>
      </span>
    </div>
  );
}
