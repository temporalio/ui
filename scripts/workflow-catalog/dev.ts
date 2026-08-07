import { join } from 'node:path';

import {
  DefaultLogger,
  NativeConnection,
  Runtime,
  Worker,
} from '@temporalio/worker';

import { parseWorkflowCatalogConnectionConfig } from '../../src/lib/workflow-catalog/node/connection-config';
import { runWorkflowCatalogDevelopment } from '../../src/lib/workflow-catalog/node/development';
import { requireWorkflowCatalogRoutingFromEnvironment } from '../../src/lib/workflow-catalog/node/routing-config';
import type { WorkflowCatalogRunnerEvent } from '../../src/lib/workflow-catalog/node/runner';
import { createWorkflowCatalogExecutionLogger } from '../../src/lib/workflow-catalog/node/workflow-execution-logger.js';
import { getProjectRoot } from '../get-project-root';
import {
  loadProjectWorkflowCatalogNodeBindings,
  verifyProjectWorkflowCatalog,
} from './project-artifacts';
import { createWorkflowCatalogWorkerFactory } from './worker-factory';

Runtime.install({
  logger: createWorkflowCatalogExecutionLogger(new DefaultLogger('INFO')),
});

const rootDirectory = getProjectRoot();
const environmentPath = join(rootDirectory, '.env.workflow-catalog.local');
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

try {
  loadEnvironment(environmentPath);
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

try {
  await verifyProjectWorkflowCatalog();
  const routing = requireWorkflowCatalogRoutingFromEnvironment(process.env);
  const nodeBindings = await loadProjectWorkflowCatalogNodeBindings(routing);
  await runWorkflowCatalogDevelopment({
    bindings: nodeBindings,
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
