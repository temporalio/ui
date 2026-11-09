import { childFanOut } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [100, 10],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Child workflows',
        type: 'integer',
        minimum: 1,
        maximum: 200,
      },
      {
        title: 'Grandchild workflows per child',
        type: 'integer',
        minimum: 0,
        maximum: 20,
      },
    ],
    items: false,
    maxItems: 2,
  },
};
const startOptions: RuntimeJsonDocument = {
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
};

export const catalogExample: CatalogExampleDefinition = {
  id: 'child-fan-out',
  title: 'Child workflow fan-out',
  description:
    'Starts 100 child workflows, each of which starts 10 child workflows of its own, for 1,101 workflows in total.',
  capabilityTags: ['child-workflows', 'concurrency'],
  patternTags: ['batch-processing'],
  expectedEvidence: [
    'A parent workflow with the configured number of child workflows, each with its own grandchild workflows.',
    'Child workflow IDs extend the parent ID, for example `<parent>-3` and `<parent>-3-7`.',
    'A parent result equal to the total number of workflows in the tree, 1,101 with the defaults.',
  ],
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'childFanOut',
    workflow: childFanOut,
    activities: {},
  },
};
