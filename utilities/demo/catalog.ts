import { readFileSync } from 'fs';
import { join } from 'path';

import validateJsonSchema from '../../src/lib/catalog/browser/schema-validator';
import type {
  JsonSchema,
  JsonValue,
} from '../../src/lib/catalog/browser/types';

/**
 * The catalog's generated artifact is the source of truth for what an example
 * is and where it runs, so a definition names an example id and nothing else.
 */
const SHARED_GENERATED = join(
  'src',
  'lib',
  'catalog',
  'browser',
  'catalog.generated.json',
);

/** Local examples generate their own artifact, which the catalog page also reads. */
const LOCAL_GENERATED = join('catalog.local', 'catalog.generated.json');

export type CatalogExample = {
  id: string;
  title: string;
  description: string;
  kind: string;
  workflowType?: string;
  taskQueue?: string;
  targetId?: string;
  defaultInput: unknown[];
  inputSchema?: JsonSchema;
  source: string;
};

type Descriptor = {
  id: string;
  title: string;
  description: string;
  input?: { defaultValue?: unknown; schema?: JsonSchema };
  execution?: {
    kind?: string;
    workflowType?: string;
    taskQueue?: string;
    targetId?: string;
  };
  source?: { label?: string };
};

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : value === undefined ? [] : [value];

const readArtifact = (path: string): Descriptor[] | null => {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as {
      descriptors?: Descriptor[];
    };

    return parsed.descriptors ?? [];
  } catch {
    return null;
  }
};

const readDescriptors = (cwd: string): Descriptor[] => {
  const shared = readArtifact(join(cwd, SHARED_GENERATED));

  if (!shared) {
    throw new Error(
      `Could not read ${SHARED_GENERATED}. Run "pnpm catalog generate" first.`,
    );
  }

  // A local catalog is optional, and absent on a clean checkout.
  return [...shared, ...(readArtifact(join(cwd, LOCAL_GENERATED)) ?? [])];
};

export const listCatalogExamples = (cwd = process.cwd()): CatalogExample[] =>
  readDescriptors(cwd).map((descriptor) => ({
    id: descriptor.id,
    title: descriptor.title,
    description: descriptor.description,
    kind: descriptor.execution?.kind ?? 'unknown',
    workflowType: descriptor.execution?.workflowType,
    taskQueue: descriptor.execution?.taskQueue,
    targetId: descriptor.execution?.targetId,
    defaultInput: asArray(descriptor.input?.defaultValue),
    inputSchema: descriptor.input?.schema,
    source: descriptor.source?.label ?? 'unknown',
  }));

export const catalogExampleFor = (
  id: string,
  cwd = process.cwd(),
): CatalogExample => {
  const examples = listCatalogExamples(cwd);
  const example = examples.find((candidate) => candidate.id === id);

  if (!example) {
    throw new Error(
      [
        `The catalog has no example "${id}".`,
        'Run "pnpm catalog list" to see the ids. A local example you just',
        'created needs "pnpm catalog generate" before a demo can name it.',
      ].join('\n'),
    );
  }

  return example;
};

export const requireWorkflowExample = (
  id: string,
  cwd = process.cwd(),
): CatalogExample & { workflowType: string; taskQueue: string } => {
  const example = catalogExampleFor(id, cwd);

  if (
    example.kind !== 'workflow' ||
    !example.workflowType ||
    !example.taskQueue
  ) {
    throw new Error(
      `The catalog example "${id}" runs as "${example.kind}", so it cannot be started as a workflow.`,
    );
  }

  return {
    ...example,
    workflowType: example.workflowType,
    taskQueue: example.taskQueue,
  };
};

export const catalogExampleUrl = (
  base: string,
  namespace: string,
  id: string,
) => `${base}/namespaces/${namespace}/catalog/${encodeURIComponent(id)}`;

/**
 * Checks input against the example's own declared schema, so a definition
 * cannot quietly pass something the catalog page would reject.
 */
export const assertValidExampleInput = async (
  example: CatalogExample,
  input: readonly unknown[],
) => {
  if (!example.inputSchema) return;

  const valid = await validateJsonSchema(
    example.inputSchema,
    input as JsonValue,
  );

  if (valid) return;

  throw new Error(
    [
      `The input for the "${example.id}" catalog example does not match the schema the example declares.`,
      `Given: ${JSON.stringify(input)}`,
      `Schema: ${JSON.stringify(example.inputSchema)}`,
    ].join('\n'),
  );
};
