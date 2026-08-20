import React from 'react';
import { useTranslations } from 'next-intl';
import { useResourceCRUDContext } from '../context';
import queryClient from '@/core/query/query-client';
import {
  useDomainDetails,
  useDomainOptions,
} from '@/modules/registry/services/domain.queries';
import FieldInputAsyncSelect from '@/shared/components/form/field-input-async-select';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function ResourceBasic() {
  const t = useTranslations();
  const { form, mode, inlineEdit, updateLoading, update, editingFieldName } =
    useResourceCRUDContext();
  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';

  const loadDomainOptions = React.useCallback(async (keyword: string) => {
    const items = await useDomainOptions.query(queryClient, { keyword });
    return items.map(d => ({
      label: `${d.domainCode} - ${d.name}`,
      value: d.id,
    }));
  }, []);

  const loadDomainOption = React.useCallback(async (id: string) => {
    const domain = await useDomainDetails.query(queryClient, id);
    return { label: `${domain.domainCode} - ${domain.name}`, value: domain.id };
  }, []);

  return (
    <SectionPanel title={t('registry.resource.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('registry.resource.sections.basic.general')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputAsyncSelect
              label={t('registry.resource.fields.domainId')}
              placeholder={t('registry.resource.fields.domainId')}
              searchPlaceholder={t('common.control.search')}
              tooltip={t('registry.resource.tooltip.domainId')}
              required
              form={form}
              name="domainId"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'domainId'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              loadOptions={loadDomainOptions}
              loadOption={loadDomainOption}
              clearable
            />

            <FieldInputText
              label={t('registry.resource.fields.resourceCode')}
              placeholder={t('registry.resource.fields.resourceCode')}
              tooltip={t('registry.resource.tooltip.resourceCode')}
              required
              form={form}
              name="resourceCode"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'resourceCode'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('registry.resource.fields.name')}
              placeholder={t('registry.resource.fields.name')}
              required
              form={form}
              name="name"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'name'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputTextArea
              className="col-span-2 2xl:col-span-3"
              label={t('registry.resource.fields.description')}
              placeholder={t('registry.resource.fields.description')}
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
      </div>
    </SectionPanel>
  );
}
