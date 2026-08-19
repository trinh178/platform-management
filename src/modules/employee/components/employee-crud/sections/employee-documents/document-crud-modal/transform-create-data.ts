import _ from 'lodash';
import { CreateEmployeeDocumentRequest } from '@/modules/employee/services/employee-documents.api-types';
import { EmployeeDocument } from '@/modules/employee/types/employee-document';

function transformCreateData(
  inputData: EmployeeDocument,
): CreateEmployeeDocumentRequest {
  const outputData = _.cloneDeep(inputData) as Partial<EmployeeDocument>;
  delete outputData.id;

  return outputData as CreateEmployeeDocumentRequest;
}

export default transformCreateData;
