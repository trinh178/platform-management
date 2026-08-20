'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { FieldPath, useForm } from 'react-hook-form';
import {
  BrandingSettingContext,
  BrandingSettingContextProps,
  defaultValue,
} from './context';
import formValidateResolver from './form-validate-resolver';
import BrandingSettingBasic from './sections/branding-basic';
import { useHasPermissions } from '@/core/auth/useHasPermissions';
import { useFormValidateResolver } from '@/core/form';
import { useBrandingSettingUpdate } from '@/modules/settings/services/branding.mutation';
import { useBrandingSetting } from '@/modules/settings/services/branding.queries';
import { BrandingSetting } from '@/modules/settings/types/branding';

export default function BrandingSettingForm() {
  const canUpdate = useHasPermissions('PLM.SETTINGS.BRANDING.UPDATE');

  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<BrandingSetting>({
    resolver,
    reValidateMode: 'onSubmit',
  });

  const read = useBrandingSetting();
  const update = useBrandingSettingUpdate({
    meta: { notifySuccess: 'common.notify.update_success' },
  });
  const [editingFieldName, setEditingFieldName] = React.useState<
    FieldPath<BrandingSetting> | undefined
  >(undefined);

  const handleUpdate = React.useCallback<BrandingSettingContextProps['update']>(
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
    <BrandingSettingContext.Provider
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
      <BrandingSettingBasic />
    </BrandingSettingContext.Provider>
  );
}
