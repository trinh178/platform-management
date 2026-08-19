import _ from 'lodash';
import type { CreateServiceRequest } from '../../services/service.api-types';
import type { Service } from '../../types/service';

function transformCreateData(inputData: Service): CreateServiceRequest {
  const outputData = _.cloneDeep(inputData) as Partial<Service>;
  delete outputData.id;

  return outputData as CreateServiceRequest;
}

export default transformCreateData;
