import React from 'react';
import { unflatten } from 'flat';
import {
  FieldPath,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import routePaths from '../../route-paths';
import {
  useEmployeeCreate,
  useEmployeeDelete,
  useEmployeeUpdate,
} from '../../services/employee.mutation';
import { useEmployeeDetails } from '../../services/employee.queries';
import { Employee } from '../../types/employee';
import ContentForm from './content-form';
import ContentHeader from './content-header';
import {
  EmployeeCRUDContext,
  EmployeeCRUDContextProps,
  defaultValue,
} from './context';
import EmployeeCreatedDialog from './employee-created-dialog';
import formValidateResolver from './form-validate-resolver';
import transformCreateData from './transform-create-data';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useFormValidateResolver } from '@/core/form';
import { usePageContentContext } from '@/core/layout/page-content-context';
import { notify } from '@/core/notification';
import { useAppRouter } from '@/core/router/next';
import { CRUDMode } from '@/shared/types/crud';

interface EmployeeCRUDProps {
  defaultMode: CRUDMode;
  id?: string;
}

export default function EmployeeCRUD({ defaultMode, id }: EmployeeCRUDProps) {
  const router = useAppRouter();
  const [mode, setMode] = React.useState<CRUDMode>(defaultMode);
  const canUpdate = useHasPermissions('HRM_EM.EMPLOYEE.EMPLOYEE.UPDATE');

  /* Form */
  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Employee>({
    resolver,
    reValidateMode: 'onSubmit',
  });

  /* CREATE */
  const create = useEmployeeCreate({
    meta: {
      showLoading: 'SPINNER',
      notifySuccess: 'common.notify.create_success',
    },
  });

  /* READ */
  const read = useEmployeeDetails(id!, {
    enabled: !!id,
  });

  /* UPDATE */
  const update = useEmployeeUpdate({
    meta: {
      notifySuccess: 'common.notify.update_success',
    },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<Employee> | undefined
  >(undefined);

  /* DELETE */
  const remove = useEmployeeDelete({
    meta: {
      notifySuccess: 'common.notify.delete_success',
    },
    onSuccess() {
      router.push(routePaths.employees);
    },
  });

  /* Context actions */
  const handleUpdate = React.useCallback<EmployeeCRUDContextProps['update']>(
    (name, value, payload) => {
      if (!read.data?.id) return;
      setEditingFieldName(name);
      update.mutate(
        payload
          ? { id: read.data.id, ...payload }
          : unflatten({ id: read.data.id, [name]: value }),
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
  const onSubmit: SubmitHandler<Employee> = React.useCallback(
    data => {
      if (mode !== 'CREATE') return;
      create.mutate(transformCreateData(data));
    },
    [create, mode],
  );
  const onInvalid: SubmitErrorHandler<Employee> = React.useCallback(e => {
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
    <EmployeeCRUDContext.Provider
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

      {create.isSuccess && create.data && (
        <EmployeeCreatedDialog
          employee={create.data}
          onAddOnboarding={() =>
            router.push('/onboarding/create', {
              params: {
                id: create.data.id,
              },
            })
          }
          onCreateContract={() =>
            router.push('/contracts/create', {
              params: {
                employeeId: create.data.id,
              },
            })
          }
          onViewEmployee={() =>
            router.push('/employees/details', {
              params: {
                id: create.data.id,
              },
            })
          }
          onClose={() => router.push('/employees')}
        />
      )}
    </EmployeeCRUDContext.Provider>
  );
}
