export interface EmployeeMock {
  id: string;
  userId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female';
  avatar?: string;
  placeOfBirth?: string;
  placeOfOrigin?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced';
  ethnicity?: string;
  religion?: string;
  nationality?: string;
  idNumber?: string;
  idDateOfIssue?: string;
  idPlaceOfIssue?: string;
  idDateOfExpiry?: string;
  educationLevel?: string;
  qualificationLevel?: string;
  institution?: string;
  major?: string;
  graduationYear?: number;
  classification?: string;
  createdBy?: string;
  createdOnUtc?: string;
  modifiedBy?: string | null;
  modifiedOnUtc?: string | null;
  contact?: EmployeeContactMock;
  jobInfo: {
    id?: string;
    employeeId?: string;
    hireDate?: string;
    probationDate?: string;
    officialDate?: string;
    jobPositionName: string;
    jobPositionCode: string;
    jobPositionId?: string;
    organizationUnitName: string;
    organizationUnitCode: string;
    organizationUnitId?: string;
    status: 'Active' | 'InActive' | 'OnProbation';
    managerId?: string;
  };
}

export interface EmployeeContactMock {
  id: string;
  employeeId: string;
  personalPhoneNumber?: string;
  officePhoneNumber?: string;
  personalEmail?: string;
  officeEmail?: string;
  permanentCountryCode?: string;
  permanentProvinceCode?: number;
  permanentDistrictCode?: number;
  permanentWardCode?: number;
  permanentStreet?: string;
  registrationBookNumber?: string;
  currentCountryCode?: string;
  currentProvinceCode?: number;
  currentDistrictCode?: number;
  currentWardCode?: number;
  currentStreet?: string;
  emergencyFullName?: string;
  emergencyRelationship?: string;
  emergencyPhoneNumber?: string;
  emergencyAddFullName?: string;
  emergencyAddRelationship?: string;
  emergencyAddPhoneNumber?: string;
}

export interface EmployeeQualificationMock {
  id: string;
  employeeId: string;
  type?: 'Education' | 'Certification';
  institution?: string;
  major?: string;
  level?: string;
  issueDate?: string;
  expiryDate?: string;
  note?: string;
}

export interface EmployeeDocumentMock {
  id: string;
  employeeId: string;
  name: string;
  fileName?: string;
  fileId?: string;
  note?: string;
}
