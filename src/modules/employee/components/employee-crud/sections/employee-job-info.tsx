import React from 'react';
import { useTranslations } from 'next-intl';
import { useEmployeeCRUDContext } from '../context';
import { CONST_JOB_INFO_STATUS } from '@/modules/employee/constants/employee-job-info';
import { useOrganizationUnitHierarchy } from '@/modules/employee/services/organization-unit.queries';
import type { JobPosition } from '@/modules/employee/types/organization';
import FieldGroupInlineEdit from '@/shared/components/form/field-group-inline-edit';
import FieldInputConstant from '@/shared/components/form/field-input-constant';
import FieldInputDate from '@/shared/components/form/field-input-date';
import FieldInputEntitySelect from '@/shared/components/form/field-input-entity-select';
import FieldInputTreeEntitySelect from '@/shared/components/form/field-input-tree-entity-select';
import SectionPanel from '@/shared/components/layout/section-panel';
import SubSection from '@/shared/components/layout/sub-section';
import { FieldGroup } from '@/shared/components/ui/field';
import { findTreeNode } from '@/shared/utils';

export default function EmployeeJobInfo() {
  const t = useTranslations('employee');
  const { form, mode, inlineEdit, updateLoading, editingFieldName, update } =
    useEmployeeCRUDContext();
  const fieldMode = mode === 'READ' && !inlineEdit ? 'VIEW' : 'EDIT';

  const hierarchy = useOrganizationUnitHierarchy();

  const selectedOrg = form.watch('jobInfo.organizationUnit');
  const jobPositionOptions = React.useMemo<JobPosition[]>(() => {
    if (!selectedOrg?.id || !hierarchy.data) return [];
    return (
      findTreeNode(
        hierarchy.data,
        n => n.id === selectedOrg.id,
        n => n.children,
      )?.jobPositions ?? []
    );
  }, [hierarchy.data, selectedOrg]);

  const orgSaving =
    updateLoading &&
    (editingFieldName === 'jobInfo.organizationUnit' ||
      editingFieldName === 'jobInfo.jobPosition');

  return (
    <SectionPanel title={t('sections.jobInfo.title')}>
      <div className="space-y-4">
        <SubSection title={t('sections.jobInfo.work')}>
          <FieldGroup className="grid grid-cols-3">
            <FieldInputConstant
              label={t('fields.jobInfo.status')}
              placeholder={t('fields.jobInfo.status')}
              form={form}
              name="jobInfo.status"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'jobInfo.status'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              constOptions={CONST_JOB_INFO_STATUS}
              clearable
            />

            <FieldInputDate
              label={t('fields.jobInfo.hireDate')}
              placeholder={t('fields.jobInfo.hireDate')}
              form={form}
              name="jobInfo.hireDate"
              mode={fieldMode}
              loading={updateLoading && editingFieldName === 'jobInfo.hireDate'}
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputDate
              label={t('fields.jobInfo.probationDate')}
              placeholder={t('fields.jobInfo.probationDate')}
              form={form}
              name="jobInfo.probationDate"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'jobInfo.probationDate'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />

            <FieldInputDate
              label={t('fields.jobInfo.officialDate')}
              placeholder={t('fields.jobInfo.officialDate')}
              form={form}
              name="jobInfo.officialDate"
              mode={fieldMode}
              loading={
                updateLoading && editingFieldName === 'jobInfo.officialDate'
              }
              inlineEdit={inlineEdit}
              onInlineSave={(name, value) => update(name, value)}
              clearable
            />
          </FieldGroup>
        </SubSection>

        <FieldGroupInlineEdit
          form={form}
          names={['jobInfo.organizationUnit', 'jobInfo.jobPosition']}
          title={t('sections.jobInfo.org')}
          mode={fieldMode}
          inlineEdit={inlineEdit}
          loading={orgSaving}
          clearable
          onSave={getValue => {
            const org = getValue('jobInfo.organizationUnit');
            const pos = getValue('jobInfo.jobPosition');
            update('jobInfo.organizationUnit', org, {
              jobInfo: { organizationUnit: org, jobPosition: pos },
            });
          }}
          onClear={() => {
            update('jobInfo.organizationUnit', undefined, {
              jobInfo: { organizationUnit: undefined, jobPosition: undefined },
            });
          }}
        >
          {({ fieldMode }) => (
            <FieldGroup className="grid grid-cols-3">
              <FieldInputTreeEntitySelect
                label={t('fields.jobInfo.organizationUnit')}
                placeholder={t('fields.jobInfo.organizationUnit')}
                form={form}
                name="jobInfo.organizationUnit"
                mode={fieldMode}
                options={hierarchy.data || []}
                getOptionValue={org => org.id}
                getOptionLabel={org => org.name}
                getOptionChildren={org => org.children}
                loading={hierarchy.isLoading || orgSaving}
                searchable
                expandAll
                onValueChange={() => {
                  form.setValue('jobInfo.jobPosition', undefined);
                }}
              />

              <FieldInputEntitySelect
                label={t('fields.jobInfo.jobPosition')}
                placeholder={t('fields.jobInfo.jobPosition')}
                form={form}
                name="jobInfo.jobPosition"
                mode={fieldMode}
                options={jobPositionOptions}
                getOptionValue={p => p.id}
                getOptionLabel={p => p.name}
                renderOption={p => p.name}
                disabled={!selectedOrg?.id}
                loading={orgSaving}
              />
            </FieldGroup>
          )}
        </FieldGroupInlineEdit>
      </div>
    </SectionPanel>
  );
}
