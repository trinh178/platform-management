import _ from 'lodash';
import { UpdateEmployeeDocumentRequest } from '@/modules/employee/services/employee-documents.api-types';
import { EmployeeDocument } from '@/modules/employee/types/employee-document';

function transformUpdateData(
  inputData: EmployeeDocument,
): UpdateEmployeeDocumentRequest {
  const outputData = _.cloneDeep(inputData) as Partial<EmployeeDocument>;

  return outputData as UpdateEmployeeDocumentRequest;
}

export default transformUpdateData;
