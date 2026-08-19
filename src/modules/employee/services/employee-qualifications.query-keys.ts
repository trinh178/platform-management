const employeeQualificationsKeys = {
  list: (employeeId?: string) =>
    employeeId
      ? (['employee', 'qualification', 'list', employeeId] as const)
      : (['employee', 'qualification', 'list'] as const),
  details: (employeeId: string, id: string) =>
    ['employee', 'qualification', 'details', employeeId, id] as const,
};

export default employeeQualificationsKeys;
