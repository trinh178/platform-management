import { useTranslations } from 'next-intl';
import { useServiceCRUDContext } from '../context';
import { CONST_SERVICE_STATUS } from '@/modules/registry/constants/service';
import FieldInputConstant from '@/shared/components/form/field-input-constant';
import FieldInputJson from '@/shared/components/form/field-input-json';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function ServiceBasic() {
  const t = useTranslations();

  const { form, mode, inlineEdit, updateLoading, update, editingFieldName } =
    useServiceCRUDContext();

  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';

  return (
    <SectionPanel title={t('registry.service.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('registry.service.sections.basic.general')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputText
              label={t('registry.service.fields.serviceCode')}
              placeholder={t('registry.service.fields.serviceCode')}
              tooltip={t('registry.service.tooltip.serviceCode')}
              required
              form={form}
              name="serviceCode"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'serviceCode'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('registry.service.fields.name')}
              placeholder={t('registry.service.fields.name')}
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
              label={t('registry.service.fields.status')}
              placeholder={t('registry.service.fields.status')}
              required
              form={form}
              name="status"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'status'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              constOptions={CONST_SERVICE_STATUS}
              clearable
            />

            <FieldInputText
              label={t('registry.service.fields.version')}
              placeholder={t('registry.service.placeholder.version')}
              form={form}
              name="version"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'version'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputTextArea
              className="col-span-2 2xl:col-span-3"
              label={t('registry.service.fields.description')}
              placeholder={t('registry.service.fields.description')}
              form={form}
              name="description"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'description'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <SubSection title={t('registry.service.sections.basic.advanced')}>
          <FieldGroup className="grid grid-cols-1">
            <FieldInputJson
              label={t('registry.service.fields.metadata')}
              tooltip={t('registry.service.tooltip.metadata')}
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
