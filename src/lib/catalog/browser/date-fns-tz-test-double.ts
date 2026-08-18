/**
 * The search attribute inputs reach date-fns-tz through the timezone helpers.
 * It ships CommonJS, and pre-bundling it made the catalog harnesses slow
 * enough to time out their setup hook. Catalog assertions never depend on a
 * converted time, so these stand in for the three functions that are called.
 */
export const utcToZonedTime = (date: Date | number | string): Date =>
  new Date(date);

export const format = (): string => 'UTC';

export const getTimezoneOffset = (): number => 0;
