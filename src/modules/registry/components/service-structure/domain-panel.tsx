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
  DomainCRUDContext,
  DomainCRUDContextProps,
  defaultValue,
} from '../domain-crud/context';
import formValidateResolver from '../domain-crud/form-validate-resolver';
import DomainBasic from '../domain-crud/sections/domain-basic';
import transformCreateData from '../domain-crud/transform-create-data';
import DomainDeleteConfirmContent from '../domain-delete-confirm-content';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useConfirm } from '@/core/confirmation/confirm-provider';
import { useFormValidateResolver } from '@/core/form';
import { notify } from '@/core/notification';
import {
  useDomainCreate,
  useDomainDelete,
  useDomainUpdate,
} from '@/modules/registry/services/domain.mutation';
import { useDomainDetails } from '@/modules/registry/services/domain.queries';
import { Domain } from '@/modules/registry/types/domain';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

interface DomainPanelProps {
  id?: string;
  defaultServiceId?: string;
  onCreated: (domain: Domain) => void;
  onDeleted: () => void;
}

export default function DomainPanel({
  id,
  defaultServiceId,
  onCreated,
  onDeleted,
}: DomainPanelProps) {
  const t = useTranslations();
  const confirm = useConfirm();
  const mode = id ? 'READ' : 'CREATE';
  const canUpdate = useHasPermissions('PLM.REGISTRY.DOMAIN.UPDATE');
  const canDelete = useHasPermissions('PLM.REGISTRY.DOMAIN.DELETE');

  /* Form */
  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Domain>({
    resolver,
    reValidateMode: 'onSubmit',
    defaultValues: { serviceId: defaultServiceId },
  });

  /* CREATE */
  const create = useDomainCreate({
    meta: { notifySuccess: 'common.notify.create_success' },
    onSuccess: data => onCreated(data),
  });

  /* READ */
  const read = useDomainDetails(id!, { enabled: !!id });

  /* UPDATE */
  const update = useDomainUpdate({
    meta: { notifySuccess: 'common.notify.update_success' },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<Domain> | undefined
  >(undefined);

  /* DELETE */
  const remove = useDomainDelete({
    meta: { notifySuccess: 'common.notify.delete_success' },
    onSuccess: () => onDeleted(),
  });

  const handleUpdate = React.useCallback<DomainCRUDContextProps['update']>(
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
      title: t('registry.domain.deleteConfirm.title'),
      description: t('registry.domain.deleteConfirm.description'),
      content: <DomainDeleteConfirmContent domain={read.data} />,
      variant: 'danger',
      confirmText: t('common.control.delete'),
      cancelText: t('common.control.cancel'),
    });
    if (confirmed) remove.mutate(read.data.id);
  };

  const onSubmit: SubmitHandler<Domain> = React.useCallback(
    data => {
      if (mode !== 'CREATE') return;
      create.mutate(transformCreateData(data));
    },
    [create, mode],
  );
  const onInvalid: SubmitErrorHandler<Domain> = React.useCallback(e => {
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
    <DomainCRUDContext.Provider
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
              className="shrink-0 border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-400"
            >
              {t('registry.domain.badge')}
            </Badge>
            <div className="min-w-0 truncate font-semibold">
              {mode === 'CREATE' ? (
                t('registry.domain.page.create')
              ) : (
                <>
                  <span>{read.data?.name}</span>{' '}
                  <span className="font-normal text-muted-foreground">
                    {read.data?.domainCode}
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
          <DomainBasic />
        </div>
      </form>
    </DomainCRUDContext.Provider>
  );
}
