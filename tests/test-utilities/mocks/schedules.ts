import type { Page } from '@playwright/test';

export const SCHEDULES_API = '**/api/v1/namespaces/*/schedules**';
export const SCHEDULE_API = '**/api/v1/namespaces/*/schedules/**';

export const mockListSchedule = {
  scheduleId: 'test-schedule',
  memo: null,
  searchAttributes: {
    indexedFields: {
      TemporalNamespaceDivision: {
        metadata: {
          encoding: 'anNvbi9wbGFpbg==',
          type: 'S2V5d29yZA==',
        },
        data: 'IlRlbXBvcmFsU2NoZWR1bGVyIg==',
      },
    },
  },
  info: {
    spec: {
      structuredCalendar: [],
      cronString: [],
      calendar: [],
      interval: [
        {
          interval: '300s',
          phase: '0s',
        },
      ],
      excludeCalendar: [],
      excludeStructuredCalendar: [],
      startTime: null,
      endTime: null,
      jitter: null,
      timezoneName: '',
      timezoneData: null,
    },
    workflowType: {
      name: 'run-regularly',
    },
    notes: '',
    paused: false,
    recentActions: [],
    futureActionTimes: [
      '2024-01-17T16:00:00Z',
      '2024-01-17T16:05:00Z',
      '2024-01-17T16:10:00Z',
      '2024-01-17T16:15:00Z',
      '2024-01-17T16:20:00Z',
    ],
  },
};

export const mockSchedule = {
  schedule: {
    spec: {
      interval: [
        {
          interval: '300s',
          phase: '0s',
        },
      ],
    },
    action: {
      startWorkflow: {
        workflowId: 'test123',
        workflowType: {
          name: 'run-regularly',
        },
        taskQueue: {
          name: 'test',
          kind: 'TASK_QUEUE_KIND_NORMAL',
        },
      },
    },
    policies: {
      overlapPolicy: 'SCHEDULE_OVERLAP_POLICY_SKIP',
      catchupWindow: '31536000s',
    },
    state: {},
  },
  info: {
    actionCount: '1',
    runningWorkflows: [
      {
        workflowId: 'test123-2025-04-14T18:50:00Z',
        runId: '019635a3-0bc8-7c15-86dd-9cdd1c8da680',
      },
    ],
    recentActions: [
      {
        scheduleTime: '2025-04-14T18:50:00Z',
        actualTime: '2025-04-14T18:50:00.009436Z',
        startWorkflowResult: {
          workflowId: 'test123-2025-04-14T18:50:00Z',
          runId: '019635a3-0bc8-7c15-86dd-9cdd1c8da680',
        },
        startWorkflowStatus: 'WORKFLOW_EXECUTION_STATUS_RUNNING',
      },
    ],
    futureActionTimes: [
      '2025-04-14T18:55:00Z',
      '2025-04-14T19:00:00Z',
      '2025-04-14T19:05:00Z',
      '2025-04-14T19:10:00Z',
      '2025-04-14T19:15:00Z',
      '2025-04-14T19:20:00Z',
      '2025-04-14T19:25:00Z',
      '2025-04-14T19:30:00Z',
      '2025-04-14T19:35:00Z',
      '2025-04-14T19:40:00Z',
    ],
    createTime: '2025-04-14T18:48:29.532800Z',
  },
  conflictToken: 'AAAAAAAAAAE=',
};

export const mockSchedulesApi = (page: Page, empty = false) => {
  return page.route(SCHEDULES_API, (route) => {
    return route.fulfill({
      json: {
        schedules: empty ? [] : [mockListSchedule],
        nextPageToken: null,
      },
    });
  });
};

export const mockScheduleApi = (page: Page) => {
  return page.route(SCHEDULE_API, (route) => {
    return route.fulfill({
      json: mockSchedule,
    });
  });
};
