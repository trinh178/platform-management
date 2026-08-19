/* eslint-disable @typescript-eslint/no-explicit-any */
type IsPlainObject<T> = T extends object
  ? T extends any[]
    ? false
    : true
  : false;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type FlattenObject<
  T,
  V = unknown,
  Prefix extends string = '',
> = UnionToIntersection<
  {
    [K in keyof T & string]-?: undefined extends T[K]
      ? IsPlainObject<NonNullable<T[K]>> extends true
        ? { [P in `${Prefix}${K}`]?: V } & FlattenObject<
            NonNullable<T[K]>,
            V,
            `${Prefix}${K}.`
          >
        : { [P in `${Prefix}${K}`]?: V }
      : IsPlainObject<T[K]> extends true
        ? { [P in `${Prefix}${K}`]: V } & FlattenObject<
            T[K],
            V,
            `${Prefix}${K}.`
          >
        : { [P in `${Prefix}${K}`]: V };
  }[keyof T & string]
>;
