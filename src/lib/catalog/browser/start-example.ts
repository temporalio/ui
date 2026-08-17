import {
  encodePayloads,
  setSearchAttributes,
} from '$lib/utilities/encode-payload';

import validateJsonSchema from './schema-validator';
import type { CatalogSessionStore } from './session-store';
import type {
  BrowserCatalogDescriptor,
  JsonObject,
  JsonSchema,
  JsonValue,
} from './types';
import type { ReadinessCheck, WorkbenchHost } from './workbench-host';

type EditorError =
  | 'invalid-schema'
  | 'invalid-json'
  | 'input-schema-mismatch'
  | 'required-readiness-unavailable'
  | 'unsupported-start-options'
  | 'unable-to-start';

type StartFromEditorsResult = { error: EditorError } | { started: true };

const parseJson = (source: string): JsonValue =>
  JSON.parse(source) as JsonValue;

const isJsonObject = (value: JsonValue): value is Record<string, JsonValue> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const executionIdOptionName = (
  kind: BrowserCatalogDescriptor['execution']['kind'],
): 'activityId' | 'operationId' | 'workflowId' =>
  kind === 'workflow'
    ? 'workflowId'
    : kind === 'standalone-activity'
      ? 'activityId'
      : 'operationId';

/**
 * The execution id an example pins in its start options. Examples that leave it
 * out get a fresh id per attempt, so there is nothing fixed to show or reuse.
 */
export const declaredExecutionId = (
  descriptor: Pick<BrowserCatalogDescriptor, 'execution'>,
  startOptions: JsonValue,
): string | undefined => {
  if (!isJsonObject(startOptions)) return undefined;

  const value = startOptions[executionIdOptionName(descriptor.execution.kind)];

  return typeof value === 'string' && value ? value : undefined;
};

const assertSynchronousSchema = (schema: JsonSchema): void => {
  if (isJsonObject(schema) && schema.$async === true) {
    throw new Error('Async JSON Schema validation is not supported');
  }
};

const opaqueSchemaValueKeywords = new Set([
  'const',
  'default',
  'enum',
  'examples',
]);

const findLocalSchemaAnchor = (
  value: JsonValue,
  anchor: string,
): JsonSchema | undefined => {
  if (Array.isArray(value)) {
    for (const member of value) {
      const found = findLocalSchemaAnchor(member, anchor);

      if (found !== undefined) return found;
    }

    return;
  }

  if (!isJsonObject(value)) return;
  if (value.$anchor === anchor) return value;

  for (const [keyword, nestedValue] of Object.entries(value)) {
    if (opaqueSchemaValueKeywords.has(keyword)) continue;

    const found = findLocalSchemaAnchor(nestedValue, anchor);

    if (found !== undefined) return found;
  }
};

const resolveLocalSchemaReference = (
  root: JsonSchema,
  reference: string,
): JsonSchema | undefined => {
  if (typeof root === 'boolean' || !reference.startsWith('#')) return;
  if (reference === '#') return root;

  if (!reference.startsWith('#/')) {
    try {
      return findLocalSchemaAnchor(
        root,
        decodeURIComponent(reference.slice(1)),
      );
    } catch {
      return;
    }
  }

  let resolved: JsonValue = root;

  for (const encodedSegment of reference.slice(2).split('/')) {
    const segment = encodedSegment.replaceAll('~1', '/').replaceAll('~0', '~');

    if (Array.isArray(resolved)) {
      if (!/^(0|[1-9]\d*)$/.test(segment)) return;

      const indexed: JsonValue | undefined = resolved[Number(segment)];

      if (indexed === undefined) return;
      resolved = indexed;
      continue;
    }

    if (!isJsonObject(resolved)) return;

    const property = resolved[segment];

    if (property === undefined) return;
    resolved = property;
  }

  if (typeof resolved === 'boolean' || isJsonObject(resolved)) {
    return resolved;
  }
};

const declaredStartOptionKeys = (
  schema: JsonSchema,
  root: JsonSchema = schema,
  visited: object[] = [],
): string[] => {
  const declared: string[] = [];
  const addDeclared = (property: string) => {
    if (!declared.includes(property)) declared.push(property);
  };

  if (typeof schema === 'boolean' || visited.includes(schema)) return declared;

  visited.push(schema);

  if (isJsonObject(schema.properties)) {
    for (const property of Object.keys(schema.properties)) {
      addDeclared(property);
    }
  }

  if (typeof schema.$ref === 'string') {
    const referenced = resolveLocalSchemaReference(root, schema.$ref);

    if (referenced !== undefined) {
      for (const property of declaredStartOptionKeys(
        referenced,
        root,
        visited,
      )) {
        addDeclared(property);
      }
    }
  }

  for (const keyword of ['allOf', 'anyOf', 'oneOf'] as const) {
    const members = schema[keyword];

    if (!Array.isArray(members)) continue;

    for (const member of members) {
      if (typeof member !== 'boolean' && !isJsonObject(member)) continue;

      for (const property of declaredStartOptionKeys(member, root, visited)) {
        addDeclared(property);
      }
    }
  }

  for (const keyword of ['if', 'then', 'else'] as const) {
    const member = schema[keyword];

    if (typeof member !== 'boolean' && !isJsonObject(member)) continue;

    for (const property of declaredStartOptionKeys(member, root, visited)) {
      addDeclared(property);
    }
  }

  return declared;
};

const matchesStartOptionsSchema = async (
  value: JsonValue,
  schema: JsonSchema,
): Promise<boolean> => {
  if (!isJsonObject(value)) return false;

  const matches = await validateJsonSchema(schema, value);
  const declared = declaredStartOptionKeys(schema);

  return matches && Object.keys(value).every((key) => declared.includes(key));
};

/**
 * Turns the shared start options into the shapes the start request expects.
 * Both hosts spread start options straight into that request, so the mapping
 * belongs here rather than in either host.
 */
export const encodeSharedStartOptions = async (
  startOptions: JsonValue,
): Promise<JsonValue> => {
  if (!isJsonObject(startOptions)) return startOptions;

  const { details, searchAttributes, summary, ...rest } = startOptions;
  const encoded: Record<string, JsonValue> = { ...rest };

  if (isJsonObject(searchAttributes) && Object.keys(searchAttributes).length) {
    encoded.searchAttributes = {
      indexedFields: setSearchAttributes(
        Object.entries(searchAttributes).map(([label, value]) => ({
          label,
          value,
        })) as never,
      ) as unknown as JsonValue,
    };
  }

  const [summaryPayload, detailsPayload] = await Promise.all(
    [summary, details].map(async (value) =>
      typeof value === 'string' && value
        ? ((
            await encodePayloads({
              input: JSON.stringify(value),
              encoding: 'json/plain',
            })
          )?.[0] as JsonValue | undefined)
        : undefined,
    ),
  );

  if (summaryPayload || detailsPayload) {
    encoded.userMetadata = {
      ...(summaryPayload ? { summary: summaryPayload } : {}),
      ...(detailsPayload ? { details: detailsPayload } : {}),
    };
  }

  return encoded;
};

export const startFromEditors = async ({
  descriptor,
  host,
  inputEditor,
  startOptionsEditor,
  sharedStartOptions,
  executionId,
  onReadiness,
  sessionStore,
}: {
  descriptor: BrowserCatalogDescriptor;
  host: WorkbenchHost;
  inputEditor: string;
  startOptionsEditor: string;
  /** Values collected from the shared start option controls, not the editor. */
  sharedStartOptions?: JsonObject;
  executionId?: string;
  onReadiness?: (checks: ReadinessCheck[]) => void;
  sessionStore: Pick<CatalogSessionStore, 'start'>;
}): Promise<StartFromEditorsResult> => {
  let input: JsonValue;
  let startOptions: JsonValue;

  try {
    input = parseJson(inputEditor);
    const editorStartOptions = parseJson(startOptionsEditor);
    startOptions =
      sharedStartOptions && isJsonObject(editorStartOptions)
        ? { ...editorStartOptions, ...sharedStartOptions }
        : editorStartOptions;
  } catch {
    return { error: 'invalid-json' };
  }

  let inputMatchesSchema: boolean;
  let startOptionsMatchSchema: boolean;

  try {
    assertSynchronousSchema(descriptor.input.schema);
    assertSynchronousSchema(descriptor.startOptions.schema);
    inputMatchesSchema = await validateJsonSchema(
      descriptor.input.schema,
      input,
    );
    startOptionsMatchSchema = await matchesStartOptionsSchema(
      startOptions,
      descriptor.startOptions.schema,
    );
  } catch {
    return { error: 'invalid-schema' };
  }

  if (!inputMatchesSchema) {
    return { error: 'input-schema-mismatch' };
  }

  if (!startOptionsMatchSchema) {
    return { error: 'unsupported-start-options' };
  }

  let readiness: ReadinessCheck[];

  try {
    readiness = await host.checkReadiness(descriptor.id);
  } catch {
    return { error: 'unable-to-start' };
  }
  onReadiness?.(readiness);

  if (
    readiness.some((check) => check.required && check.state === 'unavailable')
  ) {
    return { error: 'required-readiness-unavailable' };
  }

  const session = await sessionStore.start({
    descriptor,
    input,
    startOptions: await encodeSharedStartOptions(startOptions),
    executionId,
  });

  if (!session?.outcome) return { error: 'unable-to-start' };

  return { started: true };
};

export const startWithDefaults = ({
  descriptor,
  host,
  sessionStore,
}: {
  descriptor: BrowserCatalogDescriptor;
  host: WorkbenchHost;
  sessionStore: Pick<CatalogSessionStore, 'start'>;
}) =>
  startFromEditors({
    descriptor,
    host,
    inputEditor: JSON.stringify(descriptor.input.defaultValue),
    startOptionsEditor: JSON.stringify(descriptor.startOptions.defaultValue),
    sessionStore,
  });
