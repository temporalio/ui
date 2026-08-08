import {
  sharedWorkflowExamples,
  sharedWorkflowExports,
  sharedWorkflowSourceFiles,
} from './examples/index.js';
import type { WorkflowCatalogRegistrationSource } from './registration-source.js';

export const workflowCatalogRegistrationSource: WorkflowCatalogRegistrationSource =
  {
    source: { id: 'oss', label: 'OSS' },
    sourceFiles: [
      'src/lib/workflow-catalog/worker/shared-registrations.ts',
      'src/lib/workflow-catalog/worker/workflows.ts',
      'src/lib/workflow-catalog/worker/examples/inventory.ts',
      ...sharedWorkflowSourceFiles,
    ],
    register: (registry) => {
      registry.registerTarget({
        id: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-workflow-catalog',
        workflowsPath: './workflows.js',
        workflowExports: sharedWorkflowExports,
      });

      for (const example of sharedWorkflowExamples) {
        registry.registerExample(example);
      }
    },
  };
