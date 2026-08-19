import React from 'react';
import { useTranslations } from 'next-intl';
import { useDomainCRUDContext } from '../context';
import queryClient from '@/core/query/query-client';
import { CONST_DOMAIN_STATUS } from '@/modules/registry/constants/domain';
import { useServiceDetails } from '@/modules/registry/services/service.queries';
import { useServiceOptions } from '@/modules/registry/services/service.queries';
import FieldInputAsyncSelect from '@/shared/components/form/field-input-async-select';
import FieldInputConstant from '@/shared/components/form/field-input-constant';
import FieldInputText from '@/shared/components/form/field-input-text';
import FieldInputTextArea from '@/shared/components/form/field-input-textarea';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';

export default function DomainBasic() {
  const t = useTranslations();
  const { form, mode, inlineEdit, updateLoading, update, editingFieldName } =
    useDomainCRUDContext();
  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';

  const loadServiceOptions = React.useCallback(async (keyword: string) => {
    const items = await useServiceOptions.query(queryClient, keyword);
    return items.map(s => ({
      label: `${s.serviceCode} - ${s.name}`,
      value: s.id,
    }));
  }, []);

  const loadServiceOption = React.useCallback(async (id: string) => {
    const service = await useServiceDetails.query(queryClient, id);
    return {
      label: `${service.serviceCode} - ${service.name}`,
      value: service.id,
    };
  }, []);

  return (
    <SectionPanel title={t('registry.domain.sections.basic.title')}>
      <div className="space-y-4">
        <SubSection title={t('registry.domain.sections.basic.general')}>
          <FieldGroup className="grid grid-cols-2 2xl:grid-cols-3">
            <FieldInputAsyncSelect
              label={t('registry.domain.fields.serviceId')}
              placeholder={t('registry.domain.fields.serviceId')}
              searchPlaceholder={t('common.control.search')}
              tooltip={t('registry.domain.tooltip.serviceId')}
              required
              form={form}
              name="serviceId"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'serviceId'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              loadOptions={loadServiceOptions}
              loadOption={loadServiceOption}
              clearable
            />

            <FieldInputText
              label={t('registry.domain.fields.domainCode')}
              placeholder={t('registry.domain.fields.domainCode')}
              tooltip={t('registry.domain.tooltip.domainCode')}
              required
              form={form}
              name="domainCode"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'domainCode'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              clearable
            />

            <FieldInputText
              label={t('registry.domain.fields.name')}
              placeholder={t('registry.domain.fields.name')}
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
              label={t('registry.domain.fields.status')}
              placeholder={t('registry.domain.fields.status')}
              required
              form={form}
              name="status"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'status'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value!)}
              constOptions={CONST_DOMAIN_STATUS}
              clearable
            />

            <FieldInputTextArea
              className="col-span-2 2xl:col-span-3"
              label={t('registry.domain.fields.description')}
              placeholder={t('registry.domain.fields.description')}
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

        <SubSection title={t('registry.domain.sections.basic.advanced')}>
          <FieldGroup className="grid grid-cols-1">
            <FieldInputTextArea
              label={t('registry.domain.fields.note')}
              placeholder={t('registry.domain.fields.note')}
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
