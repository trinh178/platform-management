import type { Domain } from '../types/domain';

export default function DomainDeleteConfirmContent({
  domain,
}: {
  domain: Pick<Domain, 'domainCode' | 'name' | 'description' | 'service'>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{domain.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{domain.domainCode}</span>
          {domain.service && (
            <>
              <span className="text-border">|</span>
              <span>{domain.service.serviceCode}</span>
            </>
          )}
          {domain.description && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{domain.description}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
