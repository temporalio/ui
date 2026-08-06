import { sharedWorkflowExamples } from './examples/index.js';
import type { WorkflowCatalogRegistrationSource } from './registration-source.js';
import {
  childWorkflowTest,
  heartbeatWorkflow,
  hello,
  highEventCountWorkflow,
  localActivityWorkflow,
  longActivity,
  parallelActivities,
  patchWorkflow,
  retryWorkflow,
  scheduleWorkflow,
  sequentialActivities,
  signalCollector,
  signalWorkflow,
  timeoutWorkflow,
} from './workflows.js';

const workflowExports = {
  hello,
  parallelActivities,
  sequentialActivities,
  longActivity,
  timeoutWorkflow,
  retryWorkflow,
  signalWorkflow,
  heartbeatWorkflow,
  scheduleWorkflow,
  highEventCountWorkflow,
  childWorkflowTest,
  localActivityWorkflow,
  patchWorkflow,
  signalCollector,
};

export const workflowCatalogRegistrationSource: WorkflowCatalogRegistrationSource =
  {
    sourceFiles: [
      'src/lib/workflow-catalog/node/shared-registrations.ts',
      'src/lib/workflow-catalog/node/workflows.ts',
      'src/lib/workflow-catalog/node/examples/index.ts',
      'src/lib/workflow-catalog/node/examples/activities.ts',
      'src/lib/workflow-catalog/node/examples/inventory.ts',
      'src/lib/workflow-catalog/node/examples/registrations.ts',
      'src/lib/workflow-catalog/node/examples/schemas.ts',
      'src/lib/workflow-catalog/node/examples/workflows.ts',
    ],
    register: (registry) => {
      registry.registerTarget({
        id: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-workflow-catalog',
        workflowsPath: './workflows.js',
        workflowExports,
      });

      for (const example of sharedWorkflowExamples) {
        registry.registerExample(example);
      }
    },
  };
