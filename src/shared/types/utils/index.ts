type AnyFunction = (...args: unknown[]) => unknown;

export type DeepPartial<T> = T extends AnyFunction
  ? T
  : T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

export type DeepMap<T, To> =
  T extends Array<infer U>
    ? Array<DeepMap<U, To>>
    : T extends object
      ? { [K in keyof T]: DeepMap<T[K], To> }
      : To;
