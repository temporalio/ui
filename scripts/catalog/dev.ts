import { join } from 'node:path';

import { Client, Connection, ScheduleNotFoundError } from '@temporalio/client';
import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';

import { loadProjectCatalogWorkerBindings } from './project-artifacts';
import { createCatalogWorkerFactory } from './worker-factory';
import { parseCatalogConnectionConfig } from '../../src/lib/catalog/worker/connection-config';
import { connectWithRetry } from '../../src/lib/catalog/worker/connection-retry';
import { runCatalogDevelopment } from '../../src/lib/catalog/worker/development';
import {
  declaredNexusEndpoints,
  ensureDeclaredNexusEndpoints,
} from '../../src/lib/catalog/worker/endpoint-provisioning';
import { toScheduleSpec } from '../../src/lib/catalog/worker/examples/schedule-sync/activities';
import {
  catalogScheduleMemoKey,
  catalogScheduleOwnership,
} from '../../src/lib/catalog/worker/examples/schedule-sync/ownership';
import type { CatalogTarget } from '../../src/lib/catalog/worker/registry';
import { requireCatalogRoutingFromEnvironment } from '../../src/lib/catalog/worker/routing-config';
import type { CatalogRunnerEvent } from '../../src/lib/catalog/worker/runner';
import { bootstrapCatalogScheduleSync } from '../../src/lib/catalog/worker/schedule-bootstrap';
import { parseCatalogScheduleConfig } from '../../src/lib/catalog/worker/schedule-config';
import type { CatalogDesiredSchedule } from '../../src/lib/catalog/worker/schedule-declarations';
import {
  formatCatalogBanner,
  supportsAnsiColor,
} from '../../src/lib/catalog/worker/startup-banner';
import { createCatalogExecutionLogger } from '../../src/lib/catalog/worker/workflow-execution-logger.js';
import { getProjectRoot } from '../get-project-root';

Runtime.install({
  logger: createCatalogExecutionLogger(new DefaultLogger('INFO')),
});

const rootDirectory = getProjectRoot();
const environmentPaths = [
  join(rootDirectory, '.env.catalog.local'),
  join(rootDirectory, '.env.catalog'),
];
const loadEnvironment = (
  process as NodeJS.Process & { loadEnvFile: (path: string) => void }
).loadEnvFile;
const runningTargetIds = new Set<string>();
let announcedTargets: readonly { target: CatalogTarget }[] = [];
let schedulesEnabled = false;

const emitCatalogEvent = ({ type, ...details }: CatalogRunnerEvent) => {
  console.info(
    JSON.stringify({ component: 'catalog', event: type, ...details }),
  );

  if (type !== 'target-running') return;

  runningTargetIds.add((details as { targetId: string }).targetId);

  if (runningTargetIds.size !== announcedTargets.length) return;

  console.info(
    formatCatalogBanner({
      targets: announcedTargets.map(({ target }) => target),
      color: supportsAnsiColor({
        isTTY: Boolean(process.stdout.isTTY),
        environment: process.env,
      }),
      schedulesEnabled,
    }),
  );
};

for (const environmentPath of environmentPaths) {
  try {
    loadEnvironment(environmentPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}

try {
  const workerBindings = await loadProjectCatalogWorkerBindings((targets) =>
    requireCatalogRoutingFromEnvironment(process.env, targets),
  );
  const selectedBindings = process.env.CATALOG_TARGET_ID
    ? workerBindings.filter(
        ({ target }) => target.id === process.env.CATALOG_TARGET_ID,
      )
    : workerBindings;
  announcedTargets = selectedBindings;
  const connectionConfig = parseCatalogConnectionConfig(process.env);
  const scheduleConfig = parseCatalogScheduleConfig(process.env);
  schedulesEnabled = scheduleConfig.enabled;

  if (
    declaredNexusEndpoints(selectedBindings).length > 0 &&
    !connectionConfig.apiKey &&
    !connectionConfig.tls
  ) {
    const client = await connectWithRetry({
      connect: () => Connection.connect({ address: connectionConfig.address }),
      onWaiting: ({ attempt }) =>
        console.info(
          `Waiting for the Temporal server at ${connectionConfig.address}… (attempt ${attempt})`,
        ),
    });

    try {
      await ensureDeclaredNexusEndpoints({
        bindings: selectedBindings,
        listEndpointNames: async () => {
          const response = await client.operatorService.listNexusEndpoints({
            pageSize: 100,
          });
          return (response.endpoints ?? [])
            .map((endpoint) => endpoint.spec?.name ?? '')
            .filter(Boolean);
        },
        createEndpoint: async ({ name, namespace, taskQueue }) => {
          await client.operatorService.createNexusEndpoint({
            spec: { name, target: { worker: { namespace, taskQueue } } },
          });
        },
        onEndpoint: (event) => {
          if (event.state === 'created') {
            console.info(
              `Created Nexus endpoint "${event.endpoint}" targeting ${event.namespace}/${event.taskQueue}.`,
            );
          } else if (event.state === 'exists') {
            console.info(`Nexus endpoint "${event.endpoint}" already exists.`);
          } else {
            console.info(
              [
                `Cannot create Nexus endpoint "${event.endpoint}" from here; create it manually:`,
                `  temporal operator nexus endpoint create --name ${event.endpoint} --target-namespace ${event.namespace} --target-task-queue ${event.taskQueue} --address ${connectionConfig.address}`,
              ].join('\n'),
            );
          }
        },
      });
    } finally {
      await client.close();
    }
  }

  if (!scheduleConfig.enabled) {
    console.info(
      'Schedule manager disabled; set CATALOG_SCHEDULES=enabled in .env.catalog.local to create declared schedules.',
    );
  } else {
    const connection = await connectWithRetry({
      connect: () =>
        Connection.connect({
          address: connectionConfig.address,
          ...(connectionConfig.apiKey
            ? { apiKey: connectionConfig.apiKey }
            : {}),
          ...(connectionConfig.tls ? { tls: connectionConfig.tls } : {}),
        }),
      onWaiting: ({ attempt }) =>
        console.info(
          `Waiting for the Temporal server at ${connectionConfig.address}… (attempt ${attempt})`,
        ),
    });
    const managerHandle = ({ id, namespace }: CatalogDesiredSchedule) =>
      new Client({ connection, namespace }).schedule.getHandle(id);

    try {
      await bootstrapCatalogScheduleSync({
        bindings: selectedBindings,
        describeManager: async (entry) => {
          try {
            await managerHandle(entry).describe();
            return { exists: true };
          } catch (error) {
            if (error instanceof ScheduleNotFoundError)
              return { exists: false };
            throw error;
          }
        },
        createManager: async (entry) => {
          await new Client({
            connection,
            namespace: entry.namespace,
          }).schedule.create({
            scheduleId: entry.id,
            spec: toScheduleSpec(entry.spec),
            action: {
              type: 'startWorkflow',
              workflowType: entry.workflowType,
              taskQueue: entry.taskQueue,
              args: entry.args,
            },
            state: { paused: entry.paused, note: entry.note },
            memo: {
              [catalogScheduleMemoKey]: catalogScheduleOwnership(
                entry.exampleId,
              ),
            },
          });
        },
        updateManagerArgs: async (entry) => {
          await managerHandle(entry).update((previous) => ({
            ...previous,
            action: {
              ...previous.action,
              type: 'startWorkflow',
              workflowType: entry.workflowType,
              taskQueue: entry.taskQueue,
              args: entry.args,
            },
          }));
        },
        triggerManager: async (entry) => {
          await managerHandle(entry).trigger();
        },
        onEvent: (event) => {
          if (event.state === 'skipped') {
            console.info(`Schedule manager skipped: ${event.reason}`);
          } else if (event.state === 'blocked') {
            console.info(
              `Cannot reconcile schedule "${event.scheduleId}": ${event.error instanceof Error ? event.error.message : String(event.error)}`,
            );
          } else {
            console.info(
              `Schedule "${event.scheduleId}" ${event.state} in ${event.namespace}/${event.taskQueue} with ${event.declaredCount} declared schedules.`,
            );
          }
        },
      });
    } finally {
      await connection.close();
    }
  }

  await runCatalogDevelopment({
    bindings: workerBindings,
    targetId: process.env.CATALOG_TARGET_ID,
    connectionFactory: () =>
      connectWithRetry({
        connect: () => NativeConnection.connect(connectionConfig),
        onWaiting: ({ attempt }) =>
          console.info(
            `Waiting for the Temporal server at ${connectionConfig.address}… (attempt ${attempt})`,
          ),
      }),
    createWorker: createCatalogWorkerFactory(Worker),
    events: emitCatalogEvent,
    signals: process,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
