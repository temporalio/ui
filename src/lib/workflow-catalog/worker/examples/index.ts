// GENERATED FILE. DO NOT EDIT.
import type {
  WorkflowCatalogExampleDefinition,
  WorkflowCatalogExampleRegistration,
  WorkflowImplementation,
} from '../registry.js';
import { workflowCatalogExample as example0 } from './activity-heartbeat/example.js';
import { workflowCatalogExample as example1 } from './activity-retry/example.js';
import { workflowCatalogExample as example2 } from './activity-timeout/example.js';
import { workflowCatalogExample as example3 } from './child-workflows/example.js';
import { workflowCatalogExample as example4 } from './hello/example.js';
import { workflowCatalogExample as example5 } from './high-event-count/example.js';
import { workflowCatalogExample as example6 } from './local-activity/example.js';
import { workflowCatalogExample as example7 } from './long-activity/example.js';
import { workflowCatalogExample as example8 } from './nexus-greeting/example.js';
import { workflowCatalogExample as example9 } from './parallel-activities/example.js';
import { workflowCatalogExample as example10 } from './priority-fairness/example.js';
import { workflowCatalogExample as example11 } from './sequential-activities/example.js';
import { workflowCatalogExample as example12 } from './signal-collector/example.js';
import { workflowCatalogExample as example13 } from './signal-handlers/example.js';
import { workflowCatalogExample as example14 } from './standalone-activity/example.js';
import { workflowCatalogExample as example15 } from './timer-driven-repetition/example.js';
import { workflowCatalogExample as example16 } from './workflow-patching/example.js';

const sharedWorkflowDefinitions = [
  example0,
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  example7,
  example8,
  example9,
  example10,
  example11,
  example12,
  example13,
  example14,
  example15,
  example16,
] satisfies readonly WorkflowCatalogExampleDefinition[];

export const sharedWorkflowExamples: readonly WorkflowCatalogExampleRegistration[] =
  sharedWorkflowDefinitions.map((example) => ({
    ...example,
    targetId: 'shared-workflows',
  }));

const seenExampleIds = new Set<string>();
for (const example of sharedWorkflowExamples) {
  if (seenExampleIds.has(example.id)) {
    throw new Error(`Duplicate workflow catalog example id "${example.id}"`);
  }
  seenExampleIds.add(example.id);
}

export const sharedWorkflowExports: Readonly<
  Record<string, WorkflowImplementation>
> = (() => {
  const workflowExports: Record<string, WorkflowImplementation> = {};

  for (const example of sharedWorkflowExamples) {
    if (example.execution.kind !== 'workflow') continue;
    const existing = workflowExports[example.execution.workflowType];

    if (existing && existing !== example.execution.workflow) {
      throw new Error(
        `Workflow type "${example.execution.workflowType}" maps to different workflow implementations`,
      );
    }

    workflowExports[example.execution.workflowType] =
      example.execution.workflow;
  }

  return workflowExports;
})();

export const sharedWorkflowSourceFiles = [
  'src/lib/workflow-catalog/worker/examples/index.ts',
  'src/lib/workflow-catalog/worker/examples/shared-activities.ts',
  'src/lib/workflow-catalog/worker/examples/activity-heartbeat/activity.ts',
  'src/lib/workflow-catalog/worker/examples/activity-heartbeat/example.ts',
  'src/lib/workflow-catalog/worker/examples/activity-heartbeat/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/activity-retry/activity.ts',
  'src/lib/workflow-catalog/worker/examples/activity-retry/example.ts',
  'src/lib/workflow-catalog/worker/examples/activity-retry/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/activity-timeout/activity.ts',
  'src/lib/workflow-catalog/worker/examples/activity-timeout/example.ts',
  'src/lib/workflow-catalog/worker/examples/activity-timeout/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/child-workflows/example.ts',
  'src/lib/workflow-catalog/worker/examples/child-workflows/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/hello/example.ts',
  'src/lib/workflow-catalog/worker/examples/hello/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/high-event-count/example.ts',
  'src/lib/workflow-catalog/worker/examples/high-event-count/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/local-activity/example.ts',
  'src/lib/workflow-catalog/worker/examples/local-activity/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/long-activity/activity.ts',
  'src/lib/workflow-catalog/worker/examples/long-activity/example.ts',
  'src/lib/workflow-catalog/worker/examples/long-activity/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/nexus-greeting/example.ts',
  'src/lib/workflow-catalog/worker/examples/nexus-greeting/handler.ts',
  'src/lib/workflow-catalog/worker/examples/nexus-greeting/service.ts',
  'src/lib/workflow-catalog/worker/examples/nexus-greeting/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/parallel-activities/example.ts',
  'src/lib/workflow-catalog/worker/examples/parallel-activities/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/priority-fairness/example.ts',
  'src/lib/workflow-catalog/worker/examples/priority-fairness/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/sequential-activities/example.ts',
  'src/lib/workflow-catalog/worker/examples/sequential-activities/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/signal-collector/activity.ts',
  'src/lib/workflow-catalog/worker/examples/signal-collector/example.ts',
  'src/lib/workflow-catalog/worker/examples/signal-collector/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/signal-handlers/activity.ts',
  'src/lib/workflow-catalog/worker/examples/signal-handlers/example.ts',
  'src/lib/workflow-catalog/worker/examples/signal-handlers/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/standalone-activity/activity.ts',
  'src/lib/workflow-catalog/worker/examples/standalone-activity/example.ts',
  'src/lib/workflow-catalog/worker/examples/timer-driven-repetition/example.ts',
  'src/lib/workflow-catalog/worker/examples/timer-driven-repetition/workflow.ts',
  'src/lib/workflow-catalog/worker/examples/workflow-patching/example.ts',
  'src/lib/workflow-catalog/worker/examples/workflow-patching/workflow.ts',
] as const;

export { sharedWorkflowCorpusInventory } from './inventory.js';
