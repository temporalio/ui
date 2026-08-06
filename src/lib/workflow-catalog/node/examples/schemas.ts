import type {
  JsonObject,
  JsonValue,
  RuntimeJsonDocument,
} from '../../browser/types.js';

const positionalInput = (
  defaultValue: JsonValue[],
  prefixItems: JsonObject[],
): RuntimeJsonDocument => ({
  defaultValue,
  schema: {
    type: 'array',
    ...(prefixItems.length > 0 ? { prefixItems } : {}),
    items: false,
    maxItems: prefixItems.length,
  },
});

const stringArgument = (title: string): JsonObject => ({
  title,
  type: 'string',
  minLength: 1,
});

const integerArgument = (
  title: string,
  minimum: number,
  maximum: number,
): JsonObject => ({
  title,
  type: 'integer',
  minimum,
  maximum,
});

const booleanArgument = (title: string): JsonObject => ({
  title,
  type: 'boolean',
});

export const exampleInputs = {
  hello: positionalInput(['Temporal'], [stringArgument('Name')]),
  parallelActivities: positionalInput(
    ['catalog-parallel'],
    [stringArgument('Data ID')],
  ),
  sequentialActivities: positionalInput(
    ['catalog-sequential'],
    [stringArgument('Data ID')],
  ),
  longActivity: positionalInput(
    [5000],
    [integerArgument('Delay in milliseconds', 1, 25000)],
  ),
  timeoutWorkflow: positionalInput(
    [true],
    [booleanArgument('Force the activity to time out')],
  ),
  retryWorkflow: positionalInput(
    [2],
    [integerArgument('Failures before success', 0, 4)],
  ),
  signalWorkflow: positionalInput(
    [30],
    [integerArgument('Signal wait timeout in seconds', 1, 300)],
  ),
  heartbeatWorkflow: positionalInput(
    [5, 1000],
    [
      integerArgument('Heartbeat steps', 1, 25),
      integerArgument('Step delay in milliseconds', 1, 1000),
    ],
  ),
  scheduleWorkflow: positionalInput(
    [2, 3],
    [
      integerArgument('Timer interval in seconds', 1, 300),
      integerArgument('Run count', 1, 25),
    ],
  ),
  highEventCountWorkflow: positionalInput(
    [7, 2000],
    [
      integerArgument('Concurrent activity count', 1, 100),
      integerArgument('Activity delay in milliseconds', 1, 25000),
    ],
  ),
  childWorkflowTest: positionalInput([], []),
  localActivityWorkflow: positionalInput(
    ['catalog-local'],
    [stringArgument('Input data')],
  ),
  patchWorkflow: positionalInput(
    ['catalog-patch'],
    [stringArgument('Data ID')],
  ),
  signalCollector: positionalInput(
    [{ timeoutSeconds: 30, maxItems: 3 }],
    [
      {
        title: 'Collector configuration',
        type: 'object',
        properties: {
          timeoutSeconds: {
            type: 'integer',
            minimum: 1,
            maximum: 300,
          },
          maxItems: { type: 'integer', minimum: 1, maximum: 100 },
        },
        additionalProperties: false,
      },
    ],
  ),
} satisfies Record<string, RuntimeJsonDocument>;

export const workflowStartOptions = (
  _exampleId: string,
): RuntimeJsonDocument => ({
  defaultValue: {},
  schema: {
    type: 'object',
    properties: {
      workflowId: { type: 'string', minLength: 1 },
    },
  },
});
