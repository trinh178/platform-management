'use client';

import { useTranslations } from 'next-intl';
import { useDomainDetails } from '@/modules/registry/services/domain.queries';
import { useServiceDetails } from '@/modules/registry/services/service.queries';
import type { Resource } from '@/modules/registry/types/resource';
import { buildPermissionCode } from '@/modules/registry/utils/permission-code';
import SubSection from '@/shared/components/layout/sub-section';

// Danh sách mã quyền `<ServiceCode>.<DomainCode>.<ResourceCode>.<Action>` mà
// Resource sinh ra (D15) — IAM đồng bộ đúng các mã này từ PLM.
export default function ResourcePermissionCodes({
  resource,
}: {
  resource: Resource;
}) {
  const t = useTranslations();

  // Response details đã kèm DomainPreview (có serviceId); fallback gọi details
  // của Domain nếu thiếu.
  const domainDetails = useDomainDetails(resource.domainId, {
    enabled: !resource.domain && !!resource.domainId,
  });
  const domain = resource.domain ?? domainDetails.data;
  const service = useServiceDetails(domain?.serviceId ?? '', {
    enabled: !!domain?.serviceId,
  });

  const actions = resource.actions ?? [];
  const codes = actions.map(action =>
    buildPermissionCode({
      serviceCode: service.data?.serviceCode,
      domainCode: domain?.domainCode,
      resourceCode: resource.resourceCode,
      action,
    }),
  );

  return (
    <SubSection
      title={t('registry.resource.permissionCodes.title')}
      description={t('registry.resource.permissionCodes.description')}
    >
      {codes.length ? (
        <ul className="space-y-1">
          {codes.map(code => (
            <li
              key={code}
              className="w-fit rounded bg-muted px-2 py-0.5 font-mono text-xs"
            >
              {code}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-muted-foreground">
          {t('registry.resource.permissionCodes.empty')}
        </div>
      )}
    </SubSection>
  );
}
