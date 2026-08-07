import type { RuntimeJsonDocument } from '../../browser/types.js';

export const exampleInputs = {
  childWorkflowTest: {
    defaultValue: [],
    schema: { type: 'array', items: false, maxItems: 0 },
  },
} satisfies Record<string, RuntimeJsonDocument>;

export const workflowStartOptions = (
  _exampleId: string,
): RuntimeJsonDocument => ({
  defaultValue: {},
  schema: {
    type: 'object',
    properties: { workflowId: { type: 'string', minLength: 1 } },
  },
});
