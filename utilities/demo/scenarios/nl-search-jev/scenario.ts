import { createRequire } from 'node:module';

import {
  Client,
  Connection,
  WorkflowIdConflictPolicy,
} from '@temporalio/client';
import {
  defineSearchAttributeKey,
  SearchAttributeType,
  TypedSearchAttributes,
} from '@temporalio/common';
import protoPkg from '@temporalio/proto';
import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';
import { z } from 'zod';

import { DATASET, DEMO_SEARCHES } from './dataset';
import type { Scenario, ScenarioContext, ScenarioResult } from '../../scenario';

const require = createRequire(import.meta.url);

export type Options = z.input<typeof optionsSchema>;

const optionsSchema = z.strictObject({
  taskQueue: z.string().default('nl-search-jev-demo'),
  /** How long the running workflows stay open, so a recording can find them. */
  openSeconds: z
    .number()
    .int()
    .positive()
    .default(4 * 60 * 60),
});

export const CUSTOMER_TIER = defineSearchAttributeKey(
  'CustomerTier',
  SearchAttributeType.KEYWORD,
);
export const ATTEMPTS = defineSearchAttributeKey(
  'Attempts',
  SearchAttributeType.INT,
);

const { IndexedValueType } = protoPkg.temporal.api.enums.v1;

/** The custom search attributes the dataset sets, with their indexed types. */
const SEARCH_ATTRIBUTES = {
  CustomerTier: IndexedValueType.INDEXED_VALUE_TYPE_KEYWORD,
  Attempts: IndexedValueType.INDEXED_VALUE_TYPE_INT,
};

/**
 * The server stage registers these when it starts a server, but not when it
 * reuses one that is already listening, such as the one `pnpm dev` runs. Adding
 * the missing ones here makes the scenario work against either.
 */
const ensureSearchAttributes = async (
  connection: Connection,
  namespace: string,
  log: ScenarioContext['log'],
) => {
  const { customAttributes = {} } =
    await connection.operatorService.listSearchAttributes({ namespace });
  const missing = Object.entries(SEARCH_ATTRIBUTES).filter(
    ([name]) => !(name in customAttributes),
  );
  if (!missing.length) return;

  await connection.operatorService.addSearchAttributes({
    namespace,
    searchAttributes: Object.fromEntries(missing),
  });
  log(
    `Registered the search attributes ${missing.map(([name]) => name).join(', ')}`,
  );
};

const TYPESAFE_KEYS = [
  'TEMPORAL_TYPESAFE_API_KEY',
  'TEMPORAL_NL_SEARCH_API_KEY',
];

const preflight = async () => {
  if (TYPESAFE_KEYS.some((key) => process.env[key])) return;
  throw new Error(
    [
      'This demo calls TypeSafe (Jev), so the ui-server needs an API key.',
      'Run it as: TEMPORAL_TYPESAFE_API_KEY=<key> pnpm demo start nl-search-jev',
      'Without a key the ui-server turns natural-language search and history review off.',
    ].join('\n'),
  );
};

const run = async (
  { address, namespace, log }: ScenarioContext,
  rawOptions: Record<string, unknown>,
): Promise<ScenarioResult> => {
  const options = optionsSchema.parse(rawOptions);

  Runtime.install({ logger: new DefaultLogger('WARN') });

  const worker = await Worker.create({
    connection: await NativeConnection.connect({ address }),
    workflowsPath: require.resolve('./workflows'),
    taskQueue: options.taskQueue,
    namespace,
  });

  const connection = await Connection.connect({ address });
  const client = new Client({ connection, namespace });
  await ensureSearchAttributes(connection, namespace, log);

  const handles = await Promise.all(
    DATASET.map((item) =>
      client.workflow.start(item.workflowType, {
        taskQueue: options.taskQueue,
        workflowId: item.workflowId,
        workflowIdConflictPolicy: WorkflowIdConflictPolicy.TERMINATE_EXISTING,
        args: [{ outcome: item.outcome, openSeconds: options.openSeconds }],
        typedSearchAttributes: new TypedSearchAttributes([
          { key: CUSTOMER_TIER, value: item.customerTier },
          { key: ATTEMPTS, value: item.attempts },
        ]),
      }),
    ),
  );
  log(
    `Started ${handles.length} workflows on the "${options.taskQueue}" task queue`,
  );

  const closing = handles.filter(
    (_, index) => DATASET[index].outcome !== 'run',
  );
  await worker.runUntil(
    Promise.allSettled(closing.map((handle) => handle.result())),
  );
  log(
    `${closing.length} workflows closed; ${handles.length - closing.length} stay running`,
  );

  return {
    workflows: DATASET.map((item, index) => ({
      role: `${item.workflowType}, ${item.outcome === 'run' ? 'running' : item.outcome === 'fail' ? 'failed' : 'completed'}`,
      workflowId: item.workflowId,
      runId: handles[index].firstExecutionRunId,
      note: `CustomerTier ${item.customerTier}, Attempts ${item.attempts}`,
    })),
    observations: [
      'The dataset is fixed, so each search in the review steps has one right answer.',
      ...DEMO_SEARCHES.map(({ text, expect }) => `"${text}" → ${expect}`),
    ],
    shutdown: async () => {
      await connection.close();
    },
  };
};

export const scenario: Scenario = {
  describe:
    'Starts a fixed set of workflows with known ids, types, statuses, and custom search attributes, so natural-language search and the Jev decision trace can be shown against data with one right answer per search.',
  preflight,
  run,
};
