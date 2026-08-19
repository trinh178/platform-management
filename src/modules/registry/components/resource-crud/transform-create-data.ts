import _ from 'lodash';
import type { CreateResourceRequest } from '../../services/resource.api-types';
import type { Resource } from '../../types/resource';

function transformCreateData(inputData: Resource): CreateResourceRequest {
  const outputData = _.cloneDeep(inputData) as Partial<Resource>;
  delete outputData.id;
  delete outputData.domain;

  return outputData as CreateResourceRequest;
}

export default transformCreateData;
