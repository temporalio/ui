import type {
  WorkflowCatalogExampleRegistration,
  WorkflowImplementation,
} from '../registry.js';
import { helloExample, helloSourceFiles } from './hello/example.js';
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
import { sharedWorkflowExamples as registeredWorkflowExamples } from './registrations.js';
import {
  sequentialActivitiesExample,
  sequentialActivitiesSourceFiles,
} from './sequential-activities/example.js';
import {
  standaloneActivityExample,
  standaloneActivitySourceFiles,
} from './standalone-activity/example.js';

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
  ...registeredWorkflowExamples.map((example) => ({
    example,
    sourceFiles: [],
  })),
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
  'src/lib/workflow-catalog/node/examples/activities.ts',
  'src/lib/workflow-catalog/node/examples/registrations.ts',
  'src/lib/workflow-catalog/node/examples/schemas.ts',
  'src/lib/workflow-catalog/node/examples/workflows.ts',
  ...sharedWorkflowDefinitions.flatMap(({ sourceFiles }) => sourceFiles),
] as const;

assertUniqueEntries(sharedWorkflowSourceFiles, 'source file');

export { sharedWorkflowCorpusInventory } from './inventory.js';
