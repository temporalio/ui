import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Client, Connection } from '@temporalio/client';
import protoPkg from '@temporalio/proto';
import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';
import { z } from 'zod';

import { SystemNexusSignalWithStartCaller } from './caller-workflow';
import { assertValidExampleInput, requireWorkflowExample } from '../../catalog';
import type { Scenario, ScenarioContext, ScenarioResult } from '../../scenario';

const require = createRequire(import.meta.url);

/** The options this scenario accepts, checked by the compiler in definition.ts. */
export type Options = z.input<typeof optionsSchema>;

// strict, so an option this scenario does not have is an error rather than a
// default used quietly.
const optionsSchema = z.strictObject({
  /**
   * The catalog example the operation starts and signals. Its workflow type and
   * task queue come from the catalog, and the catalog worker runs it.
   */
  targetExample: z.string().default('signal-handlers'),
  targetWorkflowId: z.string().default('system-nexus-target'),
  /** Must be a signal the target example handles. */
  signalName: z.string().default('test-signal'),
  signalInput: z
    .unknown()
    .default('a signal delivered by the system Nexus endpoint'),
  workflowInput: z.array(z.unknown()).optional(),
  memo: z.record(z.string(), z.unknown()).default({}),
  /** Defaults to the caller's workflow id. */
  identity: z.string().optional(),
});

/** What the UI renders from the decoded request, and the target needs to run. */
const REQUIRED_FIELDS = [
  'workflowId',
  'workflowType',
  'taskQueue',
  'signalName',
  'identity',
] as const;

/**
 * Fields this caller deliberately leaves unset. The server records the request
 * as the caller sent it today, so any of these appearing means the server
 * started populating it, which changes what the UI shows.
 */
const UNSET_FIELDS = ['namespace', 'requestId', 'control', 'links'] as const;

/**
 * The demo exists to prove the UI has real data to render, so it checks the
 * recorded request rather than trusting that what was sent is what was stored.
 * This is the guard against the operation's shape drifting underneath us.
 */
const checkRecordedShape = async (
  client: Client,
  callerWorkflowId: string,
): Promise<string[]> => {
  const history = await client.workflow
    .getHandle(callerWorkflowId)
    .fetchHistory();

  const scheduled = history.events?.find(
    (event) => event.nexusOperationScheduledEventAttributes,
  );
  const input = scheduled?.nexusOperationScheduledEventAttributes?.input;

  if (!input?.data) {
    throw new Error(
      'The caller recorded no NexusOperationScheduled input, so there is nothing for the UI to decode.',
    );
  }

  const request =
    protoPkg.temporal.api.workflowservice.v1.SignalWithStartWorkflowExecutionRequest.decode(
      input.data,
    ).toJSON() as Record<string, unknown>;

  const missing = REQUIRED_FIELDS.filter((field) => !request[field]);

  if (missing.length) {
    throw new Error(
      [
        `The recorded request no longer carries: ${missing.join(', ')}.`,
        'The UI renders signalName, identity, and control from this request, and',
        'the target needs the rest. Either the caller stopped sending them, or the',
        'server changed what it records. Update this scenario to match.',
      ].join('\n'),
    );
  }

  const appeared = UNSET_FIELDS.filter((field) => request[field]);

  return appeared.length
    ? [
        `The server now populates ${appeared.join(', ')} on the request, which this caller does not send. The UI may show more than these review steps describe.`,
      ]
    : [];
};

const run = async (
  { address, namespace, log }: ScenarioContext,
  rawOptions: Record<string, unknown>,
): Promise<ScenarioResult> => {
  const options = optionsSchema.parse(rawOptions);
  const target = requireWorkflowExample(options.targetExample);
  const targetInput = options.workflowInput ?? target.defaultInput;

  await assertValidExampleInput(target, targetInput);

  log(
    `Target is the "${target.id}" catalog example: workflow type ${target.workflowType} on the "${target.taskQueue}" task queue`,
  );

  Runtime.install({ logger: new DefaultLogger('WARN') });

  // The caller needs a payload converter the SDK does not ship yet, so it runs
  // on a worker of its own. The target stays on the catalog worker.
  const dataConverter = {
    payloadConverterPath: join(
      dirname(fileURLToPath(import.meta.url)),
      'payload-converter.ts',
    ),
  };
  const callerTaskQueue = `system-nexus-caller-${Date.now().toString(36)}`;

  const worker = await Worker.create({
    connection: await NativeConnection.connect({ address }),
    workflowsPath: require.resolve('./caller-workflow'),
    taskQueue: callerTaskQueue,
    namespace,
    dataConverter,
  });

  const connection = await Connection.connect({ address });
  const client = new Client({ connection, namespace, dataConverter });

  const callerWorkflowId = `system-nexus-caller-${Date.now().toString(36)}`;

  const caller = await client.workflow.start(SystemNexusSignalWithStartCaller, {
    taskQueue: callerTaskQueue,
    workflowId: callerWorkflowId,
    args: [
      {
        targetWorkflowId: options.targetWorkflowId,
        targetWorkflowType: target.workflowType,
        targetTaskQueue: target.taskQueue,
        signalName: options.signalName,
        signalInput: options.signalInput,
        workflowInput: targetInput,
        memo: options.memo,
      },
    ],
  });

  log(`Caller workflow started: ${caller.workflowId}`);

  const result = await worker.runUntil(caller.result());

  log(
    `The operation returned started=${result.started} for run ${result.runId}`,
  );

  const shapeNotes = await checkRecordedShape(client, caller.workflowId);

  return {
    workflows: [
      {
        role: 'caller',
        workflowId: caller.workflowId,
        runId: caller.firstExecutionRunId,
        note: 'An ordinary workflow. Carries the two system Nexus events, both binary/protobuf.',
      },
      {
        role: 'target',
        workflowId: options.targetWorkflowId,
        runId: result.runId,
        note: result.started
          ? `Started by the operation, then signaled. Runs the "${target.id}" catalog example.`
          : `Already existed, so the operation only signaled it. Runs the "${target.id}" catalog example.`,
        catalogExampleId: target.id,
      },
    ],
    observations: [
      'NexusOperationScheduled carries endpoint __temporal_system, service temporal.api.workflowservice.v1.WorkflowService, operation SignalWithStartWorkflowExecution.',
      'Both payloads are binary/protobuf, so the UI must decode them to show anything useful.',
      result.started
        ? 'The operation started a new target workflow (started=true).'
        : 'The target already existed, so the operation only signaled it (started=false).',
      `The target runs the "${target.id}" catalog example on the catalog worker, so nothing here is demo-only code.`,
      ...shapeNotes,
    ],
    shutdown: async () => {
      await connection.close();
    },
  };
};

export const scenario: Scenario = {
  describe:
    'Invokes SignalWithStartWorkflowExecution through the __temporal_system Nexus endpoint from an ordinary caller workflow, so the caller history holds a NexusOperationScheduled and NexusOperationCompleted pair with binary/protobuf payloads.',
  run,
};
