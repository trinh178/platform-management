import React from 'react';
import {
  FieldPath,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import routePaths from '../../route-paths';
import {
  useDomainCreate,
  useDomainDelete,
  useDomainUpdate,
} from '../../services/domain.mutation';
import { useDomainDetails } from '../../services/domain.queries';
import { Domain } from '../../types/domain';
import ContentForm from './content-form';
import ContentHeader from './content-header';
import {
  DomainCRUDContext,
  DomainCRUDContextProps,
  defaultValue,
} from './context';
import formValidateResolver from './form-validate-resolver';
import transformCreateData from './transform-create-data';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useFormValidateResolver } from '@/core/form';
import { usePageContentContext } from '@/core/layout/page-content-context';
import { notify } from '@/core/notification';
import { useAppRouter } from '@/core/router/next';
import { CRUDMode } from '@/shared/types/crud';

interface DomainCRUDProps {
  defaultMode: CRUDMode;
  id?: string;
}

export default function DomainCRUD({ defaultMode, id }: DomainCRUDProps) {
  const router = useAppRouter();
  const [mode, setMode] = React.useState<CRUDMode>(defaultMode);
  const canUpdate = useHasPermissions('PLM.REGISTRY.DOMAIN.UPDATE');

  /* Form */
  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Domain>({
    resolver,
    reValidateMode: 'onSubmit',
    defaultValues: { status: 'Active' },
  });

  /* CREATE */
  const create = useDomainCreate({
    meta: {
      showLoading: 'SPINNER',
      notifySuccess: 'common.notify.create_success',
    },
    onSuccess(data) {
      router.push(routePaths.domainsDetails, {
        params: { id: data.id, mode: 'READ' },
      });
    },
  });

  /* READ */
  const read = useDomainDetails(id!, {
    enabled: !!id,
  });

  /* UPDATE */
  const update = useDomainUpdate({
    meta: {
      notifySuccess: 'common.notify.update_success',
    },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<Domain> | undefined
  >(undefined);

  /* DELETE */
  const remove = useDomainDelete({
    meta: {
      notifySuccess: 'common.notify.delete_success',
    },
    onSuccess() {
      router.push(routePaths.domains);
    },
  });

  /* Context actions */
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
  const handleRemove = React.useCallback(() => {
    if (!read.data?.id) return;
    remove.mutate(read.data.id);
  }, [read.data, remove]);

  /* Form handlers */
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

  /* Form reset */
  React.useEffect(() => {
    form.reset(read?.data); // After loading data, update the form with default values
  }, [form, read?.data]);

  /* Page loading */
  const pageLoading =
    mode !== 'CREATE' && !!id && (read.isPending || !read.data);
  const { setLoading } = usePageContentContext();
  React.useEffect(() => {
    setLoading(pageLoading);
    return () => {
      setLoading(false);
    };
  }, [pageLoading, setLoading]);

  const inlineEdit = mode !== 'CREATE' && !!read.data?.id && canUpdate;

  return (
    <DomainCRUDContext.Provider
      value={{
        ...defaultValue,
        mode,
        setMode,
        inlineEdit,
        form,
        data: read.data,

        createLoading: create.isPending,
        readLoading: read.isFetching,
        updateLoading: update.isPending,
        deleteLoading: remove.isPending,

        update: handleUpdate,
        editingFieldName,
        remove: handleRemove,
      }}
    >
      {!pageLoading && (
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <ContentHeader />
          <ContentForm />
        </form>
      )}
    </DomainCRUDContext.Provider>
  );
}
