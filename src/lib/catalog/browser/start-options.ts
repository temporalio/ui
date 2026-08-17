import type { JsonObject, JsonSchema, JsonValue } from './types';

/**
 * Start options every workflow example accepts. They are merged into each
 * example's declared schema when the catalog is generated, so authors describe
 * only what is specific to their example and still get the shared controls.
 */
export const catalogSharedStartOptionsSchema = {
  details: { type: 'string' },
  searchAttributes: { type: 'object' },
  summary: { type: 'string' },
  workflowStartDelay: { type: 'string' },
} as const satisfies Record<string, JsonObject>;

export const catalogSharedStartOptionNames = Object.keys(
  catalogSharedStartOptionsSchema,
);

const isJsonObject = (value: JsonValue): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Only workflow starts carry these options; standalone activity and Nexus
 * operation starts take a different request shape.
 */
export const withSharedCatalogStartOptions = (
  schema: JsonSchema,
): JsonSchema => {
  // `true` and `false` are deliberate declarations of "anything" and "nothing".
  // Rewriting them would override an author instead of filling in for one.
  if (!isJsonObject(schema)) return schema;

  const properties = isJsonObject(schema.properties) ? schema.properties : {};

  return {
    ...schema,
    type: 'object',
    properties: {
      ...catalogSharedStartOptionsSchema,
      ...properties,
    },
  };
};
