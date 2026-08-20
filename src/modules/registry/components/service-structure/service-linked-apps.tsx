'use client';

import React from 'react';
import { Link2Off, Loader2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AppServiceMappingAssignDialog from '../app-service-mapping-assign-dialog';
import AppServiceMappingUnassignConfirmContent from '../app-service-mapping-unassign-confirm-content';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { AppLink } from '@/core/router/next';
import routePaths from '@/modules/registry/route-paths';
import { useAppServiceMappingUnassign } from '@/modules/registry/services/app-service-mapping.mutation';
import { useAppServiceMappings } from '@/modules/registry/services/app-service-mapping.queries';
import type { AppServiceMapping } from '@/modules/registry/types/app-service-mapping';
import SectionPanel from '@/shared/components/layout/section-panel';
import { Button } from '@/shared/components/ui/button';

export default function ServiceLinkedApps({
  serviceId,
}: {
  serviceId: string;
}) {
  const t = useTranslations();
  const confirm = useConfirm();
  const canAssign = useHasPermissions(
    'PLM.REGISTRY.APP_SERVICE_MAPPING.ASSIGN',
  );
  const canUnassign = useHasPermissions(
    'PLM.REGISTRY.APP_SERVICE_MAPPING.UNASSIGN',
  );

  const mappings = useAppServiceMappings({
    pageIndex: 0,
    pageSize: 100,
    filters: [{ field: 'serviceId', value: serviceId }],
    sorts: [{ field: 'createdOnUtc', direction: 'Descending' }],
  });

  const unassign = useAppServiceMappingUnassign({
    meta: { notifySuccess: 'common.notify.delete_success' },
  });

  const [assignOpen, setAssignOpen] = React.useState(false);

  const handleUnassign = async (mapping: AppServiceMapping) => {
    if (!canUnassign) return;
    const confirmed = await confirm({
      title: t('registry.appServiceMapping.unassignConfirm.title'),
      description: t('registry.appServiceMapping.unassignConfirm.description'),
      content: <AppServiceMappingUnassignConfirmContent mapping={mapping} />,
      variant: 'danger',
      confirmText: t('registry.appServiceMapping.controls.unassign'),
      cancelText: t('common.control.cancel'),
    });
    if (confirmed) unassign.mutate(mapping.id);
  };

  return (
    <SectionPanel
      title={t('registry.appServiceMapping.linkedApps.title')}
      actions={
        canAssign && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAssignOpen(true)}
          >
            <Plus />
            {t('registry.appServiceMapping.controls.assign')}
          </Button>
        )
      }
    >
      {mappings.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {t('common.notify.loading')}
        </div>
      ) : mappings.data?.items.length ? (
        <div className="divide-y">
          {mappings.data.items.map(mapping => (
            <div
              key={mapping.id}
              className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
            >
              <AppLink
                href={routePaths.appsDetails}
                params={{ id: mapping.appId }}
                className="min-w-0 truncate text-sm underline-offset-4 hover:underline"
              >
                <span className="font-medium">{mapping.app?.appCode}</span>{' '}
                <span className="text-muted-foreground">
                  {mapping.app?.name}
                </span>
              </AppLink>

              {canUnassign && (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => handleUnassign(mapping)}
                >
                  <Link2Off />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {t('registry.appServiceMapping.linkedApps.empty')}
        </div>
      )}

      <AppServiceMappingAssignDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        defaultServiceId={serviceId}
      />
    </SectionPanel>
  );
}
