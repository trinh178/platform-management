import _ from 'lodash';
import type { CreateDomainRequest } from '../../services/domain.api-types';
import type { Domain } from '../../types/domain';

function transformCreateData(inputData: Domain): CreateDomainRequest {
  const outputData = _.cloneDeep(inputData) as Partial<Domain>;
  delete outputData.id;
  delete outputData.service;

  return outputData as CreateDomainRequest;
}

export default transformCreateData;
