import _ from 'lodash';
import type { CreateEmployeeRequest } from '../../services/employee.api-types';
import type { Employee } from '../../types/employee';
import { removeTempId } from '@/shared/utils';

function transformCreateData(inputData: Employee): CreateEmployeeRequest {
  const outputData = _.cloneDeep(inputData) as Partial<Employee>;
  delete outputData.id;

  if (outputData.contact?.permanentAddress) {
    outputData.contact.permanentProvinceCode =
      outputData.contact.permanentAddress.provinceCode;
    outputData.contact.permanentDistrictCode =
      outputData.contact.permanentAddress.districtCode;
    outputData.contact.permanentWardCode =
      outputData.contact.permanentAddress.wardCode;

    delete outputData.contact.permanentAddress;
  }

  if (outputData.contact?.currentAddress) {
    outputData.contact.currentProvinceCode =
      outputData.contact.currentAddress.provinceCode;
    outputData.contact.currentDistrictCode =
      outputData.contact.currentAddress.districtCode;
    outputData.contact.currentWardCode =
      outputData.contact.currentAddress.wardCode;

    delete outputData.contact.currentAddress;
  }

  if (outputData.qualifications) {
    outputData.qualifications = outputData.qualifications.map(qualification => {
      const outputQualification = removeTempId(qualification);

      if (!outputQualification.employeeId) {
        delete (outputQualification as Partial<typeof outputQualification>)
          .employeeId;
      }

      return outputQualification;
    });
  }

  return outputData as CreateEmployeeRequest;
}

export default transformCreateData;
