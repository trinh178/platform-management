import { AlertTriangle, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DeleteImpact } from '../types/delete-impact';

// Hiển thị số lượng dữ liệu con sẽ bị xoá kèm (D12) trong hộp xác nhận xoá
// Service/Domain/Resource. Field nào không có trong `impact` thì không hiển thị.
export default function DeleteImpactSummary({
  impact,
}: {
  impact: DeleteImpact;
}) {
  const t = useTranslations();

  const parts = [
    impact.domains !== undefined &&
      t('registry.deleteImpact.domains', { count: impact.domains }),
    impact.resources !== undefined &&
      t('registry.deleteImpact.resources', { count: impact.resources }),
    impact.actions !== undefined &&
      t('registry.deleteImpact.actions', { count: impact.actions }),
  ].filter((part): part is string => !!part);

  const total =
    (impact.domains ?? 0) + (impact.resources ?? 0) + (impact.actions ?? 0);

  if (impact.mappings) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>
          {t('registry.deleteImpact.hasMappings', { count: impact.mappings })}
        </span>
      </div>
    );
  }

  if (!total) {
    return (
      <div className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>{t('registry.deleteImpact.none')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>
        {t('registry.deleteImpact.cascade', { items: parts.join(', ') })}
      </span>
    </div>
  );
}
