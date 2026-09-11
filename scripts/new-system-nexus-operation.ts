/**
 * Scaffolds a new system Nexus operation.
 *
 *   pnpm system-nexus-operation:new StartWorkflowExecution
 *   pnpm system-nexus-operation:new StartWorkflowExecution --kind start-workflow --category workflow
 *
 * Creates src/lib/system-nexus-endpoints/<kind>/{schemas,definition}.ts and an
 * input renderer, then registers the operation in types.ts and index.ts.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MODULE_DIR = path.join(ROOT, 'src/lib/system-nexus-endpoints');

const fail = (message: string): never => {
  console.error(`✖ ${message}`);
  process.exit(1);
};

// ── args ─────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith('--'));
const flag = (name: string): string | undefined => {
  const match = argv.find((a) => a.startsWith(`--${name}=`));
  if (match) return match.slice(`--${name}=`.length);
  const idx = argv.indexOf(`--${name}`);
  return idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith('--')
    ? argv[idx + 1]
    : undefined;
};

const operationName = positional[0];
if (!operationName) {
  fail(
    'Usage: pnpm system-nexus-operation:new <OperationName> [--kind <slug>] [--category <timeline-category>] [--grouped]',
  );
}
if (!/^[A-Z][A-Za-z0-9]*$/.test(operationName)) {
  fail(
    `Operation name must be the proto operation in PascalCase, e.g. StartWorkflowExecution (got "${operationName}")`,
  );
}

const kebab = (value: string) =>
  value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const camel = (value: string) =>
  value.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
const words = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
const supportedTimelineCategories = new Set([
  'activity',
  'child-workflow',
  'local-activity',
  'nexus',
  'signal',
  'timer',
  'update',
  'workflow',
  'other',
]);

const kind = flag('kind') ?? kebab(operationName);
const timelineCategory = flag('category') ?? 'nexus';
const expandsIndividually = !argv.includes('--grouped');
const label = words(operationName);
const definitionExport = camel(kind);
const dir = path.join(MODULE_DIR, kind);

if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(kind)) {
  fail(
    `Kind must be a kebab-case path segment, e.g. start-workflow (got "${kind}")`,
  );
}
if (!supportedTimelineCategories.has(timelineCategory)) {
  fail(`Unsupported timeline category "${timelineCategory}"`);
}
const outputPath = path.relative(MODULE_DIR, dir);
if (outputPath.startsWith('..') || path.isAbsolute(outputPath)) {
  fail(`Kind resolves outside ${path.relative(ROOT, MODULE_DIR)}`);
}

if (existsSync(dir)) fail(`${path.relative(ROOT, dir)} already exists`);

// ── generated files ──────────────────────────────────────────────────────────

const schemas = `import {
  ${operationName}RequestSchema,
  ${operationName}ResponseSchema,
} from '@buf/temporalio_api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb.js';

export const REQUEST_MESSAGE_TYPE =
  'temporal.api.workflowservice.v1.${operationName}Request';
export const RESPONSE_MESSAGE_TYPE =
  'temporal.api.workflowservice.v1.${operationName}Response';

export const requestSchema = ${operationName}RequestSchema;
export const responseSchema = ${operationName}ResponseSchema;
`;

const inputRenderer = `<script lang="ts">
  import PayloadCodeBlock from '$lib/components/payload/payload-code-block.svelte';
  import type { Payload } from '$lib/types';
  import { decodeBinaryProtobuf } from '$lib/utilities/decode-binary-protobuf';

  import type { SystemNexusInputRendererProps } from '../types';
  import { requestSchema } from './schemas';

  let { payload, maxHeight }: SystemNexusInputRendererProps = $props();

  const decoded = $derived(
    decodeBinaryProtobuf(payload, requestSchema)?.data as
      | Record<string, unknown>
      | undefined,
  );

  const payloadsFrom = (value: unknown): Payload[] | null => {
    if (!value || typeof value !== 'object') return null;
    const payloads = (value as Record<string, unknown>).payloads;
    return Array.isArray(payloads) ? (payloads as Payload[]) : null;
  };

  // TODO: surface the panels this operation needs.
  const input = $derived(payloadsFrom(decoded?.input));
</script>

<div class="flex flex-col gap-2">
  <PayloadCodeBlock value={input ?? { payloads: [] }} {maxHeight} />
</div>
`;

const definition = `import type { DescMessage } from '@bufbuild/protobuf';

import type { Payload } from '$lib/types';
import type { WorkflowEvent } from '$lib/types/events';
import { decodeBinaryProtobuf } from '$lib/utilities/decode-binary-protobuf';
import {
  isNexusOperationCompletedEvent,
  isNexusOperationScheduledEvent,
} from '$lib/utilities/is-event-type';

import {
  initiatedEventLink,
  stateFor,
  targetExecutionLink,
  targetFromEventLinks,
} from '../shared';
import type {
  SystemNexusContext,
  SystemNexusLink,
  SystemNexusOperationDefinition,
} from '../types';
import {
  REQUEST_MESSAGE_TYPE,
  requestSchema,
  RESPONSE_MESSAGE_TYPE,
  responseSchema,
} from './schemas';

import InputRenderer from './input-renderer.svelte';

const LABEL = '${label}';

// Remaps the Nexus event-name suffix. Adjust the verbs to match the design.
const STATE_VERBS: Record<string, string> = {
  Scheduled: 'Initiated',
  Completed: 'Delivered',
  Failed: 'Failed',
  TimedOut: 'Timed Out',
  Canceled: 'Canceled',
};

const HIDDEN_FIELDS = ['endpoint', 'service', 'operation', 'requestId'];

type Decoded = Record<string, unknown>;

const getString = (v: unknown): string | undefined =>
  typeof v === 'string' && v ? v : undefined;

const decodeWith = (payload: Payload, schema: DescMessage) =>
  (decodeBinaryProtobuf(payload, schema)?.data as Decoded) ?? null;

export const ${definitionExport}: SystemNexusOperationDefinition = {
  kind: '${kind}',
  operationName: '${operationName}',
  requestMessageType: REQUEST_MESSAGE_TYPE,
  responseMessageType: RESPONSE_MESSAGE_TYPE,
  requestSchema,
  responseSchema,
  label: LABEL,
  stateVerbs: STATE_VERBS,
  hiddenFields: HIDDEN_FIELDS,
  timelineCategory: '${timelineCategory}',
  expandsIndividually: ${expandsIndividually},
  InputRenderer,

  describeInitiated: (event: WorkflowEvent, context: SystemNexusContext) => {
    if (!isNexusOperationScheduledEvent(event)) return null;
    const input = event.nexusOperationScheduledEventAttributes?.input;
    const decoded = input ? decodeWith(input as Payload, requestSchema) : null;

    // TODO: pull the fields this operation should surface off \`decoded\`.
    const workflowId = getString(decoded?.workflowId);
    const link = workflowId
      ? targetExecutionLink(
          { namespace: getString(decoded?.namespace), workflowId },
          context,
        )
      : null;

    return {
      displayName: \`\${LABEL} \${stateFor(event, STATE_VERBS)}\`,
      hiddenFields: HIDDEN_FIELDS,
      links: link ? [link] : [],
    };
  },

  describeTerminal: (event: WorkflowEvent, context: SystemNexusContext) => {
    if (!isNexusOperationCompletedEvent(event)) return null;
    const attrs = event.nexusOperationCompletedEventAttributes;
    const result = attrs?.result;
    if (!result) return null;

    const decoded = decodeWith(result as Payload, responseSchema);
    if (!decoded) return null;

    const links: SystemNexusLink[] = [];
    const initiatedEventId =
      attrs?.scheduledEventId === undefined || attrs?.scheduledEventId === null
        ? undefined
        : String(attrs.scheduledEventId);
    if (initiatedEventId)
      links.push(initiatedEventLink(initiatedEventId, context));

    const target = targetFromEventLinks(event);
    const link = target ? targetExecutionLink(target, context) : null;
    if (link) links.push(link);

    return {
      displayName: \`\${LABEL} \${stateFor(event, STATE_VERBS)}\`,
      hiddenFields: [...HIDDEN_FIELDS, 'scheduledEventId'],
      links,
    };
  },
};
`;

// ── registration ─────────────────────────────────────────────────────────────

const typesPath = path.join(MODULE_DIR, 'types.ts');
const indexPath = path.join(MODULE_DIR, 'index.ts');

let types = readFileSync(typesPath, 'utf8');
const kindMatch = types.match(
  /export type SystemNexusOperationKind =\s*([^;]+);/,
);
if (!kindMatch) fail('Could not find SystemNexusOperationKind in types.ts');
if (kindMatch[1].includes(`'${kind}'`))
  fail(`kind "${kind}" is already registered`);
types = types.replace(
  kindMatch[0],
  `export type SystemNexusOperationKind =\n  | ${kindMatch[1].trim()}\n  | '${kind}';`,
);

let index = readFileSync(indexPath, 'utf8');
const opsMatch = index.match(
  /const OPERATIONS: SystemNexusOperationDefinition\[\] = \[([^\]]*)\];/,
);
if (!opsMatch) fail('Could not find the OPERATIONS array in index.ts');

const existingImport = index.match(
  /import \{ \w+ \} from '\.\/[^']+\/definition';\n/,
);
if (!existingImport) fail('Could not find a definition import in index.ts');
index = index.replace(
  existingImport[0],
  `${existingImport[0]}import { ${definitionExport} } from './${kind}/definition';\n`,
);
index = index.replace(
  opsMatch[0],
  `const OPERATIONS: SystemNexusOperationDefinition[] = [\n  ${opsMatch[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat(definitionExport)
    .join(',\n  ')},\n];`,
);

// ── write ────────────────────────────────────────────────────────────────────

mkdirSync(dir, { recursive: true });
writeFileSync(path.join(dir, 'schemas.ts'), schemas);
writeFileSync(path.join(dir, 'definition.ts'), definition);
writeFileSync(path.join(dir, 'input-renderer.svelte'), inputRenderer);
writeFileSync(typesPath, types);
writeFileSync(indexPath, index);

const rel = path.relative(ROOT, dir);
console.log(`✔ Scaffolded ${label}

  ${rel}/schemas.ts
  ${rel}/definition.ts
  ${rel}/input-renderer.svelte

  registered kind '${kind}' in types.ts and index.ts

Next:
  1. Confirm the @buf schema names in schemas.ts match the generated package.
  2. Fill in the TODOs in definition.ts and input-renderer.svelte.
  3. pnpm lint && pnpm check && pnpm test -- --run
`);
