'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { ServiceCRUDContext, defaultValue } from '../service-crud/context';
import formValidateResolver from '../service-crud/form-validate-resolver';
import ServiceBasic from '../service-crud/sections/service-basic';
import transformCreateData from '../service-crud/transform-create-data';
import { useFormValidateResolver } from '@/core/form';
import { notify } from '@/core/notification';
import { useServiceCreate } from '@/modules/registry/services/service.mutation';
import { Service } from '@/modules/registry/types/service';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

type ServiceCreateDialogProps = React.ComponentProps<typeof Dialog> & {
  onCreated: (service: Service) => void;
};

export default function ServiceCreateDialog({
  onCreated,
  ...props
}: ServiceCreateDialogProps) {
  const t = useTranslations();

  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Service>({
    resolver,
    reValidateMode: 'onSubmit',
    defaultValues: { status: 'Active' },
  });

  const create = useServiceCreate({
    meta: { notifySuccess: 'common.notify.create_success' },
    onSuccess: data => {
      props.onOpenChange?.(false);
      onCreated(data);
    },
  });

  const onSubmit: SubmitHandler<Service> = React.useCallback(
    data => create.mutate(transformCreateData(data)),
    [create],
  );
  const onInvalid: SubmitErrorHandler<Service> = React.useCallback(() => {
    notify.error('validation.form_invalid');
  }, []);

  React.useEffect(() => {
    if (props.open) form.reset({ status: 'Active' });
  }, [props.open, form]);

  return (
    <Dialog {...props}>
      <DialogContent
        className="sm:max-w-2xl"
        showCloseButton={false}
        aria-describedby={undefined}
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="uppercase">
            {t('registry.service.page.create')}
          </DialogTitle>
        </DialogHeader>

        <ServiceCRUDContext.Provider
          value={{
            ...defaultValue,
            mode: 'CREATE',
            form,
          }}
        >
          <form
            onSubmit={e => {
              e.stopPropagation();
              form.handleSubmit(onSubmit, onInvalid)(e);
            }}
          >
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <ServiceBasic />
            </div>

            <DialogFooter className="mt-4">
              <Button className="w-26" type="submit" loading={create.isPending}>
                {t('common.control.create')}
              </Button>
              <Button
                variant="outline"
                className="w-26"
                type="button"
                onClick={() => props.onOpenChange?.(false)}
                disabled={create.isPending}
              >
                {t('common.control.cancel')}
              </Button>
            </DialogFooter>
          </form>
        </ServiceCRUDContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
