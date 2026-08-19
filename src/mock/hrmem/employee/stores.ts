import type {
  EmployeeDocumentMock,
  EmployeeMock,
  EmployeeQualificationMock,
} from './mock-types';
import { CURRENT_USER_ID, MOCK_USER_ID } from '@/mock/constants';

export const employeeStore: EmployeeMock[] = [
  {
    id: 'fbed7e14-dc85-4ac6-9a2b-db4cc349d771',
    userId: MOCK_USER_ID.EMP_001,
    employeeCode: 'EMP-001',
    firstName: 'Vũ',
    lastName: 'Phạm Quang',
    avatar: 'https://i.pravatar.cc/150?u=fbed7e14-dc85-4ac6-9a2b-db4cc349d771',
    jobInfo: {
      jobPositionName: 'Tài xế',
      jobPositionCode: 'DRIVER',
      organizationUnitName: 'Đội xe',
      organizationUnitCode: 'FLEET',
      status: 'Active',
      managerId: 'a1b2c3d4-0005-0000-0000-000000000005',
    },
  },
  {
    id: '65f119dc-579e-4006-8a32-e900c833bf70',
    userId: MOCK_USER_ID.EMP_002,
    employeeCode: 'EMP-002',
    firstName: 'Thuý',
    lastName: 'Nguyễn Thị',
    avatar: 'https://i.pravatar.cc/150?u=65f119dc-579e-4006-8a32-e900c833bf70',
    jobInfo: {
      jobPositionName: 'Nhân viên Nhân sự',
      jobPositionCode: 'HR_STAFF',
      organizationUnitName: 'Phòng Nhân sự',
      organizationUnitCode: 'HR',
      status: 'Active',
      managerId: 'a1b2c3d4-0003-0000-0000-000000000003',
    },
  },
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    userId: MOCK_USER_ID.EMP_003,
    employeeCode: 'EMP-003',
    firstName: 'Nam',
    lastName: 'Trần Văn',
    avatar: 'https://i.pravatar.cc/150?u=a1b2c3d4-0001-0000-0000-000000000001',
    jobInfo: {
      jobPositionName: 'Trưởng phòng Vận hành',
      jobPositionCode: 'OPS_MANAGER',
      organizationUnitName: 'Phòng Vận hành',
      organizationUnitCode: 'OPS',
      status: 'Active',
      managerId: 'a1b2c3d4-0003-0000-0000-000000000003',
    },
  },
  {
    id: 'a1b2c3d4-0002-0000-0000-000000000002',
    userId: MOCK_USER_ID.EMP_004,
    employeeCode: 'EMP-004',
    firstName: 'Hà',
    lastName: 'Lê Thị',
    avatar: 'https://i.pravatar.cc/150?u=a1b2c3d4-0002-0000-0000-000000000002',
    jobInfo: {
      jobPositionName: 'Kế toán',
      jobPositionCode: 'ACCOUNTANT',
      organizationUnitName: 'Phòng Tài chính',
      organizationUnitCode: 'FIN',
      status: 'Active',
      managerId: 'a1b2c3d4-0003-0000-0000-000000000003',
    },
  },
  {
    id: 'a1b2c3d4-0003-0000-0000-000000000003',
    userId: MOCK_USER_ID.EMP_005,
    employeeCode: 'EMP-005',
    firstName: 'Minh',
    lastName: 'Ngô Đức',
    avatar: 'https://i.pravatar.cc/150?u=a1b2c3d4-0003-0000-0000-000000000003',
    jobInfo: {
      jobPositionName: 'Giám đốc',
      jobPositionCode: 'DIRECTOR',
      organizationUnitName: 'Ban Giám đốc',
      organizationUnitCode: 'BOD',
      status: 'Active',
    },
  },
  {
    id: 'a1b2c3d4-0004-0000-0000-000000000004',
    userId: MOCK_USER_ID.EMP_006,
    employeeCode: 'EMP-006',
    firstName: 'Linh',
    lastName: 'Hoàng Thị',
    avatar: 'https://i.pravatar.cc/150?u=a1b2c3d4-0004-0000-0000-000000000004',
    jobInfo: {
      jobPositionName: 'Tài xế',
      jobPositionCode: 'DRIVER',
      organizationUnitName: 'Đội xe',
      organizationUnitCode: 'FLEET',
      status: 'OnProbation',
      managerId: 'a1b2c3d4-0005-0000-0000-000000000005',
    },
  },
  {
    id: 'a1b2c3d4-0005-0000-0000-000000000005',
    userId: MOCK_USER_ID.EMP_007,
    employeeCode: 'EMP-007',
    firstName: 'Hùng',
    lastName: 'Đinh Văn',
    avatar: 'https://i.pravatar.cc/150?u=a1b2c3d4-0005-0000-0000-000000000005',
    jobInfo: {
      jobPositionName: 'Quản lý Đội xe',
      jobPositionCode: 'FLEET_MANAGER',
      organizationUnitName: 'Đội xe',
      organizationUnitCode: 'FLEET',
      status: 'Active',
      managerId: 'a1b2c3d4-0003-0000-0000-000000000003',
    },
  },
];

export const qualificationStore: EmployeeQualificationMock[] = [
  {
    id: 'e9f0a1b2-0001-4c3d-9e4f-d00000000001',
    employeeId: 'fbed7e14-dc85-4ac6-9a2b-db4cc349d771',
    type: 'Certification',
    institution: 'Tổng cục Đường bộ Việt Nam',
    major: 'Vận tải',
    level: 'B2',
    issueDate: '2021-03-15T00:00:00.000Z',
    expiryDate: '2031-03-15T00:00:00.000Z',
    note: 'Giấy phép lái xe',
  },
  {
    id: 'e9f0a1b2-0002-4c3d-9e4f-d00000000002',
    employeeId: '65f119dc-579e-4006-8a32-e900c833bf70',
    type: 'Education',
    institution: 'Đại học Kinh tế TP.HCM',
    major: 'Quản trị nhân lực',
    level: 'Cử nhân',
    issueDate: '2018-07-01T00:00:00.000Z',
  },
  {
    id: 'e9f0a1b2-0003-4c3d-9e4f-d00000000003',
    employeeId: 'a1b2c3d4-0001-0000-0000-000000000001',
    type: 'Certification',
    institution: 'PMI',
    major: 'Project Management',
    level: 'PMP',
    issueDate: '2022-09-01T00:00:00.000Z',
    expiryDate: '2025-09-01T00:00:00.000Z',
  },
];

export const documentStore: EmployeeDocumentMock[] = [
  {
    id: 'f0a1b2c3-0001-4d4e-af5b-e00000000001',
    employeeId: 'fbed7e14-dc85-4ac6-9a2b-db4cc349d771',
    name: 'CCCD',
    fileName: 'cccd-emp-001.pdf',
    fileId: 'b2c3d4e5-0001-4f6a-9b7c-f00000000001',
    note: 'Bản scan CCCD',
  },
  {
    id: 'f0a1b2c3-0002-4d4e-af5b-e00000000002',
    employeeId: '65f119dc-579e-4006-8a32-e900c833bf70',
    name: 'Hợp đồng lao động',
    fileName: 'contract-emp-002.pdf',
    fileId: 'b2c3d4e5-0002-4f6a-9b7c-f00000000002',
    note: 'Hợp đồng chính thức',
  },
  {
    id: 'f0a1b2c3-0003-4d4e-af5b-e00000000003',
    employeeId: 'a1b2c3d4-0001-0000-0000-000000000001',
    name: 'Chứng chỉ quản lý dự án',
    fileName: 'pmp-emp-003.pdf',
    fileId: 'b2c3d4e5-0003-4f6a-9b7c-f00000000003',
  },
];

const JOB_POSITION_UUID: Record<string, string> = {
  DIRECTOR: 'f6a7b8c9-0001-4d1e-bf2a-400000000001',
  HR_MANAGER: 'f6a7b8c9-0002-4d1e-bf2a-400000000002',
  HR_STAFF: 'f6a7b8c9-0003-4d1e-bf2a-400000000003',
  OPS_MANAGER: 'f6a7b8c9-0004-4d1e-bf2a-400000000004',
  FLEET_MANAGER: 'f6a7b8c9-0005-4d1e-bf2a-400000000005',
  DRIVER: 'f6a7b8c9-0006-4d1e-bf2a-400000000006',
  FIN_MANAGER: 'f6a7b8c9-0007-4d1e-bf2a-400000000007',
  ACCOUNTANT: 'f6a7b8c9-0008-4d1e-bf2a-400000000008',
};

const ORG_UNIT_UUID: Record<string, string> = {
  BOD: 'e5f6a7b8-0001-4c9d-ae1f-300000000001',
  HR: 'e5f6a7b8-0002-4c9d-ae1f-300000000002',
  OPS: 'e5f6a7b8-0003-4c9d-ae1f-300000000003',
  FLEET: 'e5f6a7b8-0004-4c9d-ae1f-300000000004',
  FIN: 'e5f6a7b8-0005-4c9d-ae1f-300000000005',
};

function enrichEmployeeStore() {
  employeeStore.forEach((employee, index) => {
    const ordinal = index + 1;
    employee.gender ??= ordinal % 2 === 0 ? 'Female' : 'Male';
    employee.dateOfBirth ??= `199${index % 9}-0${(index % 8) + 1}-15T00:00:00.000Z`;
    employee.placeOfBirth ??= 'TP. Hồ Chí Minh';
    employee.placeOfOrigin ??= 'Việt Nam';
    employee.maritalStatus ??= ordinal % 3 === 0 ? 'Married' : 'Single';
    employee.ethnicity ??= 'Kinh';
    employee.religion ??= 'Không';
    employee.nationality ??= 'VN';
    employee.idNumber ??= `079${String(100000000 + ordinal).slice(1)}`;
    employee.idDateOfIssue ??= `2020-0${(index % 8) + 1}-10T00:00:00.000Z`;
    employee.idPlaceOfIssue ??= 'Cục Cảnh sát QLHC về TTXH';
    employee.idDateOfExpiry ??= `2030-0${(index % 8) + 1}-10T00:00:00.000Z`;
    employee.educationLevel ??= 'Đại học';
    employee.qualificationLevel ??= 'Cử nhân';
    employee.institution ??= 'Đại học Quốc gia TP.HCM';
    employee.major ??= employee.jobInfo.jobPositionName;
    employee.graduationYear ??= 2015 + (index % 8);
    employee.classification ??= 'Khá';
    employee.contact ??= {
      id: `contact-${employee.id}`,
      employeeId: employee.id,
      personalPhoneNumber: `090${String(1000000 + ordinal).slice(1)}`,
      officePhoneNumber: `028${String(30000000 + ordinal).slice(1)}`,
      personalEmail: `${employee.employeeCode.toLowerCase()}@example.com`,
      officeEmail: `${employee.employeeCode.toLowerCase()}@hva.example`,
      permanentCountryCode: 'VN',
      permanentProvinceCode: 79,
      permanentDistrictCode: 760,
      permanentWardCode: 26734,
      permanentStreet: `${ordinal} Nguyễn Huệ`,
      registrationBookNumber: `HK-${String(ordinal).padStart(4, '0')}`,
      currentCountryCode: 'VN',
      currentProvinceCode: 79,
      currentDistrictCode: 760,
      currentWardCode: 26734,
      currentStreet: `${ordinal} Lê Lợi`,
      emergencyFullName: 'Nguyễn Văn A',
      emergencyRelationship: 'Người thân',
      emergencyPhoneNumber: `091${String(1000000 + ordinal).slice(1)}`,
    };
    employee.jobInfo.id ??= `job-${employee.id}`;
    employee.jobInfo.employeeId ??= employee.id;
    employee.jobInfo.hireDate ??= `2021-0${(index % 8) + 1}-01T00:00:00.000Z`;
    employee.jobInfo.probationDate ??= `2021-0${(index % 8) + 1}-01T00:00:00.000Z`;
    employee.jobInfo.officialDate ??= `2021-0${(index % 8) + 2}-01T00:00:00.000Z`;
    employee.jobInfo.jobPositionId ??=
      JOB_POSITION_UUID[employee.jobInfo.jobPositionCode];
    employee.jobInfo.organizationUnitId ??=
      ORG_UNIT_UUID[employee.jobInfo.organizationUnitCode];
    employee.createdBy ??= CURRENT_USER_ID;
    employee.createdOnUtc ??= `2021-0${(index % 8) + 1}-01T00:00:00.000Z`;
    employee.modifiedBy ??= CURRENT_USER_ID;
    employee.modifiedOnUtc ??= `2024-0${(index % 8) + 1}-01T00:00:00.000Z`;
  });
}

enrichEmployeeStore();
