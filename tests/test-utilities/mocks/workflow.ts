import type { Page } from '@playwright/test';

import type { WorkflowExecutionAPIResponse } from '$src/lib/types/workflows';

export const WORKFLOW_API = '**/api/v1/namespaces/*/workflows/*?';
export const WORKFLOW_RESET_API = '**/api/v1/namespaces/*/workflows/*/reset*';
export const WORKFLOW_TERMINATE_API =
  '**/api/v1/namespaces/*/workflows/*/terminate*';

export const mockWorkflow = {
  executionConfig: {
    taskQueue: {
      name: 'rainbow-statuses',
      kind: 'Normal',
    },
    workflowExecutionTimeout: '0s',
    workflowRunTimeout: '0s',
    defaultWorkflowTaskTimeout: '10s',
  },
  workflowExecutionInfo: {
    execution: {
      workflowId: '09db15_Running',
      runId: '4284ef9a-947f-4db2-bf15-dbc377e71fa6',
    },
    type: {
      name: 'RainbowStatusesWorkflow',
    },
    startTime: '2022-04-28T05:50:48.264756929Z',
    closeTime: null,
    status: 'Running',
    historyLength: '6',
    parentNamespaceId: '',
    parentExecution: null,
    historySizeBytes: '',
    executionTime: '2022-04-28T05:50:48.264756929Z',
    memo: {
      fields: {},
    },
    searchAttributes: {
      indexedFields: {
        BinaryChecksums: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'WyIzN2VhNzVjMzc4MDFjMTY2N2IyOThlNGYxZjk1NWE3MCJd',
        },
        CustomBoolField: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'Qm9vbA==',
          },
          data: 'dHJ1ZQ==',
        },
        CustomDatetimeField: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'RGF0ZXRpbWU=',
          },
          data: 'IjIwMjItMDQtMjhUMDU6NTA6NDguMjYzNTE2MDVaIg==',
        },
        CustomDoubleField: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'RG91Ymxl',
          },
          data: 'MA==',
        },
        CustomIntField: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'SW50',
          },
          data: 'MA==',
        },
        CustomKeywordField: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZA==',
          },
          data: 'InJhaW5ib3ctc3RhdHVzZXMtMDlkYjE1Ig==',
        },
        CustomStringField: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'VGV4dA==',
          },
          data: 'InJhaW5ib3cgc3RhdHVzZXMgMDlkYjE1IFJ1bm5pbmci',
        },
      },
    },
    autoResetPoints: {
      points: [
        {
          binaryChecksum: '37ea75c37801c1667b298e4f1f955a70',
          runId: '4284ef9a-947f-4db2-bf15-dbc377e71fa6',
          firstWorkflowTaskCompletedId: '5',
          createTime: '2022-04-28T05:50:48.291718480Z',
          expireTime: null,
          resettable: true,
        },
      ],
    },
    taskQueue: 'rainbow-statuses',
    stateTransitionCount: '5',
  },
  pendingActivities: [
    {
      activityId: '6',
      activityType: {
        name: 'LongActivity',
      },
      state: 'Started',
      heartbeatDetails: null,
      lastHeartbeatTime: '2022-04-28T05:50:48.306477858Z',
      lastStartedTime: '2022-04-28T05:50:48.306477858Z',
      attempt: 1,
      maximumAttempts: 1,
      scheduledTime: null,
      expirationTime: '0001-01-01T00:00:00Z',
      lastFailure: null,
      lastWorkerIdentity: '173471@user0@',
    },
  ],
  pendingChildren: [],
} satisfies WorkflowExecutionAPIResponse;

export const mockCompletedWorkflow = {
  executionConfig: {
    taskQueue: {
      name: 'await_signals',
      kind: 'TASK_QUEUE_KIND_NORMAL',
    },
    workflowExecutionTimeout: '0s',
    workflowRunTimeout: '0s',
    defaultWorkflowTaskTimeout: '10s',
  },
  workflowExecutionInfo: {
    execution: {
      workflowId: 'await_signals_f1483b17-152e-442d-a8c0-145682f76d4f',
      runId: '5776fab0-f316-4880-9fa5-6ebb2293a1c5',
    },
    type: {
      name: 'AwaitSignalsWorkflow',
    },
    startTime: '2024-05-17T15:25:26.888913Z',
    closeTime: '2024-05-17T15:25:30.921605Z',
    status: 'WORKFLOW_EXECUTION_STATUS_COMPLETED',
    historyLength: '16',
    executionTime: '2024-05-17T15:25:26.888913Z',
    memo: {},
    searchAttributes: {
      indexedFields: {
        BuildIds: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZExpc3Q=',
          },
          data: 'WyJ1bnZlcnNpb25lZCIsInVudmVyc2lvbmVkOjYzNTliM2IxYWQwYTZhYWY3N2M3NTdlODU0NzA3YTA1Il0=',
        },
      },
    },
    autoResetPoints: {
      points: [
        {
          buildId: '6359b3b1ad0a6aaf77c757e854707a05',
          runId: '5776fab0-f316-4880-9fa5-6ebb2293a1c5',
          firstWorkflowTaskCompletedId: '5',
          createTime: '2024-05-17T15:25:26.894727Z',
          resettable: true,
        },
      ],
    },
    taskQueue: 'await_signals',
    stateTransitionCount: '10',
    historySizeBytes: '1668',
    mostRecentWorkerVersionStamp: {
      buildId: '6359b3b1ad0a6aaf77c757e854707a05',
    },
  },
} satisfies WorkflowExecutionAPIResponse;

export const mockResetWorkflow: WorkflowExecutionAPIResponse = {
  executionConfig: {
    taskQueue: {
      name: 'default',
      kind: 'TASK_QUEUE_KIND_NORMAL',
    },
    defaultWorkflowTaskTimeout: '10s',
  },
  workflowExecutionInfo: {
    execution: {
      workflowId: '09db17_Running',
      runId: '4284ef9a-947f-4db2-bf15-dbc377e71fa7',
    },
    type: {
      name: 'failing',
    },
    startTime: '2025-04-28T19:36:37.170960Z',
    closeTime: '2025-04-28T19:36:37.214083Z',
    status: 'WORKFLOW_EXECUTION_STATUS_FAILED',
    historyLength: '14',
    executionTime: '2025-04-28T19:36:37.170960Z',
    memo: {},
    searchAttributes: {
      indexedFields: {
        BuildIds: {
          metadata: {
            encoding: 'anNvbi9wbGFpbg==',
            type: 'S2V5d29yZExpc3Q=',
          },
          data: 'WyJ1bnZlcnNpb25lZCIsInVudmVyc2lvbmVkOkB0ZW1wb3JhbGlvL3dvcmtlckAxLjExLjcrMzkyYWNkMTVkNzVjYjZjZTlmNjY4YzZlNjJjOTdmMTk0MzBkZmU4ODc4YTRmZjljZGYxYWQ5MGFlMzA1ODkwMCJd',
        },
      },
    },
    autoResetPoints: {
      points: [
        {
          buildId:
            '@temporalio/worker@1.11.7+392acd15d75cb6ce9f668c6e62c97f19430dfe8878a4ff9cdf1ad90ae3058900',
          runId: '874c3bed-52ef-462e-9b27-195ef359f11c',
          firstWorkflowTaskCompletedId: '7',
          createTime: '2025-04-28T19:36:37.195767Z',
          resettable: true,
        },
      ],
    },
    taskQueue: 'workflow-statuses',
    stateTransitionCount: '8',
    historySizeBytes: '2713',
    mostRecentWorkerVersionStamp: {
      buildId:
        '@temporalio/worker@1.11.7+392acd15d75cb6ce9f668c6e62c97f19430dfe8878a4ff9cdf1ad90ae3058900',
    },
    executionDuration: '0.043123s',
  },
  workflowExtendedInfo: {
    originalStartTime: '2025-04-28T19:36:14.998303Z',
    resetRunId: 'reset-run-id',
  },
} satisfies WorkflowExecutionAPIResponse;

export const mockWorkflowApi = (
  page: Page,
  workflow: WorkflowExecutionAPIResponse = mockWorkflow,
) => {
  return page.route(WORKFLOW_API, (route) => {
    return route.fulfill({
      json: workflow,
    });
  });
};

export const mockWorkflowResetApi = (page: Page) => {
  return page.route(WORKFLOW_RESET_API, (route) => {
    return route.fulfill({
      json: {},
    });
  });
  return;
};
