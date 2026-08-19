import { AddressCode } from '@/shared/components/address';

export type EmployeeContact = {
  id: string;

  /* Thông tin chung */
  personalPhoneNumber?: string;
  officePhoneNumber?: string;
  personalEmail?: string;
  officeEmail?: string;

  /* Thường trú */
  permanentCountryCode?: string;
  permanentProvinceCode?: number;
  permanentDistrictCode?: number;
  permanentWardCode?: number;
  permanentAddress?: AddressCode;
  permanentStreet?: string;
  registrationBookNumber?: string;

  /* Tạm trú */
  currentCountryCode?: string;
  currentProvinceCode?: number;
  currentDistrictCode?: number;
  currentWardCode?: number;
  currentAddress?: AddressCode;
  currentStreet?: string;

  /* Liên hệ khẩn cấp */
  emergencyFullName?: string;
  emergencyRelationship?: string;
  emergencyPhoneNumber?: string;
  emergencyAddFullName?: string;
  emergencyAddRelationship?: string;
  emergencyAddPhoneNumber?: string;

  /* Relations */
  employeeId: string;
};
