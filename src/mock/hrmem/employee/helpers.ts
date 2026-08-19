import { v4 as uuidv4 } from 'uuid';
import type {
  EmployeeContactMock,
  EmployeeMock,
  EmployeeQualificationMock,
} from './mock-types';
import { documentStore, employeeStore, qualificationStore } from './stores';
import { appfetch } from '@/core/network/appfetch';
import { generateCodeFromStore } from '@/core/network/mock-utils';
import { getCurrentUserId } from '@/mock/mock-context';

export function getFullName(e: Pick<EmployeeMock, 'firstName' | 'lastName'>) {
  return [e.lastName, e.firstName].filter(Boolean).join(' ');
}

export function buildEmployeePreview(e: EmployeeMock) {
  return {
    id: e.id,
    userId: e.userId,
    employeeCode: e.employeeCode,
    firstName: e.firstName,
    lastName: e.lastName,
    fullName: getFullName(e),
    avatar: e.avatar,
    gender: e.gender,
    dateOfBirth: e.dateOfBirth,
    createdBy: e.createdBy,
    createdOnUtc: e.createdOnUtc,
    modifiedBy: e.modifiedBy,
    modifiedOnUtc: e.modifiedOnUtc,
    contact: e.contact
      ? {
          personalPhoneNumber: e.contact.personalPhoneNumber,
        }
      : undefined,
    jobInfo: {
      hireDate: e.jobInfo.hireDate,
      probationDate: e.jobInfo.probationDate,
      officialDate: e.jobInfo.officialDate,
      status: e.jobInfo.status,
      organizationUnit: {
        code: e.jobInfo.organizationUnitCode,
        name: e.jobInfo.organizationUnitName,
      },
      jobPosition: {
        code: e.jobInfo.jobPositionCode,
        name: e.jobInfo.jobPositionName,
      },
    },
  };
}

export function buildEmployeeDetails(e: EmployeeMock) {
  return {
    ...buildEmployeePreview(e),
    placeOfBirth: e.placeOfBirth,
    placeOfOrigin: e.placeOfOrigin,
    maritalStatus: e.maritalStatus,
    ethnicity: e.ethnicity,
    religion: e.religion,
    nationality: e.nationality,
    idNumber: e.idNumber,
    idDateOfIssue: e.idDateOfIssue,
    idPlaceOfIssue: e.idPlaceOfIssue,
    idDateOfExpiry: e.idDateOfExpiry,
    educationLevel: e.educationLevel,
    qualificationLevel: e.qualificationLevel,
    institution: e.institution,
    major: e.major,
    graduationYear: e.graduationYear,
    classification: e.classification,
    contact: e.contact,
    jobInfo: {
      id: e.jobInfo.id,
      employeeId: e.jobInfo.employeeId,
      hireDate: e.jobInfo.hireDate,
      probationDate: e.jobInfo.probationDate,
      officialDate: e.jobInfo.officialDate,
      status: e.jobInfo.status,
      organizationUnit: {
        id: e.jobInfo.organizationUnitId,
        code: e.jobInfo.organizationUnitCode,
        name: e.jobInfo.organizationUnitName,
      },
      jobPosition: {
        id: e.jobInfo.jobPositionId,
        code: e.jobInfo.jobPositionCode,
        name: e.jobInfo.jobPositionName,
      },
    },
    qualifications: qualificationStore.filter(q => q.employeeId === e.id),
    documentCount: documentStore.filter(d => d.employeeId === e.id).length,
  };
}

export function getEmployeeOrNotFound(id?: string | null) {
  const employee = employeeStore.find(e => e.id === id);
  if (!employee) {
    return appfetch.error(
      { code: 'NOT_FOUND', message: 'Không tìm thấy nhân viên' },
      404,
    );
  }
  return employee;
}

type NestedOrgPosition = {
  organizationUnit?: { id?: string; code?: string; name?: string };
  jobPosition?: { id?: string; code?: string; name?: string };
};

export function createEmployeeFromBody(
  body: Record<string, unknown>,
): EmployeeMock {
  const id = uuidv4();
  const contact = body.contact as Partial<EmployeeContactMock> | undefined;
  const jobInfo = body.jobInfo as
    | (Partial<EmployeeMock['jobInfo']> & NestedOrgPosition)
    | undefined;
  const org = jobInfo?.organizationUnit;
  const pos = jobInfo?.jobPosition;
  const employeeCode =
    typeof body.employeeCode === 'string' && body.employeeCode
      ? body.employeeCode
      : generateCodeFromStore(
          employeeStore as unknown as Record<string, unknown>[],
          'employeeCode',
          'EMP-',
          3,
        );
  const nowIso = new Date().toISOString();
  const employee: EmployeeMock = {
    id,
    createdBy: getCurrentUserId(),
    createdOnUtc: nowIso,
    modifiedBy: getCurrentUserId(),
    modifiedOnUtc: nowIso,
    userId: typeof body.userId === 'string' ? body.userId : undefined,
    employeeCode,
    firstName: typeof body.firstName === 'string' ? body.firstName : '',
    lastName: typeof body.lastName === 'string' ? body.lastName : '',
    dateOfBirth:
      typeof body.dateOfBirth === 'string'
        ? body.dateOfBirth
        : new Date().toISOString(),
    gender: body.gender === 'Female' ? 'Female' : 'Male',
    avatar: typeof body.avatar === 'string' ? body.avatar : undefined,
    placeOfBirth:
      typeof body.placeOfBirth === 'string' ? body.placeOfBirth : undefined,
    placeOfOrigin:
      typeof body.placeOfOrigin === 'string' ? body.placeOfOrigin : undefined,
    maritalStatus:
      body.maritalStatus === 'Married' || body.maritalStatus === 'Divorced'
        ? body.maritalStatus
        : body.maritalStatus === 'Single'
          ? 'Single'
          : undefined,
    ethnicity: typeof body.ethnicity === 'string' ? body.ethnicity : undefined,
    religion: typeof body.religion === 'string' ? body.religion : undefined,
    nationality:
      typeof body.nationality === 'string' ? body.nationality : undefined,
    idNumber: typeof body.idNumber === 'string' ? body.idNumber : undefined,
    idDateOfIssue:
      typeof body.idDateOfIssue === 'string' ? body.idDateOfIssue : undefined,
    idPlaceOfIssue:
      typeof body.idPlaceOfIssue === 'string' ? body.idPlaceOfIssue : undefined,
    idDateOfExpiry:
      typeof body.idDateOfExpiry === 'string' ? body.idDateOfExpiry : undefined,
    educationLevel:
      typeof body.educationLevel === 'string' ? body.educationLevel : undefined,
    qualificationLevel:
      typeof body.qualificationLevel === 'string'
        ? body.qualificationLevel
        : undefined,
    institution:
      typeof body.institution === 'string' ? body.institution : undefined,
    major: typeof body.major === 'string' ? body.major : undefined,
    graduationYear:
      typeof body.graduationYear === 'number' ? body.graduationYear : undefined,
    classification:
      typeof body.classification === 'string' ? body.classification : undefined,
    contact: {
      ...contact,
      id: contact?.id ?? `contact-${id}`,
      employeeId: id,
    },
    jobInfo: {
      id: jobInfo?.id ?? `job-${id}`,
      employeeId: id,
      hireDate:
        typeof jobInfo?.hireDate === 'string'
          ? jobInfo.hireDate
          : new Date().toISOString(),
      probationDate:
        typeof jobInfo?.probationDate === 'string'
          ? jobInfo.probationDate
          : undefined,
      officialDate:
        typeof jobInfo?.officialDate === 'string'
          ? jobInfo.officialDate
          : undefined,
      organizationUnitId:
        org?.id ??
        (typeof jobInfo?.organizationUnitId === 'string'
          ? jobInfo.organizationUnitId
          : undefined),
      organizationUnitCode:
        org?.code ??
        (typeof jobInfo?.organizationUnitCode === 'string'
          ? jobInfo.organizationUnitCode
          : 'HR'),
      organizationUnitName:
        org?.name ??
        (typeof jobInfo?.organizationUnitName === 'string'
          ? jobInfo.organizationUnitName
          : 'Phòng Nhân sự'),
      jobPositionId:
        pos?.id ??
        (typeof jobInfo?.jobPositionId === 'string'
          ? jobInfo.jobPositionId
          : undefined),
      jobPositionCode:
        pos?.code ??
        (typeof jobInfo?.jobPositionCode === 'string'
          ? jobInfo.jobPositionCode
          : 'STAFF'),
      jobPositionName:
        pos?.name ??
        (typeof jobInfo?.jobPositionName === 'string'
          ? jobInfo.jobPositionName
          : 'Nhân viên'),
      status:
        jobInfo?.status === 'InActive' || jobInfo?.status === 'OnProbation'
          ? jobInfo.status
          : 'Active',
    },
  };
  employeeStore.unshift(employee);
  syncEmployeeQualifications(employee.id, body.qualifications);
  return employee;
}

export function mergeEmployee(
  employee: EmployeeMock,
  body: Record<string, unknown>,
) {
  const { qualifications, ...employeeBody } = body;

  Object.assign(employee, {
    ...employeeBody,
    contact: employeeBody.contact
      ? {
          ...employee.contact,
          ...(employeeBody.contact as Partial<EmployeeContactMock>),
          id: employee.contact?.id ?? `contact-${employee.id}`,
          employeeId: employee.id,
        }
      : employee.contact,
  });

  if (employeeBody.jobInfo) {
    const { organizationUnit, jobPosition, ...restJobInfo } =
      employeeBody.jobInfo as Partial<EmployeeMock['jobInfo']> &
        NestedOrgPosition;

    employee.jobInfo = {
      ...employee.jobInfo,
      ...restJobInfo,
      ...(organizationUnit && {
        organizationUnitId:
          organizationUnit.id ?? employee.jobInfo.organizationUnitId,
        organizationUnitCode:
          organizationUnit.code ?? employee.jobInfo.organizationUnitCode,
        organizationUnitName:
          organizationUnit.name ?? employee.jobInfo.organizationUnitName,
      }),
      ...(jobPosition && {
        jobPositionId: jobPosition.id ?? employee.jobInfo.jobPositionId,
        jobPositionCode: jobPosition.code ?? employee.jobInfo.jobPositionCode,
        jobPositionName: jobPosition.name ?? employee.jobInfo.jobPositionName,
      }),
      id: employee.jobInfo.id ?? `job-${employee.id}`,
      employeeId: employee.id,
    };
  }

  employee.modifiedOnUtc = new Date().toISOString();
  employee.modifiedBy = getCurrentUserId();

  syncEmployeeQualifications(employee.id, qualifications);

  return employee;
}

function syncEmployeeQualifications(employeeId: string, value: unknown) {
  if (!Array.isArray(value)) return;

  for (let i = qualificationStore.length - 1; i >= 0; i--) {
    if (qualificationStore[i].employeeId === employeeId) {
      qualificationStore.splice(i, 1);
    }
  }

  value.forEach(item => {
    if (!item || typeof item !== 'object') return;
    const qualification = item as Partial<EmployeeQualificationMock>;

    qualificationStore.push({
      ...qualification,
      id:
        typeof qualification.id === 'string' && qualification.id
          ? qualification.id
          : uuidv4(),
      employeeId,
    });
  });
}
