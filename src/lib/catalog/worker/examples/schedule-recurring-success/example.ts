import { scheduleRecurringSuccess } from './workflow.js';

export const catalogExample = {
  id: 'schedule-recurring-success',
  title: 'Schedule: three successful runs',
  description:
    'Completes a small workflow every 30 seconds, with an allowance of three actions.',
  capabilityTags: [
    'schedule',
    'interval',
    'limited-actions',
    'terminal-outcome',
  ],
  expectedEvidence: [
    'The Schedule starts active with a 30-second interval, Skip overlap, and three remaining actions.',
    'Up to three workflows complete with the supplied message as their result, consuming one action each.',
    'After the third action, remaining actions is zero and no further automatic workflows start. The Schedule still exists.',
  ],
  setupMarkdown: `Run automatically creates an **active Schedule** in the current namespace; no manual Schedule setup is needed. Keep the catalog worker running. No activities or external services are used.

The first action occurs at the next 30-second interval boundary, not necessarily immediately. With the worker available, expect three quick successful runs within about 90 seconds. The action allowance is three, overlap is Skip, and missed times are eligible for catch-up for 60 seconds. Inspect each workflow result to see the supplied message.

Open the returned **Schedule link** to inspect remaining actions and links to workflow runs. Re-running creates another Schedule unless you supply a scheduleId; delete an existing Schedule before reusing its ID.

For cleanup, manually delete the Schedule in the UI, including after its allowance is exhausted or it pauses. Deleting a Schedule does not delete or stop workflows already running; let those finish or terminate them separately.`,
  input: {
    defaultValue: ['Scheduled check completed'],
    schema: {
      type: 'array',
      items: { type: 'string', minLength: 1, maxLength: 200 },
      minItems: 1,
      maxItems: 1,
    },
  },
  startOptions: {
    defaultValue: {},
    schema: {
      type: 'object',
      properties: { scheduleId: { type: 'string', minLength: 1 } },
      additionalProperties: false,
    },
  },
  execution: {
    kind: 'schedule' as const,
    spec: { interval: [{ interval: '30s' }] },
    policies: {
      overlapPolicy: 'SCHEDULE_OVERLAP_POLICY_SKIP',
      pauseOnFailure: false,
      catchupWindow: '60s',
    },
    state: { paused: false, limitedActions: true, remainingActions: '3' },
    action: {
      kind: 'workflow' as const,
      workflowType: 'scheduleRecurringSuccess',
      workflow: scheduleRecurringSuccess,
      activities: {},
    },
  },
};
