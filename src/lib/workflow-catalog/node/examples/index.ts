import type {
  WorkflowCatalogExampleRegistration,
  WorkflowImplementation,
} from '../registry.js';
import {
  activityHeartbeatExample,
  activityHeartbeatSourceFiles,
} from './activity-heartbeat/example.js';
import {
  activityRetryExample,
  activityRetrySourceFiles,
} from './activity-retry/example.js';
import {
  activityTimeoutExample,
  activityTimeoutSourceFiles,
} from './activity-timeout/example.js';
import {
  childWorkflowsExample,
  childWorkflowsSourceFiles,
} from './child-workflows/example.js';
import { helloExample, helloSourceFiles } from './hello/example.js';
import {
  highEventCountExample,
  highEventCountSourceFiles,
} from './high-event-count/example.js';
import {
  localActivityExample,
  localActivitySourceFiles,
} from './local-activity/example.js';
import {
  longActivityExample,
  longActivitySourceFiles,
} from './long-activity/example.js';
import {
  parallelActivitiesExample,
  parallelActivitiesSourceFiles,
} from './parallel-activities/example.js';
import {
  priorityFairnessExample,
  priorityFairnessSourceFiles,
} from './priority-fairness/example.js';
import {
  sequentialActivitiesExample,
  sequentialActivitiesSourceFiles,
} from './sequential-activities/example.js';
import {
  signalCollectorExample,
  signalCollectorSourceFiles,
} from './signal-collector/example.js';
import {
  signalHandlersExample,
  signalHandlersSourceFiles,
} from './signal-handlers/example.js';
import {
  standaloneActivityExample,
  standaloneActivitySourceFiles,
} from './standalone-activity/example.js';
import {
  timerDrivenRepetitionExample,
  timerDrivenRepetitionSourceFiles,
} from './timer-driven-repetition/example.js';
import {
  workflowPatchingExample,
  workflowPatchingSourceFiles,
} from './workflow-patching/example.js';

type WorkflowExampleDefinition = {
  example: WorkflowCatalogExampleRegistration;
  sourceFiles: readonly string[];
};

const assertUniqueEntries = (entries: readonly string[], label: string) => {
  const seen = new Set<string>();

  for (const entry of entries) {
    if (seen.has(entry)) {
      throw new Error(`Duplicate workflow catalog ${label} "${entry}"`);
    }

    seen.add(entry);
  }
};

const sharedWorkflowDefinitions: readonly WorkflowExampleDefinition[] = [
  { example: helloExample, sourceFiles: helloSourceFiles },
  {
    example: parallelActivitiesExample,
    sourceFiles: parallelActivitiesSourceFiles,
  },
  {
    example: sequentialActivitiesExample,
    sourceFiles: sequentialActivitiesSourceFiles,
  },
  { example: longActivityExample, sourceFiles: longActivitySourceFiles },
  { example: activityTimeoutExample, sourceFiles: activityTimeoutSourceFiles },
  { example: activityRetryExample, sourceFiles: activityRetrySourceFiles },
  { example: signalHandlersExample, sourceFiles: signalHandlersSourceFiles },
  {
    example: activityHeartbeatExample,
    sourceFiles: activityHeartbeatSourceFiles,
  },
  {
    example: timerDrivenRepetitionExample,
    sourceFiles: timerDrivenRepetitionSourceFiles,
  },
  { example: highEventCountExample, sourceFiles: highEventCountSourceFiles },
  { example: childWorkflowsExample, sourceFiles: childWorkflowsSourceFiles },
  { example: localActivityExample, sourceFiles: localActivitySourceFiles },
  {
    example: workflowPatchingExample,
    sourceFiles: workflowPatchingSourceFiles,
  },
  { example: signalCollectorExample, sourceFiles: signalCollectorSourceFiles },
  {
    example: priorityFairnessExample,
    sourceFiles: priorityFairnessSourceFiles,
  },
  {
    example: standaloneActivityExample,
    sourceFiles: standaloneActivitySourceFiles,
  },
];

export const sharedWorkflowExamples: readonly WorkflowCatalogExampleRegistration[] =
  sharedWorkflowDefinitions.map(({ example }) => example);

assertUniqueEntries(
  sharedWorkflowExamples.map(({ id }) => id),
  'example id',
);

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
  'src/lib/workflow-catalog/node/examples/index.ts',
  'src/lib/workflow-catalog/node/examples/shared-activities.ts',
  ...sharedWorkflowDefinitions.flatMap(({ sourceFiles }) => sourceFiles),
] as const;

assertUniqueEntries(sharedWorkflowSourceFiles, 'source file');

export { sharedWorkflowCorpusInventory } from './inventory.js';
