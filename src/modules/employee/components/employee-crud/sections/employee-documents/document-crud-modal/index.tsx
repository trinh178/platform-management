import React from 'react';
import { useTranslations } from 'next-intl';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { useEmployeeCRUDContext } from '../../../context';
import formValidateResolver from './form-validate-resolver';
import transformCreateData from './transform-create-data';
import transformUpdateData from './transform-update-data';
import { useFormValidateResolver } from '@/core/form';
import { notify } from '@/core/notification';
import {
  useEmployeeDocumentCreate,
  useEmployeeDocumentRemove,
  useEmployeeDocumentUpdate,
} from '@/modules/employee/services/employee-documents.mutations';
import type { EmployeeDocument } from '@/modules/employee/types/employee-document';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { FieldGroup } from '@/shared/components/ui/field';
import type { CRUDMode } from '@/shared/types/crud';
import { getCRUDActionLabel, getCRUDDialogTitle } from '@/shared/utils';

interface DocumentCRUDModalProps extends React.ComponentProps<typeof Dialog> {
  mode: CRUDMode;
  data?: EmployeeDocument;
}

export default function DocumentCRUDModal({
  mode,
  data,
  ...props
}: DocumentCRUDModalProps) {
  const t = useTranslations();
  const { data: employee } = useEmployeeCRUDContext();
  const employeeId = employee?.id;

  /* Label/Title */
  const actionLabel = React.useMemo(
    () => getCRUDActionLabel(t, mode),
    [mode, t],
  );
  const dialogTitle = React.useMemo(
    () => getCRUDDialogTitle(t, mode, t('employee.sections.documents.title')),
    [mode, t],
  );

  /* Form */
  const resolver = useFormValidateResolver(formValidateResolver);
  const form = useForm<EmployeeDocument>({
    resolver,
    reValidateMode: 'onSubmit',
  });

  /* CREATE */
  const create = useEmployeeDocumentCreate({
    meta: {
      notifySuccess: 'common.notify.create_success',
    },
    onSuccess: () => props.onOpenChange?.(false),
  });

  /* READ */
  // VÃ¬ cÃ³ Ã­t fields nÃªn data Ä‘Æ°á»£c truyá»n Ä‘áº§y Ä‘á»§ qua props Ä‘Æ°á»£c láº¥y tá»« list, khÃ´ng cáº§n gá»i api details Ä‘á»ƒ láº¥y

  /* UPDATE */
  const update = useEmployeeDocumentUpdate({
    meta: {
      notifySuccess: 'common.notify.update_success',
    },
    onSuccess: () => props.onOpenChange?.(false),
  });

  /* DELETE */
  const remove = useEmployeeDocumentRemove({
    meta: {
      notifySuccess: 'common.notify.delete_success',
    },
    onSuccess: () => props.onOpenChange?.(false),
  });

  /* Form handlers */
  const onSubmit: SubmitHandler<EmployeeDocument> = React.useCallback(
    data => {
      if (!employeeId) return;

      if (mode === 'CREATE') {
        create.mutate(transformCreateData(data));
      } else if (mode === 'UPDATE') {
        update.mutate(transformUpdateData(data));
      } else if (mode === 'DELETE') {
        remove.mutate({
          employeeId,
          id: data.id,
        });
      }
    },
    [create, employeeId, mode, remove, update],
  );
  const onInvalid: SubmitErrorHandler<EmployeeDocument> = React.useCallback(
    () => notify.error('validation.form_invalid'),
    [],
  );

  /* Form reset */
  React.useEffect(() => {
    form.reset(
      data
        ? data
        : employeeId
          ? {
              employeeId,
            }
          : undefined,
    );
  }, [data, employeeId, form, props.open]);

  /* Input field state */
  const disabled = create.isPending || update.isPending || remove.isPending;
  const fieldMode = mode === 'CREATE' || mode === 'UPDATE' ? 'EDIT' : 'VIEW';

  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="uppercase">{dialogTitle}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.stopPropagation();
            form.handleSubmit(onSubmit, onInvalid)(e);
          }}
        >
          <FieldGroup>
            <FieldInputText
              label={t('employee.fields.document.name')}
              placeholder={t('employee.fields.document.name')}
              form={form}
              name="name"
              mode={fieldMode}
              disabled={disabled}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.document.fileName')}
              placeholder={t('employee.fields.document.fileName')}
              form={form}
              name="fileName"
              mode={fieldMode}
              disabled={disabled}
              clearable
            />

            <FieldInputTextArea
              label={t('employee.fields.document.note')}
              placeholder={t('employee.fields.document.note')}
              form={form}
              name="note"
              mode={fieldMode}
              disabled={disabled}
              clearable
            />
          </FieldGroup>

          <DialogFooter className="mt-4">
            <Button
              className="w-26"
              type="submit"
              loading={disabled}
              variant={mode === 'DELETE' ? 'destructive' : 'default'}
            >
              {actionLabel}
            </Button>
            <Button
              variant="outline"
              className="w-26"
              type="button"
              onClick={() => props.onOpenChange?.(false)}
              disabled={disabled}
            >
              {t('common.control.cancel')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
