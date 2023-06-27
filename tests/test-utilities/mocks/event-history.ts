import { Page } from '@playwright/test';

const mockEventHistory = {
  history: {
    events: [
      {
        eventId: '1',
        eventTime: '2022-04-28T05:30:19.427247101Z',
        eventType: 'WorkflowExecutionStarted',
        version: '0',
        taskId: '1367516',
        workflowExecutionStartedEventAttributes: {
          workflowType: {
            name: 'RainbowStatusesWorkflow',
          },
          parentWorkflowNamespace: '',
          parentWorkflowExecution: null,
          parentInitiatedEventId: '0',
          taskQueue: {
            name: 'rainbow-statuses',
            kind: 'Normal',
          },
          input: {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'MQ==',
              },
            ],
          },
          workflowExecutionTimeout: '0s',
          workflowRunTimeout: '0s',
          workflowTaskTimeout: '10s',
          continuedExecutionRunId: '',
          initiator: 'Unspecified',
          continuedFailure: null,
          lastCompletionResult: null,
          originalExecutionRunId: 'be1ded4f-3147-4ec7-8efb-30a447fef129',
          identity: '168773@user0@',
          firstExecutionRunId: 'be1ded4f-3147-4ec7-8efb-30a447fef129',
          retryPolicy: null,
          attempt: 1,
          workflowExecutionExpirationTime: null,
          cronSchedule: '',
          firstWorkflowTaskBackoff: '0s',
          memo: null,
          searchAttributes: {
            indexedFields: {
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
                data: 'IjIwMjItMDQtMjhUMDU6MzA6MTkuNDI2MTkyMDg4WiI=',
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
                data: 'InJhaW5ib3ctc3RhdHVzZXMtZDQ5NGM0Ig==',
              },
              CustomStringField: {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                  type: 'VGV4dA==',
                },
                data: 'InJhaW5ib3cgc3RhdHVzZXMgZDQ5NGM0IFJ1bm5pbmci',
              },
            },
          },
          prevAutoResetPoints: null,
          header: {
            fields: {},
          },
        },
      },
      {
        eventId: '2',
        eventTime: '2022-04-28T05:30:19.427264889Z',
        eventType: 'WorkflowTaskScheduled',
        version: '0',
        taskId: '1367517',
        workflowTaskScheduledEventAttributes: {
          taskQueue: {
            name: 'rainbow-statuses',
            kind: 'Normal',
          },
          startToCloseTimeout: '10s',
          attempt: 1,
        },
      },
      {
        eventId: '3',
        eventTime: '2022-04-28T05:30:19.436957880Z',
        eventType: 'WorkflowExecutionSignaled',
        version: '0',
        taskId: '1367521',
        workflowExecutionSignaledEventAttributes: {
          signalName: 'customSignal',
          input: {
            payloads: [
              {
                metadata: {
                  encoding: 'anNvbi9wbGFpbg==',
                },
                data: 'eyJIZXkiOiJmcm9tIE1hcnMiLCJBdCI6IjIwMjItMDQtMjhUMDE6MzA6MTkuNDM0MjYyMzM1LTA0OjAwIn0=',
              },
            ],
          },
          identity: '168773@user0@',
          header: {
            fields: {},
          },
        },
      },
      {
        eventId: '4',
        eventTime: '2022-04-28T05:30:19.440848942Z',
        eventType: 'WorkflowTaskStarted',
        version: '0',
        taskId: '1367523',
        workflowTaskStartedEventAttributes: {
          scheduledEventId: '2',
          identity: '168631@user0@',
          requestId: 'c2a89d60-2c1b-4a8f-b312-f11385722e7e',
        },
      },
      {
        eventId: '5',
        eventTime: '2022-04-28T05:30:19.445592990Z',
        eventType: 'WorkflowTaskCompleted',
        version: '0',
        taskId: '1367529',
        workflowTaskCompletedEventAttributes: {
          scheduledEventId: '2',
          startedEventId: '4',
          identity: '168631@user0@',
          binaryChecksum: '04f0fb34cfd90d692fa1d506c626a598',
        },
      },
      {
        eventId: '6',
        eventTime: '2022-04-28T05:30:19.445631589Z',
        eventType: 'ActivityTaskScheduled',
        version: '0',
        taskId: '1367530',
        activityTaskScheduledEventAttributes: {
          activityId: '6',
          activityType: {
            name: 'LongActivity',
          },
          namespace: '',
          taskQueue: {
            name: 'rainbow-statuses',
            kind: 'Normal',
          },
          header: {
            fields: {},
          },
          input: null,
          scheduleToCloseTimeout: '0s',
          scheduleToStartTimeout: '0s',
          startToCloseTimeout: '3600s',
          heartbeatTimeout: '0s',
          workflowTaskCompletedEventId: '5',
          retryPolicy: {
            initialInterval: '1s',
            backoffCoefficient: 2,
            maximumInterval: '100s',
            maximumAttempts: 1,
            nonRetryableErrorTypes: [],
          },
        },
      },
    ],
  },
  rawHistory: [],
  nextPageToken: null,
  archived: false,
};

export const EVENT_HISTORY_API =
  '**/api/v1/namespaces/*/workflows/*/runs/*/events?*';

export const EVENT_HISTORY_API_REVERSE =
  '**/api/v1/namespaces/*/workflows/*/runs/*/events/reverse?*';

export const mockEventHistoryApi = (page: Page) => {
  const ascending = page.route(EVENT_HISTORY_API, (route) => {
    return route.fulfill({
      json: mockEventHistory,
    });
  });

  const descending = page.route(EVENT_HISTORY_API_REVERSE, (route) => {
    return route.fulfill({
      json: {
        ...mockEventHistory,
        history: {
          events: mockEventHistory.history.events.reverse(),
        },
      },
    });
  });

  return Promise.all([ascending, descending]);
};
