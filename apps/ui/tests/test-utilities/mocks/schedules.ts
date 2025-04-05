import type { Page } from '@playwright/test';

export const SCHEDULES_API = '**/api/v1/namespaces/*/schedules**';

export const mockSchedule = {
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

export const mockSchedulesApi = (page: Page, empty = false) => {
  return page.route(SCHEDULES_API, (route) => {
    return route.fulfill({
      json: {
        schedules: empty ? [] : [mockSchedule],
        nextPageToken: null,
      },
    });
  });
};
