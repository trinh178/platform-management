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
  ResourceCRUDContext,
  ResourceCRUDContextProps,
  defaultValue,
} from '../resource-crud/context';
import formValidateResolver from '../resource-crud/form-validate-resolver';
import ResourceBasic from '../resource-crud/sections/resource-basic';
import transformCreateData from '../resource-crud/transform-create-data';
import ResourceDeleteConfirmContent from '../resource-delete-confirm-content';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useFormValidateResolver } from '@/core/form';
import { notify } from '@/core/notification';
import {
  useResourceCreate,
  useResourceDelete,
  useResourceUpdate,
} from '@/modules/registry/services/resource.mutation';
import { useResourceDetails } from '@/modules/registry/services/resource.queries';
import { Resource } from '@/modules/registry/types/resource';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

interface ResourcePanelProps {
  id?: string;
  defaultDomainId?: string;
  onCreated: (resource: Resource) => void;
  onDeleted: () => void;
}

export default function ResourcePanel({
  id,
  defaultDomainId,
  onCreated,
  onDeleted,
}: ResourcePanelProps) {
  const t = useTranslations();
  const confirm = useConfirm();
  const mode = id ? 'READ' : 'CREATE';
  const canUpdate = useHasPermissions('PLM.REGISTRY.RESOURCE.UPDATE');
  const canDelete = useHasPermissions('PLM.REGISTRY.RESOURCE.DELETE');

  /* Form */
  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Resource>({
    resolver,
    reValidateMode: 'onSubmit',
    defaultValues: { domainId: defaultDomainId },
  });

  /* CREATE */
  const create = useResourceCreate({
    meta: { notifySuccess: 'common.notify.create_success' },
    onSuccess: data => onCreated(data),
  });

  /* READ */
  const read = useResourceDetails(id!, { enabled: !!id });

  /* UPDATE */
  const update = useResourceUpdate({
    meta: { notifySuccess: 'common.notify.update_success' },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<Resource> | undefined
  >(undefined);

  /* DELETE */
  const remove = useResourceDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
    onSuccess: () => onDeleted(),
  });

  const handleUpdate = React.useCallback<ResourceCRUDContextProps['update']>(
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
      title: t('registry.resource.deleteConfirm.title'),
      description: t('registry.resource.deleteConfirm.description'),
      content: <ResourceDeleteConfirmContent resource={read.data} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });
    if (confirmed) remove.mutate(read.data.id);
  };

  const onSubmit: SubmitHandler<Resource> = React.useCallback(
    data => {
      if (mode !== 'CREATE') return;
      create.mutate(transformCreateData(data));
    },
    [create, mode],
  );
  const onInvalid: SubmitErrorHandler<Resource> = React.useCallback(e => {
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
    <ResourceCRUDContext.Provider
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
              className="shrink-0 border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-400"
            >
              {t('registry.resource.badge')}
            </Badge>
            <div className="min-w-0 truncate font-semibold">
              {mode === 'CREATE' ? (
                t('registry.resource.page.create')
              ) : (
                <>
                  <span>{read.data?.name}</span>{' '}
                  <span className="font-normal text-muted-foreground">
                    {read.data?.resourceCode}
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

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <ResourceBasic />
        </div>
      </form>
    </ResourceCRUDContext.Provider>
  );
}
