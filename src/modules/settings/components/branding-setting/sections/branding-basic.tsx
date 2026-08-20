'use client';

import { useTranslations } from 'next-intl';
import AssetRefUploadField from '../../asset-ref-upload-field';
import { useBrandingSettingContext } from '../context';
import FieldInputJson from '@/shared/components/form/field-input-json';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function BrandingSettingBasic() {
  const t = useTranslations();
  const { form, inlineEdit, data, updateLoading, update, editingFieldName } =
    useBrandingSettingContext();
  const fieldMode = inlineEdit ? 'EDIT' : 'VIEW';

  return (
    <SectionPanel title={t('settings.branding.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('settings.branding.sections.basic.identity')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputText
              label={t('settings.branding.fields.platformName')}
              placeholder={t('settings.branding.fields.platformName')}
              required
              form={form}
              name="platformName"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'platformName'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <AssetRefUploadField
              label={t('settings.branding.fields.logo')}
              tooltip={t('settings.branding.tooltip.logo')}
              form={form}
              name="logoAssetId"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'logoAssetId'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              category="BRANDING_LOGO"
              previewUrl={data?.logo?.url}
              clearable
            />

            <AssetRefUploadField
              label={t('settings.branding.fields.favicon')}
              form={form}
              name="faviconAssetId"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'faviconAssetId'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              category="BRANDING_FAVICON"
              previewUrl={data?.favicon?.url}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('settings.branding.sections.basic.advanced')}>
          <FieldGroup className="grid grid-cols-1">
            <FieldInputJson
              label={t('settings.branding.fields.brandConfig')}
              tooltip={t('settings.branding.tooltip.brandConfig')}
              form={form}
              name="brandConfig"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'brandConfig'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              rows={6}
              clearable
            />

            <FieldInputTextArea
              label={t('settings.branding.fields.note')}
              placeholder={t('settings.branding.fields.note')}
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
