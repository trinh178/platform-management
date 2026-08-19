export type EmployeeDocument = {
  id: string;

  name: string;
  fileName?: string;
  fileId?: string;
  note?: string;

  /* Relations */
  employeeId: string;
};
