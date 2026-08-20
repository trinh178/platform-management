'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { ResourceCRUDContext, defaultValue } from '../resource-crud/context';
import formValidateResolver from '../resource-crud/form-validate-resolver';
import ResourceBasic from '../resource-crud/sections/resource-basic';
import transformCreateData from '../resource-crud/transform-create-data';
import { useFormValidateResolver } from '@/core/form';
import { notify } from '@/core/notification';
import { useResourceCreate } from '@/modules/registry/services/resource.mutation';
import { Resource } from '@/modules/registry/types/resource';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

type ResourceCreateDialogProps = React.ComponentProps<typeof Dialog> & {
  defaultDomainId?: string;
  onCreated: (resource: Resource) => void;
};

export default function ResourceCreateDialog({
  defaultDomainId,
  onCreated,
  ...props
}: ResourceCreateDialogProps) {
  const t = useTranslations();

  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<Resource>({
    resolver,
    reValidateMode: 'onSubmit',
    defaultValues: { domainId: defaultDomainId },
  });

  const create = useResourceCreate({
    meta: { notifySuccess: 'common.notify.create_success' },
    onSuccess: data => {
      props.onOpenChange?.(false);
      onCreated(data);
    },
  });

  const onSubmit: SubmitHandler<Resource> = React.useCallback(
    data => create.mutate(transformCreateData(data)),
    [create],
  );
  const onInvalid: SubmitErrorHandler<Resource> = React.useCallback(() => {
    notify.error('validation.form_invalid');
  }, []);

  React.useEffect(() => {
    if (props.open) form.reset({ domainId: defaultDomainId });
  }, [props.open, defaultDomainId, form]);

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
            {t('registry.resource.page.create')}
          </DialogTitle>
        </DialogHeader>

        <ResourceCRUDContext.Provider
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
              <ResourceBasic />
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
        </ResourceCRUDContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
