import { scheduleOverlapBufferOne } from './workflow.js';

export const catalogExample = {
  id: 'schedule-overlap-buffer-one',
  title: 'Schedule: buffer one overlapping run',
  description:
    'Schedules a 20-second workflow every 10 seconds, buffering one pending action instead of running workflows concurrently, with a three-action allowance.',
  capabilityTags: ['schedule', 'interval', 'overlap', 'buffer-one', 'timer'],
  expectedEvidence: [
    'The Schedule has a 10-second interval, Buffer One overlap policy, and an initial allowance of three actions.',
    'Each workflow history shows a 20-second timer before completion with the supplied message.',
    'While a run is open, at most one action is buffered. It starts after the open run completes; additional overlapping times are not queued.',
    'Scheduled runs do not overlap, and automatic starts stop once the three-action allowance is exhausted.',
  ],
  setupMarkdown: `Run automatically creates an **active Schedule** in the current namespace; no manual Schedule setup is needed. Keep the catalog worker running. No activities or external services are used.

The first action occurs at the next 10-second interval boundary. Each workflow sleeps for 20 seconds, so scheduled times arrive while it is still running. Buffer One retains at most one pending action and starts it after the current workflow closes; it does not build an unbounded queue. With the worker available, allow about 60–70 seconds for three workflows to finish. The action allowance is three and the catch-up window is 60 seconds. Inspect buffered actions while a run is open, compare workflow start and close times, and inspect the 20-second timers in history.

Open the returned **Schedule link** to inspect remaining actions and links to workflow runs. Re-running creates another Schedule unless you supply a scheduleId; delete an existing Schedule before reusing its ID.

For cleanup, manually delete the Schedule in the UI, including after its allowance is exhausted or it pauses. Deleting a Schedule does not delete or stop workflows already running; let those finish or terminate them separately.`,
  input: {
    defaultValue: ['Buffered run completed'],
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
    workflowType: 'scheduleOverlapBufferOne',
    workflow: scheduleOverlapBufferOne,
    activities: {},
    spec: { interval: [{ interval: '10s' }] },
    policies: {
      overlapPolicy: 'SCHEDULE_OVERLAP_POLICY_BUFFER_ONE',
      pauseOnFailure: false,
      catchupWindow: '60s',
    },
    state: { paused: false, limitedActions: true, remainingActions: '3' },
  },
};
