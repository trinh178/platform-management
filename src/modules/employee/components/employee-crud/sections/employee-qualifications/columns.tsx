import { useTranslations } from 'next-intl';
import { constGet } from '@/core/constants';
import { CONST_QUALIFICATION_TYPE } from '@/modules/employee/constants/employee-qualification';
import type { EmployeeQualification } from '@/modules/employee/types/employee-qualification';
import type { PlainTableColumnDef } from '@/shared/components/data-table/plain';
import { formatDate } from '@/shared/utils';

export function useQualificationColumns(): PlainTableColumnDef<EmployeeQualification>[] {
  const t = useTranslations();
  return [
    {
      key: 'type',
      header: t('employee.fields.qualification.type'),
      render: row => t(constGet(CONST_QUALIFICATION_TYPE, row.type, 'label')),
    },
    {
      key: 'institution',
      header: t('employee.fields.qualification.institution'),
      render: row => row.institution,
    },
    {
      key: 'major',
      header: t('employee.fields.qualification.major'),
      render: row => row.major,
    },
    {
      key: 'level',
      header: t('employee.fields.qualification.level'),
      render: row => row.level,
    },
    {
      key: 'issueDate',
      header: t('employee.fields.qualification.issueDate'),
      render: row => formatDate(row.issueDate),
    },
    {
      key: 'expiryDate',
      header: t('employee.fields.qualification.expiryDate'),
      render: row => formatDate(row.expiryDate),
    },
    {
      key: 'note',
      header: t('employee.fields.qualification.note'),
      render: row => row.note,
    },
  ];
}
