import React from 'react';
import { useTranslations } from 'next-intl';
import { useEmployeeCRUDContext } from '../../context';
import { useQualificationColumns } from './columns';
import QualificationEditorFields from './editor-fields';
import formValidateResolver from './form-validate-resolver';
import transformCreateData from './transform-create-data';
import { useFormValidateResolver } from '@/core/form';
import type { Employee } from '@/modules/employee/types/employee';
import type { EmployeeQualification } from '@/modules/employee/types/employee-qualification';
import FieldInputArrayTable from '@/shared/components/form/field-input-array-table';
import type { CRUDMode } from '@/shared/types/crud';
import { createTempId, getCRUDDialogTitle } from '@/shared/utils';

export default function EmployeeQualifications() {
  const t = useTranslations();

  const {
    mode,
    inlineEdit,
    form,
    data: employee,
    updateLoading,
    update,
    editingFieldName,
  } = useEmployeeCRUDContext();

  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';
  const resolver = useFormValidateResolver(formValidateResolver);
  const columns = useQualificationColumns();

  const createDefaultRow = React.useCallback(
    (): EmployeeQualification => ({
      id: createTempId(),
      employeeId: employee?.id ?? '',
    }),
    [employee?.id],
  );

  const getDialogTitle = React.useCallback(
    (dialogMode: CRUDMode) =>
      getCRUDDialogTitle(
        t,
        dialogMode,
        t('employee.sections.qualifications.title'),
      ),
    [t],
  );

  return (
    <FieldInputArrayTable<
      EmployeeQualification,
      Employee,
      unknown,
      Employee,
      'qualifications',
      EmployeeQualification[] | undefined
    >
      label={t('employee.sections.qualifications.title')}
      form={form}
      name="qualifications"
      mode={fieldMode}
      loading={updateLoading && editingFieldName === 'qualifications'}
      inlineEdit={inlineEdit}
      onInlineSave={(name, value) => update(name, transformCreateData(value))}
      clearable
      columns={columns}
      createDefaultRow={createDefaultRow}
      rowFormOptions={{ resolver }}
      getRowKey={(row, index) => row.id || String(index)}
      getDialogTitle={getDialogTitle}
      getDeleteDescription={row => row.institution}
      renderEditor={QualificationEditorFields}
    />
  );
}
