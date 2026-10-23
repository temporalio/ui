import { recordLiveTimelineTick } from './activity.js';
import { timelineLiveWorkflow } from './workflow.js';
import type { RuntimeJsonDocument } from '../../../browser/types.js';
import type { CatalogExampleDefinition } from '../../registry.js';

const input: RuntimeJsonDocument = {
  defaultValue: [86400, 5, 120],
  schema: {
    type: 'array',
    prefixItems: [
      {
        title: 'Total duration (seconds)',
        type: 'integer',
        minimum: 1,
        maximum: 604800,
      },
      {
        title: 'Tick interval (seconds)',
        type: 'integer',
        minimum: 2,
        maximum: 60,
      },
      {
        title: 'Ticks per run',
        type: 'integer',
        minimum: 20,
        maximum: 1000,
      },
    ],
    items: false,
    minItems: 3,
    maxItems: 3,
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
  id: 'timeline-live',
  title: 'Timeline live: long-running workflow',
  description:
    'Continuously records quick activities and timers across bounded runs to inspect live timeline pinning.',
  capabilityTags: [
    'event-history',
    'timers',
    'activities',
    'continue-as-new',
    'signals',
  ],
  expectedEvidence: [
    'An immediate activity tick followed by a timer keeps the live history progressing without manual interaction.',
    'Each run continues as new after its tick limit while duration remains; tick numbers restart in the new run.',
    'The final timer waits exactly the remaining duration; timelineLiveStop cancels a pending timer and completes the workflow successfully.',
  ],
  setupMarkdown:
    'Defaults are a 24-hour timer budget, a 5-second interval, and 120 ticks per run (about 10 minutes per run, plus activity overhead). Open the timeline, which starts with a stationary view of at least 60 seconds. Click **Follow live** to pin to incoming events. Click **Following live** or drag away from the live edge to pause following, then click **Follow live** to resume. Scrolling to the right edge does not enable following. Zooming while following stays anchored to the live edge and does not pause it. Follow the run boundary when the workflow continues as new. Send the no-argument `timelineLiveStop` signal to finish promptly with Completed status, or terminate the workflow for Terminated status. The optional no-argument `timelineLiveProgress` query reports ticks and remaining timer budget for the current run without adding history events. Duration is accounted for deterministically from completed timer intervals, not wall-clock time; a stop during an activity waits for that activity to resolve.',
  input,
  startOptions,
  execution: {
    kind: 'workflow',
    workflowType: 'timelineLiveWorkflow',
    workflow: timelineLiveWorkflow,
    activities: { recordLiveTimelineTick },
  },
};
