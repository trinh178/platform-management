'use client';

import { useTranslations } from 'next-intl';
import { useGeneralSettingContext } from '../context';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function GeneralSettingBasic() {
  const t = useTranslations();
  const { form, inlineEdit, updateLoading, update, editingFieldName } =
    useGeneralSettingContext();
  const fieldMode = inlineEdit ? 'EDIT' : 'VIEW';

  return (
    <SectionPanel title={t('settings.general.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('settings.general.sections.basic.general')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputText
              label={t('settings.general.fields.defaultTimezone')}
              placeholder={t('settings.general.placeholder.defaultTimezone')}
              tooltip={t('settings.general.tooltip.defaultTimezone')}
              required
              form={form}
              name="defaultTimezone"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'defaultTimezone'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('settings.general.fields.defaultCurrency')}
              placeholder={t('settings.general.placeholder.defaultCurrency')}
              tooltip={t('settings.general.tooltip.defaultCurrency')}
              required
              form={form}
              name="defaultCurrency"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'defaultCurrency'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('settings.general.sections.basic.advanced')}>
          <FieldGroup className="grid grid-cols-1">
            <FieldInputTextArea
              label={t('settings.general.fields.note')}
              placeholder={t('settings.general.fields.note')}
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
