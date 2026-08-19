import { useTranslations } from 'next-intl';
import { CONST_QUALIFICATION_TYPE } from '@/modules/employee/constants/employee-qualification';
import type { EmployeeQualification } from '@/modules/employee/types/employee-qualification';
import type { FieldInputArrayTableEditorProps } from '@/shared/components/form/field-input-array-table';
import FieldInputConstant from '@/shared/components/form/field-input-constant';
import FieldInputDate from '@/shared/components/form/field-input-date';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import { FieldGroup } from '@/shared/components/ui/field';

export default function QualificationEditorFields({
  form,
  mode,
  disabled,
}: FieldInputArrayTableEditorProps<EmployeeQualification>) {
  const t = useTranslations();

  return (
    <FieldGroup>
      <FieldInputConstant
        label={t('employee.fields.qualification.type')}
        placeholder={t('employee.fields.qualification.type')}
        form={form}
        name="type"
        mode={mode}
        disabled={disabled}
        constOptions={CONST_QUALIFICATION_TYPE}
        clearable
      />

      <FieldInputText
        label={t('employee.fields.qualification.institution')}
        placeholder={t('employee.fields.qualification.institution')}
        form={form}
        name="institution"
        mode={mode}
        disabled={disabled}
        clearable
      />

      <FieldInputText
        label={t('employee.fields.qualification.major')}
        placeholder={t('employee.fields.qualification.major')}
        form={form}
        name="major"
        mode={mode}
        disabled={disabled}
        clearable
      />

      <FieldInputText
        label={t('employee.fields.qualification.level')}
        placeholder={t('employee.fields.qualification.level')}
        form={form}
        name="level"
        mode={mode}
        disabled={disabled}
        clearable
      />

      <FieldInputDate
        label={t('employee.fields.qualification.issueDate')}
        placeholder={t('employee.fields.qualification.issueDate')}
        form={form}
        name="issueDate"
        mode={mode}
        disabled={disabled}
        clearable
      />

      <FieldInputDate
        label={t('employee.fields.qualification.expiryDate')}
        placeholder={t('employee.fields.qualification.expiryDate')}
        form={form}
        name="expiryDate"
        mode={mode}
        disabled={disabled}
        clearable
      />

      <FieldInputTextArea
        label={t('employee.fields.qualification.note')}
        placeholder={t('employee.fields.qualification.note')}
        form={form}
        name="note"
        mode={mode}
        disabled={disabled}
        clearable
      />
    </FieldGroup>
  );
}
