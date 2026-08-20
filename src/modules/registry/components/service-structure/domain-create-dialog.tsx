'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { DomainCRUDContext, defaultValue } from '../domain-crud/context';
import formValidateResolver from '../domain-crud/form-validate-resolver';
import DomainBasic from '../domain-crud/sections/domain-basic';
import transformCreateData from '../domain-crud/transform-create-data';
import { useFormValidateResolver } from '@/core/form';
import { notify } from '@/core/notification';
import { useDomainCreate } from '@/modules/registry/services/domain.mutation';
import { Domain } from '@/modules/registry/types/domain';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

type DomainCreateDialogProps = React.ComponentProps<typeof Dialog> & {
  defaultServiceId?: string;
  onCreated: (domain: Domain) => void;
};

export default function DomainCreateDialog({
  defaultServiceId,
  onCreated,
  ...props
}: DomainCreateDialogProps) {
  const t = useTranslations();

  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Domain>({
    resolver,
    reValidateMode: 'onSubmit',
    defaultValues: { serviceId: defaultServiceId },
  });

  const create = useDomainCreate({
    meta: { notifySuccess: 'common.notify.create_success' },
    onSuccess: data => {
      props.onOpenChange?.(false);
      onCreated(data);
    },
  });

  const onSubmit: SubmitHandler<Domain> = React.useCallback(
    data => create.mutate(transformCreateData(data)),
    [create],
  );
  const onInvalid: SubmitErrorHandler<Domain> = React.useCallback(() => {
    notify.error('validation.form_invalid');
  }, []);

  React.useEffect(() => {
    if (props.open) form.reset({ serviceId: defaultServiceId });
  }, [props.open, defaultServiceId, form]);

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
            {t('registry.domain.page.create')}
          </DialogTitle>
        </DialogHeader>

        <DomainCRUDContext.Provider
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
              <DomainBasic />
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
        </DomainCRUDContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
