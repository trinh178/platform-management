'use client';

import React from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  FieldPath,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import {
  ServiceCRUDContext,
  ServiceCRUDContextProps,
  defaultValue,
} from '../service-crud/context';
import formValidateResolver from '../service-crud/form-validate-resolver';
import ServiceBasic from '../service-crud/sections/service-basic';
import transformCreateData from '../service-crud/transform-create-data';
import ServiceDeleteConfirmContent from '../service-delete-confirm-content';
import ServiceLinkedApps from './service-linked-apps';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useFormValidateResolver } from '@/core/form';
import { notify } from '@/core/notification';
import {
  useServiceCreate,
  useServiceDelete,
  useServiceUpdate,
} from '@/modules/registry/services/service.mutation';
import { useServiceDetails } from '@/modules/registry/services/service.queries';
import { Service } from '@/modules/registry/types/service';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

interface ServicePanelProps {
  id?: string;
  onCreated: (service: Service) => void;
  onDeleted: () => void;
}

export default function ServicePanel({
  id,
  onCreated,
  onDeleted,
}: ServicePanelProps) {
  const t = useTranslations();
  const confirm = useConfirm();
  const mode = id ? 'READ' : 'CREATE';
  const canUpdate = useHasPermissions('PLM.REGISTRY.SERVICE.UPDATE');
  const canDelete = useHasPermissions('PLM.REGISTRY.SERVICE.DELETE');

  /* Form */
  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Service>({
    resolver,
    reValidateMode: 'onSubmit',
    defaultValues: { status: 'Active' },
  });

  /* CREATE */
  const create = useServiceCreate({
    meta: { notifySuccess: 'common.notify.create_success' },
    onSuccess: data => onCreated(data),
  });

  /* READ */
  const read = useServiceDetails(id!, { enabled: !!id });

  /* UPDATE */
  const update = useServiceUpdate({
    meta: { notifySuccess: 'common.notify.update_success' },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<Service> | undefined
  >(undefined);

  /* DELETE */
  const remove = useServiceDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
    onSuccess: () => onDeleted(),
  });

  const handleUpdate = React.useCallback<ServiceCRUDContextProps['update']>(
    (name, value, payload) => {
      if (!read.data?.id) return;
      setEditingFieldName(name);
      update.mutate(
        payload
          ? { id: read.data.id, ...payload }
          : { id: read.data.id, [name]: value },
        { onSettled: () => setEditingFieldName(undefined) },
      );
    },
    [read.data, update],
  );

  const handleDelete = async () => {
    if (!read.data?.id || !canDelete) return;
    const confirmed = await confirm({
      title: t('registry.service.deleteConfirm.title'),
      description: t('registry.service.deleteConfirm.description'),
      content: <ServiceDeleteConfirmContent service={read.data} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });
    if (confirmed) remove.mutate(read.data.id);
  };

  const onSubmit: SubmitHandler<Service> = React.useCallback(
    data => {
      if (mode !== 'CREATE') return;
      create.mutate(transformCreateData(data));
    },
    [create, mode],
  );
  const onInvalid: SubmitErrorHandler<Service> = React.useCallback(e => {
    console.error(e);
    notify.error('validation.form_invalid');
  }, []);

  React.useEffect(() => {
    if (read.data) form.reset(read.data);
  }, [form, read.data]);

  const loading = mode !== 'CREATE' && (read.isPending || !read.data);
  const inlineEdit = mode !== 'CREATE' && !!read.data?.id && canUpdate;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ServiceCRUDContext.Provider
      value={{
        ...defaultValue,
        mode,
        inlineEdit,
        form,
        data: read.data,
        createLoading: create.isPending,
        readLoading: read.isFetching,
        updateLoading: update.isPending,
        deleteLoading: remove.isPending,
        update: handleUpdate,
        editingFieldName,
        remove: handleDelete,
      }}
    >
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex h-full flex-col"
      >
        <div className="flex items-center justify-between gap-2 border-b bg-muted/20 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Badge
              variant="outline"
              className="shrink-0 border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400"
            >
              {t('registry.service.badge')}
            </Badge>
            <div className="min-w-0 truncate font-semibold">
              {mode === 'CREATE' ? (
                t('registry.service.page.create')
              ) : (
                <>
                  <span>{read.data?.name}</span>{' '}
                  <span className="font-normal text-muted-foreground">
                    {read.data?.serviceCode}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {mode === 'CREATE' && (
              <Button
                type="submit"
                size="sm"
                loading={create.isPending}
                icon={<Plus />}
              >
                {t('common.control.create')}
              </Button>
            )}
            {mode !== 'CREATE' && canDelete && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                loading={remove.isPending}
                icon={<Trash2 />}
                onClick={handleDelete}
              >
                {t('common.control.delete')}
              </Button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          <ServiceBasic />
          {mode !== 'CREATE' && read.data?.id && (
            <ServiceLinkedApps serviceId={read.data.id} />
          )}
        </div>
      </form>
    </ServiceCRUDContext.Provider>
  );
}
