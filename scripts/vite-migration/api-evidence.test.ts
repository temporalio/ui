import { describe, expect, it } from 'vitest';

import {
  apiRequestsForParity,
  categorizeRequestBody,
  normalizeApiUrl,
  scenarioForParity,
  summarizeApiRequests,
} from './api-evidence';

describe('API evidence', () => {
  it('normalizes API paths and sorted query parameters without the origin', () => {
    expect(
      normalizeApiUrl(
        'http://127.0.0.1:4173/api/v1/workflows?z=last&a=first&a=second',
      ),
    ).toEqual({
      path: '/api/v1/workflows',
      query: 'a=first&a=second&z=last',
    });
  });

  it.each([
    [null, null, 'none'],
    ['{"workflowId":"test"}', 'application/json', 'json'],
    ['workflowId=test', 'application/x-www-form-urlencoded', 'form'],
    ['plain body', 'text/plain', 'text'],
    ['AAEC', 'application/octet-stream', 'binary'],
  ] as const)(
    'classifies %s with %s as %s',
    (body, contentType, expectedCategory) => {
      expect(categorizeRequestBody(body, contentType)).toBe(expectedCategory);
    },
  );

  it('counts equivalent API requests meaningfully', () => {
    expect(
      summarizeApiRequests([
        {
          method: 'GET',
          path: '/api/v1/workflows',
          query: 'pageSize=1',
          bodyCategory: 'none',
          status: 200,
          failure: null,
          mock: null,
        },
        {
          method: 'GET',
          path: '/api/v1/workflows',
          query: 'pageSize=1',
          bodyCategory: 'none',
          status: 200,
          failure: null,
          mock: null,
        },
      ]),
    ).toEqual([
      {
        method: 'GET',
        path: '/api/v1/workflows',
        query: 'pageSize=1',
        bodyCategory: 'none',
        status: 200,
        failure: null,
        mock: null,
        count: 2,
      },
    ]);
  });

  it('normalizes a post-response browser abort only for parity', () => {
    const request = {
      method: 'GET',
      path: '/api/v1/workflows/example/history',
      query: '',
      bodyCategory: 'none' as const,
      status: 200,
      failure: 'net::ERR_ABORTED',
      mock: null,
      count: 1,
    };

    expect(apiRequestsForParity([request])).toEqual([
      { ...request, failure: null },
    ]);
    expect(request.failure).toBe('net::ERR_ABORTED');
  });

  it('normalizes scenario API aborts without changing raw evidence', () => {
    const rawScenario = {
      finalPath: '/namespaces/default/workflows',
      appApiRequests: [
        {
          method: 'GET',
          path: '/api/v1/workflows',
          query: '',
          bodyCategory: 'none' as const,
          status: 200,
          failure: 'net::ERR_ABORTED',
          mock: null,
          count: 1,
        },
      ],
    };

    expect(scenarioForParity(rawScenario)).toEqual({
      ...rawScenario,
      appApiRequests: [{ ...rawScenario.appApiRequests[0], failure: null }],
    });
    expect(rawScenario.appApiRequests[0].failure).toBe('net::ERR_ABORTED');
  });
});
