import type { App } from '../types/app';

export default function AppDeleteConfirmContent({
  app,
}: {
  app: Pick<App, 'appCode' | 'name' | 'description'>;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{app.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>{app.appCode}</span>
          {app.description && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{app.description}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
