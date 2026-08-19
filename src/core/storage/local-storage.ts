function _set(key: StorageKey, value: string | number) {
  localStorage.setItem(key, value.toString());
}

function _get(key: StorageKey) {
  return localStorage.getItem(key) || undefined;
}

export function set<T>(key: StorageKey, value: T) {
  _set(key, JSON.stringify(value));
}

export function get<T>(key: StorageKey) {
  try {
    const value = _get(key);
    if (!value) return undefined;
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(error); // TODO: error
    return undefined;
  }
}

export function exist(...keys: StorageKey[]) {
  for (const key of keys) {
    if (!_get(key)) return false;
  }
  return true;
}

export function remove(...keys: StorageKey[]) {
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

export function count() {
  return localStorage.length;
}

export function clear(...exceptKeys: StorageKey[]) {
  const excepts = exceptKeys
    .map(k => ({ key: k, value: _get(k) }))
    .filter(e => e.value);
  localStorage.clear();
  for (const e of excepts) {
    _set(e.key, e.value as string);
  }
}
