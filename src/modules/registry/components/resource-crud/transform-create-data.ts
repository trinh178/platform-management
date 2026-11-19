import _ from 'lodash';
import type { CreateResourceRequest } from '../../services/resource.api-types';
import type { Resource } from '../../types/resource';
import { normalizeResourceActions } from '../../utils/permission-code';

function transformCreateData(inputData: Resource): CreateResourceRequest {
  const outputData = _.cloneDeep(inputData) as Partial<Resource>;
  delete outputData.id;
  delete outputData.domain;
  outputData.actions = normalizeResourceActions(outputData.actions);

  return outputData as CreateResourceRequest;
}

export default transformCreateData;
