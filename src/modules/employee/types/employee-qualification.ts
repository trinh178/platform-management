export type QualificationType = 'Education' | 'Certification';

export type EmployeeQualification = {
  id: string;

  type?: QualificationType;
  institution?: string;
  major?: string;
  level?: string;
  issueDate?: Date;
  expiryDate?: Date;
  note?: string;

  /* Relations */
  employeeId: string;
};
