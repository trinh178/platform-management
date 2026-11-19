'use client';

import React from 'react';
import {
  ChevronDown,
  Download,
  FileDown,
  FileUp,
  Layers,
  Server,
  Upload,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { StructureSelection } from './selection';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { notify } from '@/core/notification';
import { useDomainDetails } from '@/modules/registry/services/domain.queries';
import {
  usePermissionExport,
  usePermissionImport,
} from '@/modules/registry/services/permission-catalog.mutation';
import { usePermissionCatalog } from '@/modules/registry/services/permission-catalog.queries';
import { useResourceDetails } from '@/modules/registry/services/resource.queries';
import { useServiceDetails } from '@/modules/registry/services/service.queries';
import type { PermissionImportResult } from '@/modules/registry/types/permission-catalog';
import {
  PERMISSION_CODE_LIST_TEMPLATE,
  type PermissionCodeLine,
  type PermissionCodeLineStatus,
  downloadTextFile,
  isPermissionCodeLineError,
  parsePermissionCodeList,
} from '@/modules/registry/utils/permission-code';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';

const MAX_IMPORT_FILE_SIZE = 1024 * 1024; // 1 MB — khớp giới hạn backend

const STATUS_CLASS_NAME: Record<PermissionCodeLineStatus, string> = {
  VALID:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  EXISTS: 'border-border bg-muted text-muted-foreground',
  INVALID_FORMAT: 'border-destructive/30 bg-destructive/10 text-destructive',
  DUPLICATE_IN_FILE: 'border-destructive/30 bg-destructive/10 text-destructive',
};

// Service đang xem trên cây (Service / Domain / Resource được chọn) → serviceCode
// để export theo service. Các query này đã được panel bên phải gọi nên dùng cache.
function useSelectedServiceCode(selected: StructureSelection) {
  const resource = useResourceDetails(
    selected?.kind === 'resource' ? selected.id! : '',
    { enabled: selected?.kind === 'resource' && !!selected.id },
  );
  const domainId =
    selected?.kind === 'domain' ? selected.id : resource.data?.domainId;
  const domain = useDomainDetails(domainId ?? '', {
    enabled: !!domainId && selected?.kind !== 'service',
  });
  const serviceId =
    selected?.kind === 'service'
      ? selected.id
      : (domain.data?.serviceId ?? resource.data?.domain?.serviceId);
  const service = useServiceDetails(serviceId ?? '', {
    enabled: !!serviceId,
  });

  return selected ? service.data?.serviceCode : undefined;
}

export default function PermissionCatalogActions({
  selected,
}: {
  selected: StructureSelection;
}) {
  const t = useTranslations();
  const canImport = useHasPermissions('PLM.REGISTRY.PERMISSION.IMPORT');
  const canExport = useHasPermissions('PLM.REGISTRY.PERMISSION.EXPORT');
  const serviceCode = useSelectedServiceCode(selected);

  const fileRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File>();
  const [text, setText] = React.useState('');
  const [report, setReport] = React.useState<PermissionImportResult>();

  /* EXPORT */
  const exportCodes = usePermissionExport({
    meta: { notifySuccess: false },
  });
  const handleExport = (code?: string) => {
    exportCodes.mutate(
      { serviceCode: code },
      {
        onSuccess: content =>
          downloadTextFile(
            `permissions-${code ? code.toLowerCase() : 'all'}.txt`,
            content,
          ),
      },
    );
  };

  /* TEMPLATE */
  const handleTemplate = () =>
    downloadTextFile(
      'permissions-import-template.txt',
      PERMISSION_CODE_LIST_TEMPLATE,
    );

  /* IMPORT — xem trước client-side, backend kiểm tra lại toàn bộ */
  const catalog = usePermissionCatalog(undefined, {
    enabled: open && canImport,
  });
  const lines = React.useMemo<PermissionCodeLine[]>(
    () =>
      parsePermissionCodeList(
        text,
        (catalog.data ?? []).map(item => item.code),
      ),
    [catalog.data, text],
  );
  const errorCount = lines.filter(isPermissionCodeLineError).length;
  const existsCount = lines.filter(line => line.status === 'EXISTS').length;
  const newCount = lines.filter(line => line.status === 'VALID').length;

  const importCodes = usePermissionImport({
    meta: { notifySuccess: false },
    onSuccess: result => setReport(result),
  });

  const resetImport = () => {
    setFile(undefined);
    setText('');
    setReport(undefined);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const picked = event.target.files?.[0];
    event.target.value = '';
    if (!picked) return;
    if (picked.size > MAX_IMPORT_FILE_SIZE) {
      notify.error(t('registry.permissionCatalog.import.fileTooLarge'));
      return;
    }
    setReport(undefined);
    setFile(picked);
    setText(await picked.text());
    setOpen(true);
  };

  const handleImport = () => {
    if (!file || !lines.length || errorCount > 0) return;
    importCodes.mutate({ file });
  };

  if (!canImport && !canExport) return null;

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center gap-2">
        {canImport && (
          <Button
            size="sm"
            variant="outline"
            icon={<Download />}
            onClick={handleTemplate}
          >
            <span className="hidden lg:inline">
              {t('registry.permissionCatalog.template')}
            </span>
          </Button>
        )}

        {canExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                icon={<FileDown />}
                loading={exportCodes.isPending}
              >
                <span className="hidden lg:inline">
                  {t('registry.permissionCatalog.export.title')}
                </span>
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>
                {t('registry.permissionCatalog.export.scope')}
              </DropdownMenuLabel>
              <DropdownMenuItem
                disabled={!serviceCode}
                onClick={() => handleExport(serviceCode)}
              >
                <Server />
                <div className="min-w-0">
                  <div>
                    {t('registry.permissionCatalog.export.current')}
                    {serviceCode && (
                      <span className="ml-1 font-mono text-xs">
                        ({serviceCode})
                      </span>
                    )}
                  </div>
                  {!serviceCode && (
                    <div className="truncate text-xs text-muted-foreground">
                      {t('registry.permissionCatalog.export.currentRequired')}
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport(undefined)}>
                <Layers />
                {t('registry.permissionCatalog.export.all')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {canImport && (
          <Button
            size="sm"
            variant="outline"
            icon={<FileUp />}
            onClick={() => fileRef.current?.click()}
          >
            <span className="hidden lg:inline">
              {t('registry.permissionCatalog.import.title')}
            </span>
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={next => {
          if (importCodes.isPending) return;
          setOpen(next);
          if (!next) resetImport();
        }}
      >
        <DialogContent className="grid max-h-[calc(100vh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {report
                ? t('registry.permissionCatalog.report.title')
                : t('registry.permissionCatalog.import.dialogTitle')}
            </DialogTitle>
            <DialogDescription className="break-all pr-6">
              {file?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            {report ? (
              <ImportReport report={report} />
            ) : (
              <>
                <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                  {t('registry.permissionCatalog.import.formatHint')}
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <Metric
                    value={lines.length}
                    label={t('registry.permissionCatalog.import.metrics.total')}
                  />
                  <Metric
                    value={newCount}
                    label={t('registry.permissionCatalog.import.metrics.new')}
                  />
                  <Metric
                    value={existsCount}
                    label={t(
                      'registry.permissionCatalog.import.metrics.existing',
                    )}
                  />
                  <Metric
                    value={errorCount}
                    label={t(
                      'registry.permissionCatalog.import.metrics.errors',
                    )}
                    danger={errorCount > 0}
                  />
                </div>

                {errorCount > 0 && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {t('registry.permissionCatalog.import.hasErrors')}
                  </div>
                )}

                <ScrollArea className="h-72 rounded-md border">
                  {catalog.isPending && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {t('common.notify.loading')}
                    </div>
                  )}
                  {!catalog.isPending && !lines.length && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {t('registry.permissionCatalog.import.empty')}
                    </div>
                  )}
                  {!catalog.isPending && (
                    <div className="divide-y">
                      {lines.map(line => (
                        <div
                          key={line.line}
                          className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-1.5 text-sm"
                        >
                          <span className="text-muted-foreground">
                            #{line.line}
                          </span>
                          <span className="truncate font-mono text-xs">
                            {line.code}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-normal',
                              STATUS_CLASS_NAME[line.status],
                            )}
                          >
                            {t(
                              `registry.permissionCatalog.status.${line.status}`,
                            )}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </div>

          <DialogFooter className="shrink-0">
            {report ? (
              <Button
                onClick={() => {
                  setOpen(false);
                  resetImport();
                }}
              >
                {t('common.control.close')}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={importCodes.isPending}
                  onClick={() => {
                    setOpen(false);
                    resetImport();
                  }}
                >
                  {t('common.control.cancel')}
                </Button>
                <Button
                  icon={<Upload />}
                  loading={importCodes.isPending}
                  disabled={
                    !file ||
                    !lines.length ||
                    errorCount > 0 ||
                    catalog.isPending
                  }
                  onClick={handleImport}
                >
                  {t('registry.permissionCatalog.import.submit')}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Metric({
  value,
  label,
  danger,
}: {
  value: number;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-md border p-3">
      <div
        className={cn('text-2xl font-semibold', danger && 'text-destructive')}
      >
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ImportReport({ report }: { report: PermissionImportResult }) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'rounded-md border px-3 py-2 text-sm',
          report.applied
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
            : 'border-destructive/30 bg-destructive/5 text-destructive',
        )}
      >
        {report.applied
          ? t('registry.permissionCatalog.report.applied')
          : t('registry.permissionCatalog.report.notApplied')}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric
          value={report.created.services}
          label={t('registry.permissionCatalog.report.services')}
        />
        <Metric
          value={report.created.domains}
          label={t('registry.permissionCatalog.report.domains')}
        />
        <Metric
          value={report.created.resources}
          label={t('registry.permissionCatalog.report.resources')}
        />
        <Metric
          value={report.created.actions}
          label={t('registry.permissionCatalog.report.actions')}
        />
        <Metric
          value={report.skipped}
          label={t('registry.permissionCatalog.report.skipped')}
        />
      </div>

      {report.errors.length > 0 && (
        <ScrollArea className="h-56 rounded-md border">
          <div className="divide-y">
            {report.errors.map(error => (
              <div
                key={`${error.line}-${error.code}`}
                className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-1.5 text-sm"
              >
                <span className="text-muted-foreground">#{error.line}</span>
                <span className="truncate font-mono text-xs">{error.code}</span>
                <Badge
                  variant="outline"
                  className={cn('font-normal', STATUS_CLASS_NAME[error.reason])}
                >
                  {t(`registry.permissionCatalog.status.${error.reason}`)}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
