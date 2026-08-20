'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { FieldPath, useForm } from 'react-hook-form';
import {
  OrganizationSettingContext,
  OrganizationSettingContextProps,
  defaultValue,
} from './context';
import formValidateResolver from './form-validate-resolver';
import OrganizationSettingBasic from './sections/organization-basic';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useFormValidateResolver } from '@/core/form';
import { useOrganizationSettingUpdate } from '@/modules/settings/services/organization.mutation';
import { useOrganizationSetting } from '@/modules/settings/services/organization.queries';
import { OrganizationSetting } from '@/modules/settings/types/organization';

export default function OrganizationSettingForm() {
  const canUpdate = useHasPermissions('PLM.SETTINGS.ORGANIZATION.UPDATE');

  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<OrganizationSetting>({
    resolver,
    reValidateMode: 'onSubmit',
  });

  const read = useOrganizationSetting();
  const update = useOrganizationSettingUpdate({
    meta: { notifySuccess: 'common.notify.update_success' },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<OrganizationSetting> | undefined
  >(undefined);

  const handleUpdate = React.useCallback<
    OrganizationSettingContextProps['update']
  >(
    (name, value) => {
      setEditingFieldName(name);
      update.mutate(
        { [name]: value },
        { onSettled: () => setEditingFieldName(undefined) },
      );
    },
    [update],
  );

  React.useEffect(() => {
    if (read.data) form.reset(read.data);
  }, [form, read.data]);

  const loading = read.isPending || !read.data;
  const inlineEdit = !!read.data && canUpdate;

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <OrganizationSettingContext.Provider
      value={{
        ...defaultValue,
        inlineEdit,
        form,
        data: read.data,
        readLoading: read.isFetching,
        updateLoading: update.isPending,
        update: handleUpdate,
        editingFieldName,
      }}
    >
      <OrganizationSettingBasic />
    </OrganizationSettingContext.Provider>
  );
}
