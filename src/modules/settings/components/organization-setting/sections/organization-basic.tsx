'use client';

import { useTranslations } from 'next-intl';
import AssetRefUploadField from '../../asset-ref-upload-field';
import { useOrganizationSettingContext } from '../context';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function OrganizationSettingBasic() {
  const t = useTranslations();
  const { form, inlineEdit, data, updateLoading, update, editingFieldName } =
    useOrganizationSettingContext();
  const fieldMode = inlineEdit ? 'EDIT' : 'VIEW';

  return (
    <SectionPanel title={t('settings.organization.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('settings.organization.sections.basic.general')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputText
              label={t('settings.organization.fields.name')}
              placeholder={t('settings.organization.fields.name')}
              required
              form={form}
              name="name"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'name'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('settings.organization.fields.legalName')}
              placeholder={t('settings.organization.fields.legalName')}
              form={form}
              name="legalName"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'legalName'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <AssetRefUploadField
              label={t('settings.organization.fields.logo')}
              form={form}
              name="logoAssetId"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'logoAssetId'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              category="ORGANIZATION_LOGO"
              previewUrl={data?.logo?.url}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('settings.organization.sections.basic.contact')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputText
              label={t('settings.organization.fields.website')}
              placeholder={t('settings.organization.fields.website')}
              form={form}
              name="website"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'website'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('settings.organization.fields.contactEmail')}
              placeholder={t('settings.organization.fields.contactEmail')}
              form={form}
              name="contactEmail"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'contactEmail'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('settings.organization.fields.contactPhone')}
              placeholder={t('settings.organization.fields.contactPhone')}
              form={form}
              name="contactPhone"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'contactPhone'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputTextArea
              className="col-span-2 2xl:col-span-3"
              label={t('settings.organization.fields.address')}
              placeholder={t('settings.organization.fields.address')}
              form={form}
              name="address"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'address'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('settings.organization.sections.basic.advanced')}>
          <FieldGroup className="grid grid-cols-1">
            <FieldInputTextArea
              label={t('settings.organization.fields.note')}
              placeholder={t('settings.organization.fields.note')}
              form={form}
              name="note"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'note'}
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
