'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { FieldPath, useForm } from 'react-hook-form';
import {
  GeneralSettingContext,
  GeneralSettingContextProps,
  defaultValue,
} from './context';
import formValidateResolver from './form-validate-resolver';
import GeneralSettingBasic from './sections/general-basic';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useFormValidateResolver } from '@/core/form';
import { useGeneralSettingUpdate } from '@/modules/settings/services/general.mutation';
import { useGeneralSetting } from '@/modules/settings/services/general.queries';
import { GeneralSetting } from '@/modules/settings/types/general';

export default function GeneralSettingForm() {
  const canUpdate = useHasPermissions('PLM.SETTINGS.GENERAL.UPDATE');

  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<GeneralSetting>({
    resolver,
    reValidateMode: 'onSubmit',
  });

  const read = useGeneralSetting();
  const update = useGeneralSettingUpdate({
    meta: { notifySuccess: 'common.notify.update_success' },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<GeneralSetting> | undefined
  >(undefined);

  const handleUpdate = React.useCallback<GeneralSettingContextProps['update']>(
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
    <GeneralSettingContext.Provider
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
      <GeneralSettingBasic />
    </GeneralSettingContext.Provider>
  );
}
