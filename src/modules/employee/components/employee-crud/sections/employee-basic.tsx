import { useTranslations } from 'next-intl';
import { useEmployeeCRUDContext } from '../context';
import {
  CONST_GENDER,
  CONST_MARITAL_STATUS,
} from '@/modules/employee/constants/employee';
import { useGenerateEmployeeCode } from '@/modules/employee/services/employee.queries';
import FieldInputConstant from '@/shared/components/form/field-input-constant';
import FieldInputCountry from '@/shared/components/form/field-input-country';
import FieldInputDate from '@/shared/components/form/field-input-date';
import FieldInputGeneratedText from '@/shared/components/form/field-input-generated-text';
import FieldInputNumeric from '@/shared/components/form/field-input-numeric';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputYear from '@/shared/components/form/field-input-year';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function EmployeeBasic() {
  const t = useTranslations();

  const { form, mode, inlineEdit, updateLoading, update, editingFieldName } =
    useEmployeeCRUDContext();

  // Auto-generate employee code
  const generateEmployeeCode = useGenerateEmployeeCode(undefined, {
    enabled: false,
  });

  // Field mode
  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';

  return (
    <SectionPanel title={t('employee.sections.basic.title')}>
      <div className="space-y-4">
        {/* Basic */}
        <SubSection title={t('employee.sections.basic.general')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputGeneratedText
              label={t('employee.fields.employeeCode')}
              placeholder={t('employee.fields.employeeCode')}
              required
              form={form}
              name="employeeCode"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'employeeCode'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              getGeneratedText={async () => {
                const res = await generateEmployeeCode.refetch();
                if (res.isSuccess) {
                  return res.data.employeeCode;
                }
              }}
              autoGenerateIfEmpty
            />

            <div className="flex">
              <FieldInputText
                label={t('employee.fields.fullName')}
                placeholder={t('employee.fields.lastName')}
                required
                form={form}
                name="lastName"
                mode={fieldMode}
                loading={updateLoading && editingFieldName === 'lastName'}
                inlineEdit={inlineEdit}
                onInlineSave={(name, value) => update(name, value!)}
                clearable
                inputProps={{
                  className: 'flex-3/5 rounded-e-none',
                }}
              />
              <FieldInputText
                label={''}
                placeholder={t('employee.fields.firstName')}
                form={form}
                name="firstName"
                mode={fieldMode}
                loading={updateLoading && editingFieldName === 'firstName'}
                inlineEdit={inlineEdit}
                onInlineSave={(name, value) => update(name, value!)}
                clearable
                inputProps={{
                  className: 'flex-2/5 rounded-s-none',
                }}
              />
            </div>

            <FieldInputConstant
              label={t('employee.fields.gender')}
              placeholder={t('employee.fields.gender')}
              required
              form={form}
              name="gender"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'gender'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              constOptions={CONST_GENDER}
              clearable
            />

            <FieldInputDate
              label={t('employee.fields.dateOfBirth')}
              placeholder={t('employee.fields.dateOfBirth')}
              required
              form={form}
              name="dateOfBirth"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'dateOfBirth'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.placeOfBirth')}
              placeholder={t('employee.fields.placeOfBirth')}
              form={form}
              name="placeOfBirth"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'placeOfBirth'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.placeOfOrigin')}
              placeholder={t('employee.fields.placeOfOrigin')}
              form={form}
              name="placeOfOrigin"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'placeOfOrigin'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.ethnicity')}
              placeholder={t('employee.fields.ethnicity')}
              form={form}
              name="ethnicity"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'ethnicity'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.religion')}
              placeholder={t('employee.fields.religion')}
              form={form}
              name="religion"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'religion'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputCountry
              label={t('employee.fields.nationality')}
              placeholder={t('employee.fields.nationality')}
              form={form}
              name="nationality"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'nationality'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              searchable
              clearable
            />

            <FieldInputConstant
              label={t('employee.fields.maritalStatus')}
              placeholder={t('employee.fields.maritalStatus')}
              form={form}
              name="maritalStatus"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'maritalStatus'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              constOptions={CONST_MARITAL_STATUS}
              clearable
            />
          </FieldGroup>
        </SubSection>

        {/* CCCD */}
        <SubSection title={t('employee.sections.basic.id')}>
          <FieldGroup className="grid grid-cols-3">
            <FieldInputNumeric
              label={t('employee.fields.idNumber')}
              placeholder={t('employee.fields.idNumber')}
              form={form}
              name="idNumber"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'idNumber'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputDate
              label={t('employee.fields.idDateOfIssue')}
              placeholder={t('employee.fields.idDateOfIssue')}
              form={form}
              name="idDateOfIssue"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'idDateOfIssue'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputDate
              label={t('employee.fields.idDateOfExpiry')}
              placeholder={t('employee.fields.idDateOfExpiry')}
              form={form}
              name="idDateOfExpiry"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'idDateOfExpiry'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              className="col-span-3"
              label={t('employee.fields.idPlaceOfIssue')}
              placeholder={t('employee.fields.idPlaceOfIssue')}
              form={form}
              name="idPlaceOfIssue"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'idPlaceOfIssue'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        {/* Education */}
        <SubSection title={t('employee.sections.basic.education')}>
          <FieldGroup className="grid grid-cols-3">
            <FieldInputText
              label={t('employee.fields.educationLevel')}
              placeholder={t('employee.fields.educationLevel')}
              form={form}
              name="educationLevel"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'educationLevel'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.major')}
              placeholder={t('employee.fields.major')}
              form={form}
              name="major"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'major'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.qualificationLevel')}
              placeholder={t('employee.fields.qualificationLevel')}
              form={form}
              name="qualificationLevel"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'qualificationLevel'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputYear
              label={t('employee.fields.graduationYear')}
              placeholder={t('employee.fields.graduationYear')}
              form={form}
              name="graduationYear"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'graduationYear'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.institution')}
              placeholder={t('employee.fields.institution')}
              form={form}
              name="institution"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'institution'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('employee.fields.classification')}
              placeholder={t('employee.fields.classification')}
              form={form}
              name="classification"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'classification'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />
          </FieldGroup>
        </SubSection>
      </div>
    </SectionPanel>
  );
}
