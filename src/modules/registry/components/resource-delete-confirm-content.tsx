import type { Resource } from '../types/resource';

export default function ResourceDeleteConfirmContent({
  resource,
}: {
  resource: Pick<Resource, 'resourceCode' | 'name' | 'description' | 'domain'>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{resource.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{resource.resourceCode}</span>
          {resource.domain && (
            <>
              <span className="text-border">|</span>
              <span>{resource.domain.domainCode}</span>
            </>
          )}
          {resource.description && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{resource.description}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
