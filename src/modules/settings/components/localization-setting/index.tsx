'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { FieldPath, useForm } from 'react-hook-form';
import {
  LocalizationSettingContext,
  LocalizationSettingContextProps,
  defaultValue,
} from './context';
import formValidateResolver from './form-validate-resolver';
import LocalizationSettingBasic from './sections/localization-basic';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useFormValidateResolver } from '@/core/form';
import { useLocalizationSettingUpdate } from '@/modules/settings/services/localization.mutation';
import { useLocalizationSetting } from '@/modules/settings/services/localization.queries';
import { LocalizationSetting } from '@/modules/settings/types/localization';

export default function LocalizationSettingForm() {
  const canUpdate = useHasPermissions('PLM.SETTINGS.LOCALIZATION.UPDATE');

  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<LocalizationSetting>({
    resolver,
    reValidateMode: 'onSubmit',
  });

  const read = useLocalizationSetting();
  const update = useLocalizationSettingUpdate({
    meta: { notifySuccess: 'common.notify.update_success' },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<LocalizationSetting> | undefined
  >(undefined);

  const handleUpdate = React.useCallback<
    LocalizationSettingContextProps['update']
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
    <LocalizationSettingContext.Provider
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
      <LocalizationSettingBasic />
    </LocalizationSettingContext.Provider>
  );
}
