import _ from 'lodash';
import type { CreateAppRequest } from '../../services/app.api-types';
import type { App } from '../../types/app';

function transformCreateData(inputData: App): CreateAppRequest {
  const outputData = _.cloneDeep(inputData) as Partial<App>;
  delete outputData.id;

  return outputData as CreateAppRequest;
}

export default transformCreateData;
