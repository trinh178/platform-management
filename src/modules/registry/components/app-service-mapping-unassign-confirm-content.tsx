import type { AppServiceMapping } from '../types/app-service-mapping';

export default function AppServiceMappingUnassignConfirmContent({
  mapping,
}: {
  mapping: Pick<AppServiceMapping, 'app' | 'service'>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {mapping.app?.appCode} → {mapping.service?.serviceCode}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{mapping.app?.name}</span>
          <span className="text-border">|</span>
          <span>{mapping.service?.name}</span>
        </div>
      </div>
    </div>
  );
}
