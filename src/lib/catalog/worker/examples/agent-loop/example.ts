import {
  applySteering,
  callTool,
  compactContext,
  recordApproval,
  requestApproval,
  requestSteering,
  streamModelResponse,
} from './activity.js';
import { agentLoop } from './workflow.js';
import type { JsonSchema } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const integer = (
  title: string,
  minimum: number,
  maximum: number,
): JsonSchema => ({
  title,
  type: 'integer',
  minimum,
  maximum,
});

export const catalogExample: CatalogExampleDefinition = {
  id: 'agent-loop',
  title: 'Agent loop stress test',
  description:
    'Simulated AI agent producing thousands of nested, grouped history events.',
  capabilityTags: [
    'event-history',
    'event-groups',
    'signals',
    'updates',
    'child-workflows',
    'continue-as-new',
    'concurrency',
  ],
  expectedEvidence: [
    'Thousands of events per run, grouped by Turn with nested Tool calls and Sub-agents groups.',
    'Explicit groups attached directly to commands: Tool: <name> across every turn, Depth N sub-agents on child starts, and Handoff to run N on context compaction and the continue-as-new.',
    'Implicit groups from handlers: each recordApproval activity grouped under its approveTool signal, and each applySteering activity grouped under its steer update.',
    'A responseChunk signal for every streamed chunk of each model response.',
    'Nested sub-agent child workflows (children and grandchildren) sharing the same root workflow.',
    'A chain of continued-as-new runs for the root agent and for long-running sub-agents.',
  ],
  setupMarkdown:
    'Large values generate a lot of history quickly. Turns × (stream chunks + 3 × tools per turn) roughly sizes each run; sub-agents multiply that by `subAgentsPerSpawn ^ maxDepth`. Raise `stepDelayMs` if the local server falls behind.',
  input: {
    defaultValue: [
      {
        turns: 120,
        turnsPerRun: 30,
        toolsPerTurn: 3,
        streamChunks: 8,
        subAgentEvery: 10,
        subAgentsPerSpawn: 2,
        subAgentTurns: 12,
        maxDepth: 2,
        steerEvery: 15,
        stepDelayMs: 50,
      },
    ],
    schema: {
      type: 'array',
      prefixItems: [
        {
          title: 'Agent loop',
          type: 'object',
          properties: {
            turns: integer('Total turns (root agent)', 1, 10000),
            turnsPerRun: integer(
              'Turns per run before continue-as-new',
              1,
              1000,
            ),
            toolsPerTurn: integer('Parallel tool calls per turn', 0, 20),
            streamChunks: integer('Streamed chunks per model response', 0, 200),
            subAgentEvery: integer(
              'Start sub-agents every N turns (0 = never)',
              0,
              1000,
            ),
            subAgentsPerSpawn: integer('Sub-agents per spawn', 1, 20),
            subAgentTurns: integer('Turns per sub-agent', 1, 1000),
            maxDepth: integer('Maximum sub-agent nesting depth', 0, 5),
            steerEvery: integer(
              'Send a steering update every N turns (0 = never)',
              0,
              1000,
            ),
            stepDelayMs: integer('Delay per step in milliseconds', 0, 5000),
          },
          required: [
            'turns',
            'turnsPerRun',
            'toolsPerTurn',
            'streamChunks',
            'subAgentEvery',
            'subAgentsPerSpawn',
            'subAgentTurns',
            'maxDepth',
            'steerEvery',
            'stepDelayMs',
          ],
          additionalProperties: false,
        },
      ],
      items: false,
      minItems: 1,
      maxItems: 1,
    },
  },
  startOptions: {
    defaultValue: {},
    schema: {
      type: 'object',
      properties: { workflowId: { type: 'string', minLength: 1 } },
    },
  },
  execution: {
    kind: 'workflow',
    workflowType: 'agentLoop',
    workflow: agentLoop,
    activities: {
      applySteering,
      callTool,
      compactContext,
      recordApproval,
      requestApproval,
      requestSteering,
      streamModelResponse,
    },
  },
};
