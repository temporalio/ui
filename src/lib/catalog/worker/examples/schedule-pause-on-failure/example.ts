import { schedulePauseOnFailure } from './workflow.js';

export const catalogExample = {
  id: 'schedule-pause-on-failure',
  title: 'Schedule: pause after a workflow failure',
  description:
    'Runs a deliberately failing workflow every 30 seconds, demonstrating automatic pause on failure with a three-action safety limit.',
  capabilityTags: [
    'schedule',
    'pause-on-failure',
    'failure',
    'limited-actions',
  ],
  expectedEvidence: [
    'The Schedule starts active with pause on failure enabled, a 30-second interval, and three remaining actions.',
    'The first workflow fails with a non-retryable ScheduledDemoFailure containing the supplied message, rather than a Workflow Task failure.',
    'After observing the failure, the Schedule becomes paused, normally with two actions remaining; later interval boundaries do not start workflows while paused.',
  ],
  setupMarkdown: `Run automatically creates an **active Schedule** in the current namespace; no manual Schedule setup is needed. Keep the catalog worker running. No activities or external services are used.

The first action occurs at the next 30-second interval boundary, so normally the failure and automatic pause are visible within about 30 seconds. The workflow deliberately throws ApplicationFailure.nonRetryable with type ScheduledDemoFailure. No workflow retry policy is configured, and workflows do not retry by default; this is a terminal workflow failure, not a repeatedly failing Workflow Task. The Schedule uses Skip overlap, a 60-second catch-up window, and a three-action allowance as a safety bound even if you manually resume it. Normally it pauses after the first failed action with two actions left. Inspect the paused state and failure details, then wait past another interval boundary to confirm there are no new runs.

Open the returned **Schedule link** to inspect remaining actions and links to workflow runs. Re-running creates another Schedule unless you supply a scheduleId; delete an existing Schedule before reusing its ID.

For cleanup, manually delete the Schedule in the UI, including after its allowance is exhausted or it pauses. Deleting a Schedule does not delete or stop workflows already running; let those finish or terminate them separately.`,
  input: {
    defaultValue: ['Intentional scheduled failure'],
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
      pauseOnFailure: true,
      catchupWindow: '60s',
    },
    state: { paused: false, limitedActions: true, remainingActions: '3' },
    action: {
      kind: 'workflow' as const,
      workflowType: 'schedulePauseOnFailure',
      workflow: schedulePauseOnFailure,
      activities: {},
    },
  },
};
