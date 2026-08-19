import type { Service } from '../types/service';

export default function ServiceDeleteConfirmContent({
  service,
}: {
  service: Pick<Service, 'serviceCode' | 'name' | 'description'>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{service.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{service.serviceCode}</span>
          {service.description && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{service.description}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
