import React from 'react';
import {
  FieldPath,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import routePaths from '../../route-paths';
import {
  useAppCreate,
  useAppDelete,
  useAppUpdate,
} from '../../services/app.mutation';
import { useAppDetails } from '../../services/app.queries';
import { App } from '../../types/app';
import ContentForm from './content-form';
import ContentHeader from './content-header';
import { AppCRUDContext, AppCRUDContextProps, defaultValue } from './context';
import formValidateResolver from './form-validate-resolver';
import transformCreateData from './transform-create-data';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useFormValidateResolver } from '@/core/form';
import { usePageContentContext } from '@/core/layout/page-content-context';
import { notify } from '@/core/notification';
import { useAppRouter } from '@/core/router/next';
import { CRUDMode } from '@/shared/types/crud';

interface AppCRUDProps {
  defaultMode: CRUDMode;
  id?: string;
}

export default function AppCRUD({ defaultMode, id }: AppCRUDProps) {
  const router = useAppRouter();
  const [mode, setMode] = React.useState<CRUDMode>(defaultMode);
  const canUpdate = useHasPermissions('PLM.REGISTRY.APP.UPDATE');

  /* Form */
  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<App>({
    resolver,
    reValidateMode: 'onSubmit',
    defaultValues: { status: 'Active' },
  });

  /* CREATE */
  const create = useAppCreate({
    meta: {
      showLoading: 'SPINNER',
      notifySuccess: 'common.notify.create_success',
    },
    onSuccess(data) {
      router.push(routePaths.appsDetails, {
        params: { id: data.id, mode: 'READ' },
      });
    },
  });

  /* READ */
  const read = useAppDetails(id!, {
    enabled: !!id,
  });

  /* UPDATE */
  const update = useAppUpdate({
    meta: {
      notifySuccess: 'common.notify.update_success',
    },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<App> | undefined
  >(undefined);

  /* DELETE */
  const remove = useAppDelete({
    meta: {
      notifySuccess: 'common.notify.delete_success',
    },
    onSuccess() {
      router.push(routePaths.apps);
    },
  });

  /* Context actions */
  const handleUpdate = React.useCallback<AppCRUDContextProps['update']>(
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
  const onSubmit: SubmitHandler<App> = React.useCallback(
    data => {
      if (mode !== 'CREATE') return;
      create.mutate(transformCreateData(data));
    },
    [create, mode],
  );
  const onInvalid: SubmitErrorHandler<App> = React.useCallback(e => {
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
    <AppCRUDContext.Provider
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
    </AppCRUDContext.Provider>
  );
}
