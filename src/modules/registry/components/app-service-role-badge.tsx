import { useTranslations } from 'next-intl';
import { CONST_APP_SERVICE_ROLE } from '../constants/app-service-mapping';
import type { AppServiceRole } from '../types/app-service-mapping';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

export default function AppServiceRoleBadge({
  role,
  className,
}: {
  role?: AppServiceRole;
  className?: string;
}) {
  const t = useTranslations();
  const item = CONST_APP_SERVICE_ROLE.find(r => r.value === role);
  if (!item) return null;

  return (
    <Badge
      variant="outline"
      className={cn('shrink-0 font-normal', item.className, className)}
    >
      {t(item.label)}
    </Badge>
  );
}
