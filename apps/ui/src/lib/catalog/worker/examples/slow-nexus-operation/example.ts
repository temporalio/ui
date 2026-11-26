import { slowNexusServiceHandler } from './handler.js';
import { slowNexusEndpoint, slowNexusService } from './service.js';

export const catalogExample = {
  id: 'slow-nexus-operation',
  title: 'Slow standalone Nexus operation',
  description:
    'Runs a standalone Nexus operation that fails several retryable attempts before completing, so it stays running across multiple long-poll updates.',
  capabilityTags: ['nexus', 'standalone', 'retries', 'terminal-outcome'],
  expectedEvidence: [
    'The operation stays running while the attempt count climbs, then completes with a greeting.',
    'The operation input stays visible on the details page throughout.',
  ],
  setupMarkdown: [
    'Each failed attempt is a state change that the details page receives over its long poll while the operation is still running.',
    '',
    '- `failedAttempts` sets how many attempts fail before one succeeds. Server retry backoff grows with each attempt.',
    '- `completionDelaySeconds` delays the successful attempt. Keep it under 10 seconds, the server timeout for a synchronous Nexus request.',
  ].join('\n'),
  input: {
    defaultValue: {
      name: 'Temporal',
      failedAttempts: 6,
      completionDelaySeconds: 5,
      note: 'This input should stay visible on the details page until the operation completes.',
    },
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        failedAttempts: { type: 'integer', minimum: 0, maximum: 10 },
        completionDelaySeconds: { type: 'integer', minimum: 0, maximum: 9 },
        note: { type: 'string' },
      },
      required: ['name', 'failedAttempts', 'completionDelaySeconds'],
      additionalProperties: false,
    },
  },
  startOptions: {
    defaultValue: {},
    schema: { type: 'object', properties: {} },
  },
  execution: {
    kind: 'standalone-nexus-operation' as const,
    endpoint: slowNexusEndpoint,
    service: slowNexusService.name,
    operation: 'slowGreeting',
    handler: slowNexusServiceHandler,
    policies: { scheduleToCloseTimeout: '300s' },
  },
};
