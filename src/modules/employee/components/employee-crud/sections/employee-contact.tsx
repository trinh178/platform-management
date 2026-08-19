import { useTranslations } from 'next-intl';
import { useEmployeeCRUDContext } from '../context';
import FieldInputAddress from '@/shared/components/form/field-input-address';
import FieldInputCountry from '@/shared/components/form/field-input-country';
import FieldInputEmail from '@/shared/components/form/field-input-email';
import FieldInputPhoneNumber from '@/shared/components/form/field-input-phone-number';
import FieldInputText from '@/shared/components/form/field-input-text';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function EmployeeContact() {
  const t = useTranslations('employee');

  const { form, mode, inlineEdit, updateLoading, editingFieldName, update } =
    useEmployeeCRUDContext();

  // Field mode
  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';

  return (
    <SectionPanel title={t('sections.contact.title')}>
      <div className="space-y-4">
        <SubSection title={t('sections.contact.general')}>
          <FieldGroup className="grid grid-cols-3">
            <FieldInputPhoneNumber
              label={t('fields.contact.personalPhoneNumber')}
              placeholder={t('fields.contact.personalPhoneNumber')}
              form={form}
              name="contact.personalPhoneNumber"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.personalPhoneNumber'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputPhoneNumber
              label={t('fields.contact.officePhoneNumber')}
              placeholder={t('fields.contact.officePhoneNumber')}
              form={form}
              name="contact.officePhoneNumber"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.officePhoneNumber'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputEmail
              label={t('fields.contact.personalEmail')}
              placeholder={t('fields.contact.personalEmail')}
              form={form}
              name="contact.personalEmail"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'contact.personalEmail'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputEmail
              label={t('fields.contact.officeEmail')}
              placeholder={t('fields.contact.officeEmail')}
              form={form}
              name="contact.officeEmail"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'contact.officeEmail'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('sections.contact.permanent')}>
          <FieldGroup className="grid grid-cols-3">
            <FieldInputCountry
              label={t('fields.contact.permanentCountry')}
              placeholder={t('fields.contact.permanentCountry')}
              form={form}
              name="contact.permanentCountryCode"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.permanentCountryCode'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputAddress
              className="col-span-2"
              label={t('fields.contact.permanentAddress')}
              placeholder={t('fields.contact.permanentAddress')}
              form={form}
              name="contact.permanentAddress"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'contact.permanentAddress'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => {
                update(name, value, {
                  contact: {
                    permanentProvinceCode: value?.provinceCode,
                    permanentDistrictCode: value?.districtCode,
                    permanentWardCode: value?.wardCode,
                  },
                });
              }}
              clearable
            />

            <FieldInputText
              label={t('fields.contact.registrationBookNumber')}
              placeholder={t('fields.contact.registrationBookNumber')}
              form={form}
              name="contact.registrationBookNumber"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.registrationBookNumber'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              className="col-span-2"
              label={t('fields.contact.permanentStreet')}
              placeholder={t('fields.contact.permanentStreet')}
              form={form}
              name="contact.permanentStreet"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'contact.permanentStreet'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('sections.contact.current')}>
          <FieldGroup className="grid grid-cols-3">
            <FieldInputCountry
              label={t('fields.contact.currentCountry')}
              placeholder={t('fields.contact.currentCountry')}
              form={form}
              name="contact.currentCountryCode"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.currentCountryCode'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputAddress
              className="col-span-2"
              label={t('fields.contact.currentAddress')}
              placeholder={t('fields.contact.currentAddress')}
              form={form}
              name="contact.currentAddress"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'contact.currentAddress'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => {
                update(name, value, {
                  contact: {
                    currentProvinceCode: value?.provinceCode,
                    currentDistrictCode: value?.districtCode,
                    currentWardCode: value?.wardCode,
                  },
                });
              }}
              clearable
            />

            <FieldInputText
              className="col-span-3"
              label={t('fields.contact.currentStreet')}
              placeholder={t('fields.contact.currentStreet')}
              form={form}
              name="contact.currentStreet"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'contact.currentStreet'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('sections.contact.emergency')}>
          <FieldGroup className="grid grid-cols-3">
            <FieldInputText
              label={t('fields.contact.emergencyFullName')}
              placeholder={t('fields.contact.emergencyFullName')}
              form={form}
              name="contact.emergencyFullName"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.emergencyFullName'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('fields.contact.emergencyRelationship')}
              placeholder={t('fields.contact.emergencyRelationship')}
              form={form}
              name="contact.emergencyRelationship"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.emergencyRelationship'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputPhoneNumber
              label={t('fields.contact.emergencyPhoneNumber')}
              placeholder={t('fields.contact.emergencyPhoneNumber')}
              form={form}
              name="contact.emergencyPhoneNumber"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.emergencyPhoneNumber'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('fields.contact.emergencyAddFullName')}
              placeholder={t('fields.contact.emergencyAddFullName')}
              form={form}
              name="contact.emergencyAddFullName"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.emergencyAddFullName'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('fields.contact.emergencyAddRelationship')}
              placeholder={t('fields.contact.emergencyAddRelationship')}
              form={form}
              name="contact.emergencyAddRelationship"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.emergencyAddRelationship'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputPhoneNumber
              label={t('fields.contact.emergencyAddPhoneNumber')}
              placeholder={t('fields.contact.emergencyAddPhoneNumber')}
              form={form}
              name="contact.emergencyAddPhoneNumber"
              mode={fieldMode}
              loading={
                updateLoading &&
                editingFieldName === 'contact.emergencyAddPhoneNumber'
              }
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
