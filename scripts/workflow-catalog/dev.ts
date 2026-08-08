import { join } from 'node:path';

import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';

import { parseWorkflowCatalogConnectionConfig } from '../../src/lib/workflow-catalog/worker/connection-config';
import { runWorkflowCatalogDevelopment } from '../../src/lib/workflow-catalog/worker/development';
import { requireWorkflowCatalogRoutingFromEnvironment } from '../../src/lib/workflow-catalog/worker/routing-config';
import type { WorkflowCatalogRunnerEvent } from '../../src/lib/workflow-catalog/worker/runner';
import { createWorkflowCatalogExecutionLogger } from '../../src/lib/workflow-catalog/worker/workflow-execution-logger.js';
import { getProjectRoot } from '../get-project-root';
import {
  loadProjectWorkflowCatalogWorkerBindings,
  verifyProjectWorkflowCatalog,
} from './project-artifacts';
import { createWorkflowCatalogWorkerFactory } from './worker-factory';

Runtime.install({
  logger: createWorkflowCatalogExecutionLogger(new DefaultLogger('INFO')),
});

const rootDirectory = getProjectRoot();
const environmentPaths = [
  join(rootDirectory, '.env.workflow-catalog.local'),
  join(rootDirectory, '.env.workflow-catalog'),
];
const loadEnvironment = (
  process as NodeJS.Process & { loadEnvFile: (path: string) => void }
).loadEnvFile;
const emitWorkflowCatalogEvent = ({
  type,
  ...details
}: WorkflowCatalogRunnerEvent) => {
  console.info(
    JSON.stringify({ component: 'workflow-catalog', event: type, ...details }),
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
  await verifyProjectWorkflowCatalog();
  const workerBindings = await loadProjectWorkflowCatalogWorkerBindings(
    (targets) =>
      requireWorkflowCatalogRoutingFromEnvironment(process.env, targets),
  );
  await runWorkflowCatalogDevelopment({
    bindings: workerBindings,
    targetId: process.env.WORKFLOW_CATALOG_TARGET_ID,
    connectionFactory: () =>
      NativeConnection.connect(
        parseWorkflowCatalogConnectionConfig(process.env),
      ),
    createWorker: createWorkflowCatalogWorkerFactory(Worker),
    events: emitWorkflowCatalogEvent,
    signals: process,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
