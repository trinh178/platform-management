import _ from 'lodash';
import type { CreateEmployeeRequest } from '@/modules/employee/services/employee.api-types';
import type { EmployeeQualification } from '@/modules/employee/types/employee-qualification';
import { removeTempId } from '@/shared/utils';

function transformCreateData(
  inputData: EmployeeQualification[] | undefined,
): CreateEmployeeRequest['qualifications'] {
  const outputData = _.cloneDeep(inputData);
  if (!outputData) return [];

  return outputData.map(item => {
    const outputItem = removeTempId(item);

    if (!outputItem.employeeId) {
      delete (outputItem as Partial<EmployeeQualification>).employeeId;
    }

    return outputItem;
  });
}

export default transformCreateData;
