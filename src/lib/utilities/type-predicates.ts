export const isNotNullish = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined;

export const isNullish = (value: unknown): value is undefined | null =>
  value == null;
