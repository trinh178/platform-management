import { FolderTree } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function EmptyState() {
  const t = useTranslations();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      <FolderTree className="size-10" />
      <p className="text-sm">{t('registry.structure.emptySelection')}</p>
    </div>
  );
}
