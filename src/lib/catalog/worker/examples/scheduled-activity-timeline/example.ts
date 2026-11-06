import { timelineUnpolledActivity } from './activity.js';
import { scheduledActivityTimeline } from './workflow.js';

export const catalogExample = {
  id: 'scheduled-activity-timeline',
  title: 'Scheduled activity timeline',
  description:
    'Waits before scheduling staggered activities on an unpolled queue, so you can watch pending timeline lines appear as scheduled events arrive.',
  capabilityTags: ['timers', 'activities'],
  expectedEvidence: [
    'An initial timer gives you time to open the live timeline before any activities are scheduled.',
    'Each ActivityTaskScheduled event immediately shows a scheduled box and a pending line, even before the workflow refresh returns its pending activity.',
    'Activities remain scheduled without started events because no Worker polls their task queue. The workflow runs until cancelled or terminated.',
  ],
  setupMarkdown: [
    '1. Run with the default input `[15, 3, 5]`: a 15-second initial delay, a 3-second interval, and 5 activities.',
    '2. Open the workflow Timeline during the initial delay and keep live updates enabled.',
    '3. Watch each new activity row appear. Its pending line should appear with the scheduled box, without waiting for the next 10-second workflow refresh.',
    '4. Cancel or terminate the workflow when finished.',
    '',
    'Leave `catalog-scheduled-activity-timeline-unpolled` without a Worker. The catalog worker handles the workflow on its normal queue.',
    '',
    'The staggered scheduling provides repeated opportunities to observe the refresh gap; an activity scheduled at the same time as a workflow refresh may already have pending metadata.',
  ].join('\n'),
  input: {
    defaultValue: [15, 3, 5],
    schema: {
      type: 'array',
      prefixItems: [
        {
          title: 'Initial delay in seconds',
          type: 'integer',
          minimum: 1,
          maximum: 300,
        },
        {
          title: 'Scheduling interval in seconds',
          type: 'integer',
          minimum: 1,
          maximum: 60,
        },
        {
          title: 'Activity count',
          type: 'integer',
          minimum: 1,
          maximum: 25,
        },
      ],
      items: false,
      maxItems: 3,
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
    kind: 'workflow' as const,
    workflowType: 'scheduledActivityTimeline',
    workflow: scheduledActivityTimeline,
    activities: { timelineUnpolledActivity },
  },
};
