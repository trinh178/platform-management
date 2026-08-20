'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import formValidateResolver, {
  AssignFormValues,
} from './form-validate-resolver';
import { useFormValidateResolver } from '@/core/form';
import { notify } from '@/core/notification';
import queryClient from '@/core/query/query-client';
import { useAppServiceMappingAssign } from '@/modules/registry/services/app-service-mapping.mutation';
import {
  useAppDetails,
  useAppOptions,
} from '@/modules/registry/services/app.queries';
import {
  useServiceDetails,
  useServiceOptions,
} from '@/modules/registry/services/service.queries';
import FieldInputAsyncSelect from '@/shared/components/form/field-input-async-select';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FieldGroup } from '@/shared/components/ui/field';

type AssignDialogProps = React.ComponentProps<typeof Dialog> & {
  defaultAppId?: string;
  defaultServiceId?: string;
};

export default function AssignDialog({
  defaultAppId,
  defaultServiceId,
  ...props
}: AssignDialogProps) {
  const t = useTranslations();

  /* Form */
  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<AssignFormValues>({
    resolver,
    reValidateMode: 'onSubmit',
  });

  /* ASSIGN */
  const assign = useAppServiceMappingAssign({
    meta: { notifySuccess: 'common.notify.create_success' },
    onSuccess: () => props.onOpenChange?.(false),
  });

  /* Form handlers */
  const onSubmit: SubmitHandler<AssignFormValues> = React.useCallback(
    data => {
      assign.mutate(data);
    },
    [assign],
  );
  const onInvalid: SubmitErrorHandler<AssignFormValues> = React.useCallback(
    () => notify.error('validation.form_invalid'),
    [],
  );

  /* Form reset khi mở dialog — giữ sẵn phía cố định (App hoặc Service) nếu có */
  React.useEffect(() => {
    if (props.open)
      form.reset({ appId: defaultAppId, serviceId: defaultServiceId });
  }, [props.open, defaultAppId, defaultServiceId, form]);

  const loadAppOptions = React.useCallback(async (keyword: string) => {
    const items = await useAppOptions.query(queryClient, keyword);
    return items.map(a => ({ label: `${a.appCode} - ${a.name}`, value: a.id }));
  }, []);
  const loadAppOption = React.useCallback(async (id: string) => {
    const app = await useAppDetails.query(queryClient, id);
    return { label: `${app.appCode} - ${app.name}`, value: app.id };
  }, []);

  const loadServiceOptions = React.useCallback(async (keyword: string) => {
    const items = await useServiceOptions.query(queryClient, keyword);
    return items.map(s => ({
      label: `${s.serviceCode} - ${s.name}`,
      value: s.id,
    }));
  }, []);
  const loadServiceOption = React.useCallback(async (id: string) => {
    const service = await useServiceDetails.query(queryClient, id);
    return {
      label: `${service.serviceCode} - ${service.name}`,
      value: service.id,
    };
  }, []);

  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="uppercase">
            {t('registry.appServiceMapping.assignDialog.title')}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.stopPropagation();
            form.handleSubmit(onSubmit, onInvalid)(e);
          }}
        >
          <FieldGroup>
            <FieldInputAsyncSelect
              label={t('registry.appServiceMapping.fields.appId')}
              placeholder={t('registry.appServiceMapping.fields.appId')}
              searchPlaceholder={t('common.control.search')}
              required
              form={form}
              name="appId"
              disabled={assign.isPending || !!defaultAppId}
              loadOptions={loadAppOptions}
              loadOption={loadAppOption}
              clearable
            />

            <FieldInputAsyncSelect
              label={t('registry.appServiceMapping.fields.serviceId')}
              placeholder={t('registry.appServiceMapping.fields.serviceId')}
              searchPlaceholder={t('common.control.search')}
              required
              form={form}
              name="serviceId"
              disabled={assign.isPending || !!defaultServiceId}
              loadOptions={loadServiceOptions}
              loadOption={loadServiceOption}
              clearable
            />
          </FieldGroup>

          <DialogFooter className="mt-4">
            <Button className="w-26" type="submit" loading={assign.isPending}>
              {t('registry.appServiceMapping.controls.assign')}
            </Button>
            <Button
              variant="outline"
              className="w-26"
              type="button"
              onClick={() => props.onOpenChange?.(false)}
              disabled={assign.isPending}
            >
              {t('common.control.cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
