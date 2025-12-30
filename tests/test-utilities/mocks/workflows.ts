import type { Page } from '@playwright/test';

export const WORKFLOWS_API = /\/api\/v1\/namespaces\/[^/]+\/workflows/;

const mockWorkflow = {
  execution: {
    workflowId: '002c98_Running',
    runId: '54a1a2c3-9322-4f75-88ea-bf5660c251d0',
  },
  type: {
    name: 'ImportantWorkflowType',
  },
  startTime: '2022-03-23T18:06:01.726484047Z',
  closeTime: null,
  status: 'Running',
  historyLength: '0',
  parentNamespaceId: '',
  parentExecution: null,
  executionTime: '2022-03-23T18:06:01.726484047Z',
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
        data: 'WyIzMmUwNDI1OWUzYTFlMTM3ZmE2Njg5M2JiNjE3OTc5YSJd',
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
        data: 'IjIwMjItMDMtMjNUMTg6MDY6MDEuNzIwMTM3WiI=',
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
        data: 'InJhaW5ib3ctc3RhdHVzZXMtMDAyYzk4Ig==',
      },
      CustomStringField: {
        metadata: {
          encoding: 'anNvbi9wbGFpbg==',
          type: 'VGV4dA==',
        },
        data: 'InJhaW5ib3cgc3RhdHVzZXMgMDAyYzk4IFJ1bm5pbmci',
      },
    },
  },
  autoResetPoints: null,
  taskQueue: 'rainbow-statuses',
  stateTransitionCount: '0',
};

export const mockWorkflowsApi = (page: Page) => {
  return page.route(WORKFLOWS_API, (route) => {
    return route.fulfill({
      json: {
        executions: [mockWorkflow, mockWorkflow, mockWorkflow],
        nextPageToken: null,
      },
    });
  });
};
