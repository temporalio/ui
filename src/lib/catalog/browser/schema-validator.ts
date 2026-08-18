import {
  registerSchema,
  validate,
  type Validator,
} from '@hyperjump/json-schema/draft-2020-12';

import type { JsonObject, JsonSchema, JsonValue } from './types';

const draft202012Dialect = 'https://json-schema.org/draft/2020-12/schema';
let schemaSequence = 0;
const booleanValidators = new Map<boolean, Promise<Validator>>();
const objectValidators = new WeakMap<JsonObject, Promise<Validator>>();
const opaqueValueKeywords = new Set(['const', 'default', 'enum', 'examples']);

const assertOnlyLocalReferences = (value: JsonValue): void => {
  if (Array.isArray(value)) {
    value.forEach(assertOnlyLocalReferences);
    return;
  }

  if (value === null || typeof value !== 'object') {
    return;
  }

  Object.entries(value).forEach(([keyword, nestedValue]) => {
    if (opaqueValueKeywords.has(keyword)) return;

    if (
      (keyword === '$ref' || keyword === '$dynamicRef') &&
      typeof nestedValue === 'string' &&
      nestedValue !== '' &&
      !nestedValue.startsWith('#')
    ) {
      throw new Error('External JSON Schema references are not supported');
    }

    assertOnlyLocalReferences(nestedValue);
  });
};

const compileSchema = (schema: JsonSchema): Promise<Validator> =>
  Promise.resolve().then(() => {
    assertOnlyLocalReferences(schema);

    const retrievalUri = `urn:temporal:catalog:schema:${schemaSequence++}`;
    registerSchema(schema, retrievalUri, draft202012Dialect);

    return validate(retrievalUri);
  });

const getValidator = (schema: JsonSchema): Promise<Validator> => {
  if (typeof schema === 'boolean') {
    const cachedValidator = booleanValidators.get(schema);

    if (cachedValidator) {
      return cachedValidator;
    }

    const validator = compileSchema(schema);
    booleanValidators.set(schema, validator);
    return validator;
  }

  const cachedValidator = objectValidators.get(schema);

  if (cachedValidator) {
    return cachedValidator;
  }

  const validator = compileSchema(schema);
  objectValidators.set(schema, validator);
  return validator;
};

const validateJsonSchema = async (
  schema: JsonSchema,
  value: JsonValue,
): Promise<boolean> => {
  const validator = await getValidator(schema);

  return validator(value).valid;
};

export default validateJsonSchema;
