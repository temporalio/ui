// GENERATED FILE. DO NOT EDIT.
import { catalogExample as example0 } from './examples/activity-heartbeat/example.js';
import * as workflows0 from './examples/activity-heartbeat/workflow.js';
import { catalogExample as example1 } from './examples/activity-retry/example.js';
import * as workflows1 from './examples/activity-retry/workflow.js';
import { catalogExample as example2 } from './examples/activity-timeout/example.js';
import * as workflows2 from './examples/activity-timeout/workflow.js';
import { catalogExample as example3 } from './examples/child-fan-out/example.js';
import * as workflows3 from './examples/child-fan-out/workflow.js';
import { catalogExample as example4 } from './examples/child-workflows/example.js';
import * as workflows4 from './examples/child-workflows/workflow.js';
import { catalogExample as example5 } from './examples/hello/example.js';
import * as workflows5 from './examples/hello/workflow.js';
import { catalogExample as example6 } from './examples/high-event-count/example.js';
import * as workflows6 from './examples/high-event-count/workflow.js';
import { catalogExample as example7 } from './examples/large-history/example.js';
import * as workflows7 from './examples/large-history/workflow.js';
import { catalogExample as example8 } from './examples/local-activity/example.js';
import * as workflows8 from './examples/local-activity/workflow.js';
import { catalogExample as example9 } from './examples/long-activity/example.js';
import * as workflows9 from './examples/long-activity/workflow.js';
import { catalogExample as example10 } from './examples/nexus-greeting/example.js';
import * as workflows10 from './examples/nexus-greeting/workflow.js';
import { catalogExample as example11 } from './examples/parallel-activities/example.js';
import * as workflows11 from './examples/parallel-activities/workflow.js';
import { catalogExample as example12 } from './examples/pending-activities/example.js';
import * as workflows12 from './examples/pending-activities/workflow.js';
import { catalogExample as example13 } from './examples/pending-nexus/example.js';
import * as workflows13 from './examples/pending-nexus/workflow.js';
import { catalogExample as example14 } from './examples/priority-fairness/example.js';
import * as workflows14 from './examples/priority-fairness/workflow.js';
import { catalogExample as example15 } from './examples/satellite-launch-event-groups/example.js';
import * as workflows15 from './examples/satellite-launch-event-groups/workflow.js';
import { catalogExample as example16 } from './examples/sequential-activities/example.js';
import * as workflows16 from './examples/sequential-activities/workflow.js';
import { catalogExample as example17 } from './examples/sequential-markdown-activities/example.js';
import * as workflows17 from './examples/sequential-markdown-activities/workflow.js';
import { catalogExample as example18 } from './examples/sequential-multiline-summary-activities/example.js';
import * as workflows18 from './examples/sequential-multiline-summary-activities/workflow.js';
import { catalogExample as example19 } from './examples/sequential-no-summary-activities/example.js';
import * as workflows19 from './examples/sequential-no-summary-activities/workflow.js';
import { catalogExample as example20 } from './examples/sequential-plain-text-activities/example.js';
import * as workflows20 from './examples/sequential-plain-text-activities/workflow.js';
import { catalogExample as example21 } from './examples/signal-collector/example.js';
import * as workflows21 from './examples/signal-collector/workflow.js';
import { catalogExample as example22 } from './examples/signal-handlers/example.js';
import * as workflows22 from './examples/signal-handlers/workflow.js';
import { catalogExample as example23 } from './examples/slow-nexus-operation/example.js';
import { catalogExample as example24 } from './examples/standalone-activity/example.js';
import { catalogExample as example25 } from './examples/timer-driven-repetition/example.js';
import * as workflows25 from './examples/timer-driven-repetition/workflow.js';
import { catalogExample as example26 } from './examples/worker-crash/example.js';
import * as workflows26 from './examples/worker-crash/workflow.js';
import { catalogExample as example27 } from './examples/workflow-feature-tour/example.js';
import * as workflows27 from './examples/workflow-feature-tour/workflow.js';
import { catalogExample as example28 } from './examples/workflow-patching/example.js';
import * as workflows28 from './examples/workflow-patching/workflow.js';
import { catalogWorkspace as sourceWorkspace } from './examples/workspace.js';
import {
  type CatalogRegistrationSource,
  registerCatalogSource,
} from './registration-source.js';

export const catalogRegistrationSource: CatalogRegistrationSource = {
  source: { id: 'oss', label: 'OSS' },
  sourceFiles: [
    'src/lib/catalog/worker/examples/workspace.ts',
    'src/lib/catalog/worker/examples/inventory.ts',
    'src/lib/catalog/worker/examples/shared-activities.ts',
    'src/lib/catalog/worker/examples/activity-heartbeat/activity.ts',
    'src/lib/catalog/worker/examples/activity-heartbeat/example.ts',
    'src/lib/catalog/worker/examples/activity-heartbeat/workflow.ts',
    'src/lib/catalog/worker/examples/activity-retry/activity.ts',
    'src/lib/catalog/worker/examples/activity-retry/example.ts',
    'src/lib/catalog/worker/examples/activity-retry/workflow.ts',
    'src/lib/catalog/worker/examples/activity-timeout/activity.ts',
    'src/lib/catalog/worker/examples/activity-timeout/example.ts',
    'src/lib/catalog/worker/examples/activity-timeout/workflow.ts',
    'src/lib/catalog/worker/examples/child-fan-out/example.ts',
    'src/lib/catalog/worker/examples/child-fan-out/workflow.ts',
    'src/lib/catalog/worker/examples/child-workflows/example.ts',
    'src/lib/catalog/worker/examples/child-workflows/workflow.ts',
    'src/lib/catalog/worker/examples/hello/example.ts',
    'src/lib/catalog/worker/examples/hello/workflow.ts',
    'src/lib/catalog/worker/examples/high-event-count/example.ts',
    'src/lib/catalog/worker/examples/high-event-count/workflow.ts',
    'src/lib/catalog/worker/examples/large-history/activity.ts',
    'src/lib/catalog/worker/examples/large-history/example.ts',
    'src/lib/catalog/worker/examples/large-history/workflow.ts',
    'src/lib/catalog/worker/examples/local-activity/example.ts',
    'src/lib/catalog/worker/examples/local-activity/workflow.ts',
    'src/lib/catalog/worker/examples/long-activity/activity.ts',
    'src/lib/catalog/worker/examples/long-activity/example.ts',
    'src/lib/catalog/worker/examples/long-activity/workflow.ts',
    'src/lib/catalog/worker/examples/nexus-greeting/example.ts',
    'src/lib/catalog/worker/examples/nexus-greeting/handler.ts',
    'src/lib/catalog/worker/examples/nexus-greeting/service.ts',
    'src/lib/catalog/worker/examples/nexus-greeting/workflow.ts',
    'src/lib/catalog/worker/examples/parallel-activities/example.ts',
    'src/lib/catalog/worker/examples/parallel-activities/workflow.ts',
    'src/lib/catalog/worker/examples/pending-activities/activity.ts',
    'src/lib/catalog/worker/examples/pending-activities/example.ts',
    'src/lib/catalog/worker/examples/pending-activities/workflow.ts',
    'src/lib/catalog/worker/examples/pending-nexus/example.ts',
    'src/lib/catalog/worker/examples/pending-nexus/handler.ts',
    'src/lib/catalog/worker/examples/pending-nexus/service.ts',
    'src/lib/catalog/worker/examples/pending-nexus/workflow.ts',
    'src/lib/catalog/worker/examples/priority-fairness/example.ts',
    'src/lib/catalog/worker/examples/priority-fairness/workflow.ts',
    'src/lib/catalog/worker/examples/satellite-launch-event-groups/activity.ts',
    'src/lib/catalog/worker/examples/satellite-launch-event-groups/example.ts',
    'src/lib/catalog/worker/examples/satellite-launch-event-groups/workflow.ts',
    'src/lib/catalog/worker/examples/sequential-activities/example.ts',
    'src/lib/catalog/worker/examples/sequential-activities/workflow.ts',
    'src/lib/catalog/worker/examples/sequential-markdown-activities/activities.ts',
    'src/lib/catalog/worker/examples/sequential-markdown-activities/example.ts',
    'src/lib/catalog/worker/examples/sequential-markdown-activities/workflow.ts',
    'src/lib/catalog/worker/examples/sequential-multiline-summary-activities/activities.ts',
    'src/lib/catalog/worker/examples/sequential-multiline-summary-activities/example.ts',
    'src/lib/catalog/worker/examples/sequential-multiline-summary-activities/workflow.ts',
    'src/lib/catalog/worker/examples/sequential-no-summary-activities/activities.ts',
    'src/lib/catalog/worker/examples/sequential-no-summary-activities/example.ts',
    'src/lib/catalog/worker/examples/sequential-no-summary-activities/workflow.ts',
    'src/lib/catalog/worker/examples/sequential-plain-text-activities/activities.ts',
    'src/lib/catalog/worker/examples/sequential-plain-text-activities/example.ts',
    'src/lib/catalog/worker/examples/sequential-plain-text-activities/workflow.ts',
    'src/lib/catalog/worker/examples/signal-collector/activity.ts',
    'src/lib/catalog/worker/examples/signal-collector/example.ts',
    'src/lib/catalog/worker/examples/signal-collector/workflow.ts',
    'src/lib/catalog/worker/examples/signal-handlers/activity.ts',
    'src/lib/catalog/worker/examples/signal-handlers/example.ts',
    'src/lib/catalog/worker/examples/signal-handlers/workflow.ts',
    'src/lib/catalog/worker/examples/slow-nexus-operation/example.ts',
    'src/lib/catalog/worker/examples/slow-nexus-operation/handler.ts',
    'src/lib/catalog/worker/examples/slow-nexus-operation/service.ts',
    'src/lib/catalog/worker/examples/standalone-activity/activity.ts',
    'src/lib/catalog/worker/examples/standalone-activity/example.ts',
    'src/lib/catalog/worker/examples/timer-driven-repetition/example.ts',
    'src/lib/catalog/worker/examples/timer-driven-repetition/workflow.ts',
    'src/lib/catalog/worker/examples/worker-crash/example.ts',
    'src/lib/catalog/worker/examples/worker-crash/workflow.ts',
    'src/lib/catalog/worker/examples/workflow-feature-tour/activity.ts',
    'src/lib/catalog/worker/examples/workflow-feature-tour/example.ts',
    'src/lib/catalog/worker/examples/workflow-feature-tour/handler.ts',
    'src/lib/catalog/worker/examples/workflow-feature-tour/service.ts',
    'src/lib/catalog/worker/examples/workflow-feature-tour/workflow.ts',
    'src/lib/catalog/worker/examples/workflow-patching/example.ts',
    'src/lib/catalog/worker/examples/workflow-patching/workflow.ts',
  ],
  register: (registry) =>
    registerCatalogSource(
      registry,
      {
        id: 'shared-workflows',
        grouping: 'shared',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowsPath: new URL('./workflows.js', import.meta.url).href,
        metadata: sourceWorkspace,
      },
      [
        {
          id: 'activity-heartbeat',
          example: example0,
          workflows: workflows0,
          workflowsPath: new URL(
            './examples/activity-heartbeat/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'activity-retry',
          example: example1,
          workflows: workflows1,
          workflowsPath: new URL(
            './examples/activity-retry/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'activity-timeout',
          example: example2,
          workflows: workflows2,
          workflowsPath: new URL(
            './examples/activity-timeout/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'child-fan-out',
          example: example3,
          workflows: workflows3,
          workflowsPath: new URL(
            './examples/child-fan-out/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'child-workflows',
          example: example4,
          workflows: workflows4,
          workflowsPath: new URL(
            './examples/child-workflows/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'hello',
          example: example5,
          workflows: workflows5,
          workflowsPath: new URL(
            './examples/hello/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'high-event-count',
          example: example6,
          workflows: workflows6,
          workflowsPath: new URL(
            './examples/high-event-count/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'large-history',
          example: example7,
          workflows: workflows7,
          workflowsPath: new URL(
            './examples/large-history/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'local-activity',
          example: example8,
          workflows: workflows8,
          workflowsPath: new URL(
            './examples/local-activity/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'long-activity',
          example: example9,
          workflows: workflows9,
          workflowsPath: new URL(
            './examples/long-activity/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'nexus-greeting',
          example: example10,
          workflows: workflows10,
          workflowsPath: new URL(
            './examples/nexus-greeting/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'parallel-activities',
          example: example11,
          workflows: workflows11,
          workflowsPath: new URL(
            './examples/parallel-activities/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'pending-activities',
          example: example12,
          workflows: workflows12,
          workflowsPath: new URL(
            './examples/pending-activities/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'pending-nexus',
          example: example13,
          workflows: workflows13,
          workflowsPath: new URL(
            './examples/pending-nexus/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'priority-fairness',
          example: example14,
          workflows: workflows14,
          workflowsPath: new URL(
            './examples/priority-fairness/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'satellite-launch-event-groups',
          example: example15,
          workflows: workflows15,
          workflowsPath: new URL(
            './examples/satellite-launch-event-groups/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'sequential-activities',
          example: example16,
          workflows: workflows16,
          workflowsPath: new URL(
            './examples/sequential-activities/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'sequential-markdown-activities',
          example: example17,
          workflows: workflows17,
          workflowsPath: new URL(
            './examples/sequential-markdown-activities/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'sequential-multiline-summary-activities',
          example: example18,
          workflows: workflows18,
          workflowsPath: new URL(
            './examples/sequential-multiline-summary-activities/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'sequential-no-summary-activities',
          example: example19,
          workflows: workflows19,
          workflowsPath: new URL(
            './examples/sequential-no-summary-activities/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'sequential-plain-text-activities',
          example: example20,
          workflows: workflows20,
          workflowsPath: new URL(
            './examples/sequential-plain-text-activities/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'signal-collector',
          example: example21,
          workflows: workflows21,
          workflowsPath: new URL(
            './examples/signal-collector/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'signal-handlers',
          example: example22,
          workflows: workflows22,
          workflowsPath: new URL(
            './examples/signal-handlers/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'slow-nexus-operation',
          example: example23,
        },
        {
          id: 'standalone-activity',
          example: example24,
        },
        {
          id: 'timer-driven-repetition',
          example: example25,
          workflows: workflows25,
          workflowsPath: new URL(
            './examples/timer-driven-repetition/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'worker-crash',
          example: example26,
          workflows: workflows26,
          workflowsPath: new URL(
            './examples/worker-crash/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'workflow-feature-tour',
          example: example27,
          workflows: workflows27,
          workflowsPath: new URL(
            './examples/workflow-feature-tour/workflow.js',
            import.meta.url,
          ).href,
        },
        {
          id: 'workflow-patching',
          example: example28,
          workflows: workflows28,
          workflowsPath: new URL(
            './examples/workflow-patching/workflow.js',
            import.meta.url,
          ).href,
        },
      ],
    ),
};
