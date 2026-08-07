import type { WorkflowCatalogExampleRegistration } from '../registry.js';
import * as activities from './activities.js';
import { exampleInputs, workflowStartOptions } from './schemas.js';
import { childWorkflowTest } from './workflows.js';

export const sharedWorkflowExamples: WorkflowCatalogExampleRegistration[] = [
  {
    id: 'child-workflows',
    title: 'Child workflows',
    description: 'Starts and joins three child workflow executions.',
    targetId: 'shared-workflows',
    capabilityTags: ['child-workflows', 'concurrency'],
    expectedEvidence: [
      'Three child workflow relationships and one joined parent result.',
    ],
    input: exampleInputs.childWorkflowTest,
    startOptions: workflowStartOptions('child-workflows'),
    execution: {
      kind: 'workflow',
      workflowType: 'childWorkflowTest',
      workflow: childWorkflowTest,
      activities: {
        greet: activities.greet,
        processData: activities.processData,
      },
    },
  },
];
