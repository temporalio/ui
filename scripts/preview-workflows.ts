/**
 * Seed a local Temporal server with a variety of workflows so the UI can be
 * previewed against a rich spread of event types and states — activities,
 * timers, child workflows, signals, updates, queries, retries, rich payloads,
 * pending states, and the live-refresh (pause/unpause) cases.
 *
 * Starts an embedded worker and each selected scenario, then prints the
 * workflow URLs. Keep the process running so the worker stays up.
 *
 * Usage:
 *   pnpm preview:workflows                       # all default (light) scenarios
 *   pnpm preview:workflows --list                # list scenarios and exit
 *   pnpm preview:workflows --only live-refresh,payloads
 *   pnpm preview:workflows --only high-volume    # opt into heavy scenarios
 *   pnpm preview:workflows --no-worker --ui http://localhost:3000
 */

import type { Client } from '@temporalio/client';
import yargs from 'yargs/yargs';

import { connect } from '../temporal/client';
import { runWorker } from '../temporal/worker';
import {
  BlockingWorkflow,
  CompletedWorkflow,
  ConcurrentPendingWorkflow,
  HighVolumeEventWorkflow,
  MixedOpenWorkflow,
  MultiInputWorkflow,
  PayloadCoverageWorkflow,
  PendingActivityWorkflow,
  PendingChildWorkflow,
  PendingTimerWorkflow,
  RetryingActivityWorkflow,
  RunningWorkflow,
  SignalUpdateWaitWorkflow,
  TimelineFixVerificationWorkflow,
  UserMetadataWorkflow,
  Workflow,
} from '../temporal/workflows';

const TASK_QUEUE = 'e2e-1';

type Scenario = {
  name: string;
  description: string;
  // Starts the workflow and returns its id, given the shared client.
  start: (client: Client) => Promise<string>;
  // Heavy scenarios (lots of events) are excluded from the default run.
  heavy?: boolean;
};

const payloadCoverageInput = {
  stringField: 'hello world',
  numberField: 42,
  floatField: 3.14159,
  booleanField: true,
  nullField: null,
  arrayOfStrings: ['alpha', 'beta', 'gamma'],
  arrayOfNumbers: [1, 2, 3],
  mixedArray: ['text', 99, false, null],
  nestedObject: { level1: { level2: 'deep', array: [10, 20] }, flag: false },
  emptyObject: {},
  emptyArray: [],
};

const scenarios: Scenario[] = [
  {
    name: 'simple-activity',
    description: 'Local + regular activity, completes quickly',
    start: (c) => startWith(c, 'simple-activity', Workflow, ['preview input']),
  },
  {
    name: 'completed',
    description: 'continue-as-new then completes',
    start: (c) => startWith(c, 'completed', CompletedWorkflow, [5, 2]),
  },
  {
    name: 'running',
    description: 'Open workflow sleeping on a single long timer',
    start: (c) => startWith(c, 'running', RunningWorkflow, []),
  },
  {
    name: 'blocking-signal',
    description: 'Blocks on an "unblock" signal; exposes a query',
    start: (c) =>
      startWith(c, 'blocking-signal', BlockingWorkflow, ['waiting']),
  },
  {
    name: 'user-metadata',
    description: 'Static summary/details + currentDetails + signal wait',
    start: (c) =>
      startWith(c, 'user-metadata', UserMetadataWorkflow, ['preview'], {
        staticSummary: '# Summary\n**preview workflow**',
        staticDetails: '# Details\nSeeded by preview:workflows',
      }),
  },
  {
    name: 'payloads',
    description:
      'Rich payloads, child workflow, signals, updates, queries, search attributes, a failing activity',
    start: (c) =>
      startWith(
        c,
        'payloads',
        PayloadCoverageWorkflow,
        [payloadCoverageInput],
        { memo: { description: 'preview', tags: ['preview'] } },
      ),
  },
  {
    name: 'multi-input',
    description: 'Activity with multiple typed inputs',
    start: (c) =>
      startWith(c, 'multi-input', MultiInputWorkflow, [
        'hello',
        { foo: 'bar', n: 42 },
        ['cats', 'dogs'],
      ]),
  },
  {
    name: 'pending-activity',
    description: 'Single long-pending activity',
    start: (c) => startWith(c, 'pending-activity', PendingActivityWorkflow, []),
  },
  {
    name: 'pending-timer',
    description: 'Several in-flight timers',
    start: (c) => startWith(c, 'pending-timer', PendingTimerWorkflow, []),
  },
  {
    name: 'pending-child',
    description: 'Parent waiting on a long-running child workflow',
    start: (c) => startWith(c, 'pending-child', PendingChildWorkflow, []),
  },
  {
    name: 'concurrent-pending',
    description: 'Five parallel pending activities',
    start: (c) =>
      startWith(c, 'concurrent-pending', ConcurrentPendingWorkflow, []),
  },
  {
    name: 'retrying-activity',
    description: 'Activity that keeps failing and retrying (pausable)',
    start: (c) =>
      startWith(c, 'retrying-activity', RetryingActivityWorkflow, []),
  },
  {
    name: 'signal-update-wait',
    description: 'Signal + update + query + condition wait',
    start: (c) =>
      startWith(c, 'signal-update-wait', SignalUpdateWaitWorkflow, ['preview']),
  },
  {
    name: 'mixed-open',
    description: 'Activity → timer → child → long activity in sequence',
    start: (c) => startWith(c, 'mixed-open', MixedOpenWorkflow, []),
  },
  {
    name: 'live-refresh',
    description:
      'Steady completing activities/children (watch in-progress→done live) + long-pending & retrying activities to pause/unpause',
    start: (c) =>
      startWith(c, 'live-refresh', TimelineFixVerificationWorkflow, []),
  },
  {
    name: 'high-volume',
    description: '~5k-event history for virtualization/perf preview',
    heavy: true,
    start: (c) => startWith(c, 'high-volume', HighVolumeEventWorkflow, [5000]),
  },
];

async function startWith<A extends unknown[]>(
  client: Client,
  name: string,
  workflowFn: (...args: A) => Promise<unknown>,
  args: A,
  extra: Record<string, unknown> = {},
): Promise<string> {
  const workflowId = `preview-${name}`;
  try {
    await client.workflow.start(workflowFn, {
      taskQueue: TASK_QUEUE,
      workflowId,
      args,
      ...extra,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('already exists')) throw err;
  }
  return workflowId;
}

const argv = await yargs(process.argv.slice(2))
  .option('worker', {
    type: 'boolean',
    default: true,
    describe: 'Start an embedded Temporal worker',
  })
  .option('ui', {
    type: 'string',
    default: 'http://localhost:3000',
    describe: 'Base URL of the running Temporal UI',
  })
  .option('only', {
    type: 'string',
    describe: 'Comma-separated scenario names to start (default: all light)',
  })
  .option('list', {
    type: 'boolean',
    default: false,
    describe: 'List available scenarios and exit',
  })
  .parse();

function selectScenarios(): Scenario[] {
  if (argv.only) {
    const names = argv.only.split(',').map((n) => n.trim());
    const unknown = names.filter((n) => !scenarios.some((s) => s.name === n));
    if (unknown.length) {
      console.error(`Unknown scenario(s): ${unknown.join(', ')}`);
      process.exit(1);
    }
    return scenarios.filter((s) => names.includes(s.name));
  }
  return scenarios.filter((s) => !s.heavy);
}

async function main() {
  if (argv.list) {
    console.log('\nAvailable scenarios:\n');
    for (const s of scenarios) {
      console.log(
        `  ${s.name.padEnd(20)}${s.heavy ? '(heavy) ' : ''}${s.description}`,
      );
    }
    console.log('\nDefault run starts all except heavy scenarios.\n');
    return;
  }

  const selected = selectScenarios();

  if (argv.worker) {
    console.log('⏳ Starting embedded worker...');
    await runWorker();
  }

  const client = await connect();
  const base = argv.ui.replace(/\/$/, '');

  console.log(`\n▶  Starting ${selected.length} scenario(s):\n`);
  for (const scenario of selected) {
    const workflowId = await scenario.start(client);
    console.log(
      `  ${scenario.name.padEnd(20)}${base}/namespaces/default/workflows/${workflowId}`,
    );
  }

  console.log(
    '\n✅ Workflows seeded. Worker is running — keep this process alive (Ctrl-C to stop).\n',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
