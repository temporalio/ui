import { z } from 'zod';

/**
 * Schema for validating if an object has any properties.
 */
const nonEmptyObjectSchema = z
  .record(z.unknown())
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Object must have at least one property',
  });

/**
 * Creates a type guard that checks if an object has specific properties
 * @param properties The properties that must exist on the object
 * @returns A type guard function that validates if an object contains the specified properties
 */
export function createHasPropertiesSchema<K extends string>(
  ...properties: K[]
) {
  // Create a schema with all required properties
  return z.object(
    properties.reduce(
      (acc, prop) => {
        acc[prop] = z.unknown();
        return acc;
      },
      {} as Record<K, z.ZodTypeAny>,
    ),
  );
}

/**
 * Checks if a value is an object with specific properties
 * @param target The value to check
 * @param properties The properties that must exist on the object
 * @returns A type guard that narrows the type to an object with the specified properties
 */
export const has = <K extends string, V = unknown>(
  target: unknown,
  ...properties: K[]
): target is Record<K, V> => {
  // Create a schema that validates the required properties
  const schema = createHasPropertiesSchema(...properties);
  return schema.safeParse(target).success;
};

/**
 * Checks if a value is a non-empty object
 * @param obj The value to check
 * @returns A type guard that narrows the type to a non-empty object
 */
export const hasAnyProperties = (
  obj: unknown,
): obj is Record<string, unknown> => {
  // Schema for non-empty object

  return nonEmptyObjectSchema.safeParse(obj).success;
};
