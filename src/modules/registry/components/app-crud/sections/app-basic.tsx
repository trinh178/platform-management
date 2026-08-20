import { useTranslations } from 'next-intl';
import { useAppCRUDContext } from '../context';
import { CONST_APP_STATUS } from '@/modules/registry/constants/app';
import FieldInputConstant from '@/shared/components/form/field-input-constant';
import FieldInputJson from '@/shared/components/form/field-input-json';
import FieldInputMultiCombobox from '@/shared/components/form/field-input-multi-combobox';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function AppBasic() {
  const t = useTranslations();

  const { form, mode, inlineEdit, updateLoading, update, editingFieldName } =
    useAppCRUDContext();

  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';

  return (
    <SectionPanel title={t('registry.app.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('registry.app.sections.basic.general')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputText
              label={t('registry.app.fields.appCode')}
              placeholder={t('registry.app.fields.appCode')}
              tooltip={t('registry.app.tooltip.appCode')}
              required
              form={form}
              name="appCode"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'appCode'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('registry.app.fields.name')}
              placeholder={t('registry.app.fields.name')}
              required
              form={form}
              name="name"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'name'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputConstant
              label={t('registry.app.fields.status')}
              placeholder={t('registry.app.fields.status')}
              required
              form={form}
              name="status"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'status'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              constOptions={CONST_APP_STATUS}
              clearable
            />

            <FieldInputText
              label={t('registry.app.fields.version')}
              placeholder={t('registry.app.placeholder.version')}
              form={form}
              name="version"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'version'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('registry.app.fields.url')}
              placeholder={t('registry.app.fields.url')}
              form={form}
              name="url"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'url'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputText
              label={t('registry.app.fields.iconUrl')}
              placeholder={t('registry.app.fields.iconUrl')}
              form={form}
              name="iconUrl"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'iconUrl'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputTextArea
              className="col-span-2 2xl:col-span-3"
              label={t('registry.app.fields.description')}
              placeholder={t('registry.app.fields.description')}
              form={form}
              name="description"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'description'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputMultiCombobox
              className="col-span-2 2xl:col-span-3"
              label={t('registry.app.fields.tags')}
              placeholder={t('registry.app.placeholder.tags')}
              form={form}
              name="tags"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'tags'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              options={[]}
              allowCustom
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('registry.app.sections.basic.advanced')}>
          <FieldGroup className="grid grid-cols-1">
            <FieldInputJson
              label={t('registry.app.fields.metadata')}
              tooltip={t('registry.app.tooltip.metadata')}
              form={form}
              name="metadata"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'metadata'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              rows={6}
              clearable
            />
          </FieldGroup>
        </SubSection>
      </div>
    </SectionPanel>
  );
}
