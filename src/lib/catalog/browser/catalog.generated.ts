import type { BrowserCatalogArtifact } from './types';

export const catalogArtifact: BrowserCatalogArtifact = {
  sourceHash:
    '66123f70d6c4db8f6633b8f1a3ebcb68565c30e40ebed47297df9338a88c0a76',
  descriptors: [
    {
      id: 'activity-heartbeat',
      title: 'Activity heartbeats',
      description:
        'Reports progress while an activity processes several steps.',
      capabilityTags: ['activities', 'heartbeats'],
      expectedEvidence: [
        'Heartbeat details advance through the configured number of steps.',
      ],
      input: {
        defaultValue: [5, 1000],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Heartbeat steps',
              type: 'integer',
              minimum: 1,
              maximum: 25,
            },
            {
              title: 'Step delay in milliseconds',
              type: 'integer',
              minimum: 1,
              maximum: 1000,
            },
          ],
          items: false,
          maxItems: 2,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'heartbeatWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'activity-retry',
      title: 'Activity retry',
      description: 'Fails deterministic activity attempts before succeeding.',
      capabilityTags: ['activities', 'retries'],
      expectedEvidence: [
        'Failed activity attempts followed by success within the retry policy.',
      ],
      input: {
        defaultValue: [2],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Failures before success',
              type: 'integer',
              minimum: 0,
              maximum: 4,
            },
          ],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'retryWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'activity-timeout',
      title: 'Activity timeout',
      description: 'Demonstrates a start-to-close activity timeout.',
      capabilityTags: ['activities', 'timeouts'],
      expectedEvidence: [
        'A timed-out activity attempt and a workflow result that identifies the timeout.',
      ],
      input: {
        defaultValue: [true],
        schema: {
          type: 'array',
          prefixItems: [
            { title: 'Force the activity to time out', type: 'boolean' },
          ],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'timeoutWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'child-workflows',
      title: 'Child workflows',
      description: 'Starts and joins three child workflow executions.',
      capabilityTags: ['child-workflows', 'concurrency'],
      expectedEvidence: [
        'Three child workflow relationships and one joined parent result.',
      ],
      input: {
        defaultValue: [],
        schema: { type: 'array', items: false, maxItems: 0 },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'childWorkflowTest',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'continue-as-new',
      title: 'Continue-as-new run chain',
      description:
        'Runs a short timer in each execution before continuing as new.',
      capabilityTags: ['continue-as-new', 'timers', 'event-history'],
      expectedEvidence: [
        'By default, three executions share one workflow ID and have distinct run IDs.',
        'The first two histories end with WorkflowExecutionContinuedAsNew; the final history completes.',
        'Each execution contains a timer lifecycle.',
      ],
      input: {
        defaultValue: [3],
        schema: {
          type: 'array',
          prefixItems: [
            { title: 'Total runs', type: 'integer', minimum: 1, maximum: 10 },
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
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'continueAsNewWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'hello',
      title: 'Hello activity',
      description: 'Runs one activity and returns its greeting.',
      capabilityTags: ['activities', 'terminal-outcome'],
      expectedEvidence: [
        'One completed activity and a completed workflow result.',
      ],
      input: {
        defaultValue: ['Temporal'],
        schema: {
          type: 'array',
          prefixItems: [{ title: 'Name', type: 'string', minLength: 1 }],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'hello',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'high-event-count',
      title: 'High event count',
      description:
        'Runs many concurrent activities to produce a dense history.',
      capabilityTags: ['event-history', 'concurrency'],
      expectedEvidence: [
        'A dense group of concurrent activity events in workflow history.',
      ],
      input: {
        defaultValue: [7, 2000],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Concurrent activity count',
              type: 'integer',
              minimum: 1,
              maximum: 100,
            },
            {
              title: 'Activity delay in milliseconds',
              type: 'integer',
              minimum: 1,
              maximum: 25000,
            },
          ],
          items: false,
          maxItems: 2,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'highEventCountWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'local-activity',
      title: 'Local activity',
      description: 'Runs activity code in the workflow worker process.',
      capabilityTags: ['local-activities', 'activities'],
      expectedEvidence: [
        'A local activity marker and completed workflow result.',
      ],
      input: {
        defaultValue: ['catalog-local'],
        schema: {
          type: 'array',
          prefixItems: [{ title: 'Input data', type: 'string', minLength: 1 }],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'localActivityWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'long-activity',
      title: 'Long-running activity',
      description: 'Waits inside an activity before returning a result.',
      capabilityTags: ['activities', 'long-running'],
      expectedEvidence: [
        'An activity remains running for the configured delay and then completes.',
      ],
      input: {
        defaultValue: [5000],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Delay in milliseconds',
              type: 'integer',
              minimum: 1,
              maximum: 25000,
            },
          ],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'longActivity',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'nexus-greeting',
      title: 'Nexus greeting',
      description:
        'Calls a Nexus operation from a workflow through a declared Nexus endpoint.',
      capabilityTags: ['nexus', 'terminal-outcome'],
      expectedEvidence: [
        'A completed workflow whose result is the greeting returned by the Nexus operation.',
      ],
      input: {
        defaultValue: ['Temporal'],
        schema: {
          type: 'array',
          prefixItems: [{ title: 'Name', type: 'string', minLength: 1 }],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      setupMarkdown:
        'The workflow calls the `greet` operation on the `catalog-greeting` service through the `ui-catalog` Nexus endpoint.\n\n- **Local development:** the catalog worker creates the endpoint automatically when it starts.\n- **Other environments:** create the endpoint yourself before running, adjusting the address for your server:\n\n```\ntemporal operator nexus endpoint create --name ui-catalog --target-namespace <namespace> --target-task-queue ui-catalog\n```',
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'nexusGreeting',
        nexusEndpoints: ['ui-catalog'],
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'parallel-activities',
      title: 'Parallel activities',
      description: 'Runs three activity commands concurrently.',
      capabilityTags: ['activities', 'concurrency'],
      expectedEvidence: [
        'Three overlapping activity executions and one combined result.',
      ],
      input: {
        defaultValue: ['catalog-parallel'],
        schema: {
          type: 'array',
          prefixItems: [{ title: 'Data ID', type: 'string', minLength: 1 }],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'parallelActivities',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'priority-fairness',
      title: 'Priority and fairness',
      description:
        'Starts a prioritized workflow whose activity inherits its priority.',
      capabilityTags: ['priority-fairness', 'activities'],
      expectedEvidence: [
        'Workflow details show priority and fairness fields; the scheduled activity attributes show inherited priority.',
      ],
      input: {
        defaultValue: [],
        schema: { type: 'array', items: false, maxItems: 0 },
      },
      startOptions: {
        defaultValue: {
          priority: {
            priorityKey: 1,
            fairnessKey: 'catalog',
            fairnessWeight: 2,
          },
        },
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
            priority: {
              type: 'object',
              properties: {
                priorityKey: { type: 'integer', minimum: 1 },
                fairnessKey: { type: 'string', minLength: 1 },
                fairnessWeight: {
                  type: 'number',
                  minimum: 0.001,
                  maximum: 1000,
                },
              },
              required: ['priorityKey', 'fairnessKey', 'fairnessWeight'],
              additionalProperties: false,
            },
          },
          required: ['priority'],
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'priorityFairnessWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'sequential-activities',
      title: 'Sequential activities',
      description: 'Runs three activity commands one after another.',
      capabilityTags: ['activities', 'sequencing'],
      expectedEvidence: [
        'Three non-overlapping activity executions in deterministic order.',
      ],
      input: {
        defaultValue: ['catalog-sequential'],
        schema: {
          type: 'array',
          prefixItems: [{ title: 'Data ID', type: 'string', minLength: 1 }],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'sequentialActivities',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'sequential-markdown-activities',
      title: 'Sequential activities with Markdown summaries',
      description:
        'Runs 20 activities by default with Markdown summaries and retries one step three times.',
      capabilityTags: ['activities', 'sequencing', 'retries'],
      expectedEvidence: [
        'The configured number of non-overlapping activity executions in deterministic order.',
        'When included, logging step 10 fails three attempts and succeeds on attempt four.',
        'Each activity summary displays a Logging System link.',
      ],
      input: {
        defaultValue: [20],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Activity count',
              type: 'integer',
              minimum: 1,
              maximum: 2000,
            },
          ],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'sequentialMarkdownActivities',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'sequential-no-summary-activities',
      title: 'Sequential activities without summaries',
      description: 'Runs 20 activities by default without summaries.',
      capabilityTags: ['activities', 'sequencing'],
      expectedEvidence: [
        'The configured number of non-overlapping activity executions in deterministic order.',
        'Activity timeline entries do not display summaries.',
      ],
      input: {
        defaultValue: [20],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Activity count',
              type: 'integer',
              minimum: 1,
              maximum: 2000,
            },
          ],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'sequentialNoSummaryActivities',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'sequential-plain-text-activities',
      title: 'Sequential plain text activities',
      description:
        'Runs 20 activities by default with an indexed plain-text summary.',
      capabilityTags: ['activities', 'sequencing'],
      expectedEvidence: [
        'The configured number of non-overlapping activity executions in deterministic order.',
        'Activity summaries range from Activity 1 through the configured count.',
      ],
      input: {
        defaultValue: [20],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Activity count',
              type: 'integer',
              minimum: 1,
              maximum: 2000,
            },
          ],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'sequentialPlainTextActivities',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'signal-collector',
      title: 'Signal collector',
      description:
        'Collects signaled items before processing and summarizing them.',
      capabilityTags: ['signals', 'activities', 'timeouts'],
      expectedEvidence: [
        'Item signals followed by activity processing and a completion reason.',
      ],
      input: {
        defaultValue: [{ timeoutSeconds: 30, maxItems: 3 }],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Collector configuration',
              type: 'object',
              properties: {
                timeoutSeconds: { type: 'integer', minimum: 1, maximum: 300 },
                maxItems: { type: 'integer', minimum: 1, maximum: 100 },
              },
              additionalProperties: false,
            },
          ],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'signalCollector',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'signal-handlers',
      title: 'Bounded signal handlers',
      description: 'Handles data and completion signals with bounded waits.',
      capabilityTags: ['signals', 'queries', 'timeouts'],
      expectedEvidence: [
        'Signal events, queryable state changes, and completion or timeout evidence.',
      ],
      input: {
        defaultValue: [30],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Signal wait timeout in seconds',
              type: 'integer',
              minimum: 1,
              maximum: 300,
            },
          ],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'signalWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'standalone-activity',
      title: 'Standalone activity',
      description: 'Runs an Activity directly without a Workflow execution.',
      capabilityTags: ['activities', 'standalone', 'terminal-outcome'],
      expectedEvidence: [
        'Standalone Activity details and result are available without a Workflow execution.',
      ],
      input: {
        defaultValue: { name: 'Temporal' },
        schema: {
          type: 'object',
          properties: { name: { type: 'string', minLength: 1 } },
          required: ['name'],
          additionalProperties: false,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: { type: 'object', properties: {} },
      },
      execution: {
        kind: 'standalone-activity',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        activityType: 'standalone-activity',
        timeouts: { scheduleToCloseTimeout: '60s', startToCloseTimeout: '30s' },
        policies: { retryPolicy: { maximumAttempts: 3 } },
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'timeline-kitchen-sink',
      title: 'Timeline kitchen sink',
      description:
        'Creates a bounded run chain with nested children, activities, retries, signals, timers, markers, and an expected child failure.',
      capabilityTags: [
        'event-history',
        'child-workflows',
        'continue-as-new',
        'activities',
        'retries',
        'signals',
        'timers',
        'updates',
      ],
      expectedEvidence: [
        'Each run starts a child workflow that starts a nested grandchild, and parent and child exchange signals.',
        'An activity fails its first attempt and succeeds on retry; a local activity records a marker.',
        'The first run catches an expected child-workflow failure and continues as new; the final run completes.',
        'Timers start and fire in the root and nested grandchild histories; each root run also cancels a pending timer.',
      ],
      setupMarkdown:
        'The showcase runs on its own and finishes by default. Its signal events are generated by the workflows. Update history events require an external client request: while the final run is waiting, invoke the `timelineKitchenSinkUpdate` update with a string argument. Increase **Final run hold (seconds)** if you want time to send an update. Queries do not create history events, and this example does not attempt to generate every server-internal event type.',
      input: {
        defaultValue: [2, 3],
        schema: {
          type: 'array',
          prefixItems: [
            { title: 'Total runs', type: 'integer', minimum: 1, maximum: 4 },
            {
              title: 'Final run hold (seconds)',
              type: 'integer',
              minimum: 0,
              maximum: 120,
            },
          ],
          items: false,
          minItems: 2,
          maxItems: 2,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'timelineKitchenSink',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
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
      input: {
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
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'timelineLiveWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'timeline-performance',
      title: 'Timeline performance: many timers',
      description:
        'Creates a long history with short timers run in bounded parallel batches.',
      capabilityTags: ['event-history', 'timers', 'performance'],
      expectedEvidence: [
        'Each timer produces started and fired events; each batch also produces workflow-task events.',
        'Try 200, 2000, then 6000 timers to profile increasingly large paged histories.',
      ],
      input: {
        defaultValue: [200],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Timer count',
              type: 'integer',
              minimum: 1,
              maximum: 7000,
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
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'timelinePerformanceWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'timer-driven-repetition',
      title: 'Timer-driven repeated activities',
      description: 'Uses durable timers between repeated activity commands.',
      capabilityTags: ['timers', 'activities'],
      expectedEvidence: [
        'Timer events separate each repeated activity execution.',
      ],
      input: {
        defaultValue: [2, 3],
        schema: {
          type: 'array',
          prefixItems: [
            {
              title: 'Timer interval in seconds',
              type: 'integer',
              minimum: 1,
              maximum: 300,
            },
            { title: 'Run count', type: 'integer', minimum: 1, maximum: 25 },
          ],
          items: false,
          maxItems: 2,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'scheduleWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
    {
      id: 'workflow-patching',
      title: 'Workflow patching',
      description: 'Records patch markers around versioned workflow behavior.',
      capabilityTags: ['patching', 'versioning'],
      expectedEvidence: [
        'Patch markers and version-specific result sections in history.',
      ],
      input: {
        defaultValue: ['catalog-patch'],
        schema: {
          type: 'array',
          prefixItems: [{ title: 'Data ID', type: 'string', minLength: 1 }],
          items: false,
          maxItems: 1,
        },
      },
      startOptions: {
        defaultValue: {},
        schema: {
          type: 'object',
          properties: {
            details: { type: 'string' },
            searchAttributes: { type: 'object' },
            summary: { type: 'string' },
            workflowStartDelay: { type: 'string' },
            workflowId: { type: 'string', minLength: 1 },
          },
        },
      },
      execution: {
        kind: 'workflow',
        targetId: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowType: 'patchWorkflow',
      },
      source: { id: 'oss', label: 'OSS' },
    },
  ],
};
