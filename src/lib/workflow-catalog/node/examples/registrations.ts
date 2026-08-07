import type { WorkflowCatalogExampleRegistration } from '../registry.js';
import * as activities from './activities.js';
import { exampleInputs, workflowStartOptions } from './schemas.js';
import {
  childWorkflowTest,
  highEventCountWorkflow,
  localActivityWorkflow,
  patchWorkflow,
  scheduleWorkflow,
  signalCollector,
} from './workflows.js';

const targetId = 'shared-workflows';

export const sharedWorkflowExamples: WorkflowCatalogExampleRegistration[] = [
  {
    id: 'timer-driven-repetition',
    title: 'Timer-driven repeated activities',
    description: 'Uses durable timers between repeated activity commands.',
    targetId,
    capabilityTags: ['timers', 'activities'],
    expectedEvidence: [
      'Timer events separate each repeated activity execution.',
    ],
    input: exampleInputs.scheduleWorkflow,
    startOptions: workflowStartOptions('timer-driven-repetition'),
    execution: {
      kind: 'workflow',
      workflowType: 'scheduleWorkflow',
      workflow: scheduleWorkflow,
      activities: { processData: activities.processData },
    },
  },
  {
    id: 'high-event-count',
    title: 'High event count',
    description: 'Runs many concurrent activities to produce a dense history.',
    targetId,
    capabilityTags: ['event-history', 'concurrency'],
    expectedEvidence: [
      'A dense group of concurrent activity events in workflow history.',
    ],
    input: exampleInputs.highEventCountWorkflow,
    startOptions: workflowStartOptions('high-event-count'),
    execution: {
      kind: 'workflow',
      workflowType: 'highEventCountWorkflow',
      workflow: highEventCountWorkflow,
      activities: { processData: activities.processData },
    },
  },
  {
    id: 'child-workflows',
    title: 'Child workflows',
    description: 'Starts and joins three child workflow executions.',
    targetId,
    capabilityTags: ['child-workflows', 'concurrency'],
    expectedEvidence: [
      'Three child workflow relationships and one joined parent result.',
    ],
    input: exampleInputs.childWorkflowTest,
    startOptions: workflowStartOptions('child-workflows'),
    execution: {
      kind: 'workflow',
      workflowType: 'childWorkflowTest',
      workflow: childWorkflowTest,
      activities: {
        greet: activities.greet,
        processData: activities.processData,
      },
    },
  },
  {
    id: 'local-activity',
    title: 'Local activity',
    description: 'Runs activity code in the workflow worker process.',
    targetId,
    capabilityTags: ['local-activities', 'activities'],
    expectedEvidence: [
      'A local activity marker and completed workflow result.',
    ],
    input: exampleInputs.localActivityWorkflow,
    startOptions: workflowStartOptions('local-activity'),
    execution: {
      kind: 'workflow',
      workflowType: 'localActivityWorkflow',
      workflow: localActivityWorkflow,
      activities: { processData: activities.processData },
    },
  },
  {
    id: 'workflow-patching',
    title: 'Workflow patching',
    description: 'Records patch markers around versioned workflow behavior.',
    targetId,
    capabilityTags: ['patching', 'versioning'],
    expectedEvidence: [
      'Patch markers and version-specific result sections in history.',
    ],
    input: exampleInputs.patchWorkflow,
    startOptions: workflowStartOptions('workflow-patching'),
    execution: {
      kind: 'workflow',
      workflowType: 'patchWorkflow',
      workflow: patchWorkflow,
      activities: { processData: activities.processData },
    },
  },
  {
    id: 'signal-collector',
    title: 'Signal collector',
    description:
      'Collects signaled items before processing and summarizing them.',
    targetId,
    capabilityTags: ['signals', 'activities', 'timeouts'],
    expectedEvidence: [
      'Item signals followed by activity processing and a completion reason.',
    ],
    input: exampleInputs.signalCollector,
    startOptions: workflowStartOptions('signal-collector'),
    execution: {
      kind: 'workflow',
      workflowType: 'signalCollector',
      workflow: signalCollector,
      activities: {
        generateSummary: activities.generateSummary,
        processItem: activities.processItem,
      },
    },
  },
];
