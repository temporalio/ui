import type { Page } from '@playwright/test';

export const WORKFLOW_API = '**/api/v1/namespaces/*/workflows/*/runs/*?';

const mockWorkflow = {
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
  pendingWorkflowTask: null,
};

export const mockWorkflowApi = (page: Page) => {
  return page.route(WORKFLOW_API, (route) => {
    return route.fulfill({
      json: mockWorkflow,
    });
  });
};
