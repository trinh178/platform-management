import React from 'react';
import { useEmployeeCRUDContext } from './context';
import EmployeeBasic from './sections/employee-basic';
import EmployeeContact from './sections/employee-contact';
import EmployeeDocuments from './sections/employee-documents';
import EmployeeJobInfo from './sections/employee-job-info';
import EmployeeQualifications from './sections/employee-qualifications';
import { TranslationsKey } from '@/core/i18n/types';
import { CRUDMode } from '@/shared/types/crud';

const sections: {
  label: TranslationsKey;
  Content: () => React.ReactNode;
  hiddenOnCreate: boolean;
  hidden?: (context: { mode: CRUDMode; hasEmployee: boolean }) => boolean;
}[] = [
  {
    label: 'employee.sections.basic.title',
    Content: EmployeeBasic,
    hiddenOnCreate: false,
  },
  {
    label: 'employee.sections.contact.title',
    Content: EmployeeContact,
    hiddenOnCreate: false,
  },
  {
    label: 'employee.sections.jobInfo.title',
    Content: EmployeeJobInfo,
    hiddenOnCreate: false,
  },
  {
    label: 'employee.sections.qualifications.title',
    Content: EmployeeQualifications,
    hiddenOnCreate: false,
  },
  {
    label: 'employee.sections.documents.title',
    Content: EmployeeDocuments,
    hiddenOnCreate: true,
    hidden: ({ hasEmployee }) => !hasEmployee,
  },
];

export default function EmployeeCRUDForm() {
  const { mode, data } = useEmployeeCRUDContext();

  const visibleSections = sections.filter(section => {
    if (mode === 'CREATE' && section.hiddenOnCreate) return false;
    if (section.hidden?.({ mode, hasEmployee: !!data?.id })) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {visibleSections.map(({ label, Content }) => (
        <Content key={label} />
      ))}
    </div>
  );
}
