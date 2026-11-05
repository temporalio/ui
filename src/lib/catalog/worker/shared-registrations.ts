import {
  sharedWorkflowExamples,
  sharedWorkflowExports,
  sharedWorkflowSourceFiles,
} from './examples/index.js';
import type { CatalogRegistrationSource } from './registration-source.js';
import { sharedCatalogWorkspace } from './shared-workspace.js';

export const catalogRegistrationSource: CatalogRegistrationSource = {
  source: { id: 'oss', label: 'OSS' },
  sourceFiles: [
    'src/lib/catalog/worker/shared-registrations.ts',
    'src/lib/catalog/worker/shared-workspace.ts',
    'src/lib/catalog/worker/workflows.ts',
    'src/lib/catalog/worker/examples/inventory.ts',
    ...sharedWorkflowSourceFiles,
  ],
  register: (registry) => {
    registry.registerWorkspace({
      ...sharedCatalogWorkspace,
      id: 'shared-workflows',
      namespace: 'default',
      taskQueue: 'ui-catalog',
      workflowsPath: './workflows.js',
      workflowExports: sharedWorkflowExports,
    });

    for (const example of sharedWorkflowExamples) {
      registry.registerExample(example);
    }
  },
};
