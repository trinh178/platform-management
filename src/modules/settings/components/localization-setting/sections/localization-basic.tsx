'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useWatch } from 'react-hook-form';
import { useLocalizationSettingContext } from '../context';
import FieldInputCombobox from '@/shared/components/form/field-input-combobox';
import FieldInputMultiCombobox from '@/shared/components/form/field-input-multi-combobox';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

const LANGUAGE_SUGGESTIONS = [
  { label: 'Tiếng Việt (vi)', value: 'vi' },
  { label: 'English (en)', value: 'en' },
];

export default function LocalizationSettingBasic() {
  const t = useTranslations();
  const { form, inlineEdit, updateLoading, update, editingFieldName } =
    useLocalizationSettingContext();
  const fieldMode = inlineEdit ? 'EDIT' : 'VIEW';

  const supportedLanguages = useWatch({
    control: form.control,
    name: 'supportedLanguages',
  });

  const defaultLanguageOptions = React.useMemo(() => {
    const codes = supportedLanguages ?? [];
    return codes.map(code => ({
      label: LANGUAGE_SUGGESTIONS.find(l => l.value === code)?.label ?? code,
      value: code,
    }));
  }, [supportedLanguages]);

  return (
    <SectionPanel title={t('settings.localization.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('settings.localization.sections.basic.language')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputMultiCombobox
              className="col-span-2 2xl:col-span-3"
              label={t('settings.localization.fields.supportedLanguages')}
              placeholder={t(
                'settings.localization.placeholder.supportedLanguages',
              )}
              required
              form={form}
              name="supportedLanguages"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'supportedLanguages'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              options={LANGUAGE_SUGGESTIONS}
              allowCustom
              clearable
            />

            <FieldInputCombobox
              label={t('settings.localization.fields.defaultLanguage')}
              placeholder={t('settings.localization.fields.defaultLanguage')}
              tooltip={t('settings.localization.tooltip.defaultLanguage')}
              required
              form={form}
              name="defaultLanguage"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'defaultLanguage'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              options={defaultLanguageOptions}
              allowCustom={false}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('settings.localization.sections.basic.format')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputText
              label={t('settings.localization.fields.dateFormat')}
              placeholder={t('settings.localization.placeholder.dateFormat')}
              required
              form={form}
              name="dateFormat"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'dateFormat'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('settings.localization.fields.timeFormat')}
              placeholder={t('settings.localization.placeholder.timeFormat')}
              required
              form={form}
              name="timeFormat"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'timeFormat'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('settings.localization.fields.numberFormat')}
              placeholder={t('settings.localization.placeholder.numberFormat')}
              required
              form={form}
              name="numberFormat"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'numberFormat'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('settings.localization.fields.currencyFormat')}
              placeholder={t(
                'settings.localization.placeholder.currencyFormat',
              )}
              required
              form={form}
              name="currencyFormat"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'currencyFormat'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('settings.localization.sections.basic.advanced')}>
          <FieldGroup className="grid grid-cols-1">
            <FieldInputTextArea
              label={t('settings.localization.fields.note')}
              placeholder={t('settings.localization.fields.note')}
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
