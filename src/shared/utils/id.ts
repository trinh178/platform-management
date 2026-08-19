import { v4 as uuidv4 } from 'uuid';

const DEFAULT_TEMP_ID_PREFIX = 'tmp';

export function createTempId(prefix = DEFAULT_TEMP_ID_PREFIX) {
  return `${prefix}-${uuidv4()}`;
}

export function isTempId(id?: string, prefix = DEFAULT_TEMP_ID_PREFIX) {
  return !!id?.startsWith(`${prefix}-`);
}

export function removeTempId<TData extends { id?: string }>(
  data: TData,
  prefix = DEFAULT_TEMP_ID_PREFIX,
) {
  if (!isTempId(data.id, prefix)) return data;

  const outputData = { ...data };
  delete outputData.id;

  return outputData;
}
