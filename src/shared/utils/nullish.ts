export function withNullForUndefined<T extends object, K extends keyof T>(
  data: T,
  keys: readonly K[],
): T {
  const result = { ...data };

  keys.forEach(key => {
    if (result[key] === undefined) {
      result[key] = null as T[K];
    }
  });

  return result;
}
