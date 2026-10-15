import { describe, expect, it } from 'vitest';

import {
  type ClientNavigationEvidence,
  clientNavigationForParity,
  clientNavigationStatus,
} from './client-navigation-evidence';

const collectedEvidence = (): ClientNavigationEvidence => ({
  kind: 'collected',
  sourceUrl: '<app-origin>/select-namespace?migration-evidence-source=true',
  targetUrl: '<app-origin>/namespaces/default/workflows',
  finalUrl: '<app-origin>/namespaces/default/workflows',
  expected: {
    finalPath: '/namespaces/default/workflows',
    appStatus: 200,
    windowPreserved: true,
  },
  observed: {
    finalPath: '/namespaces/default/workflows',
    appStatus: 200,
  },
  navigationEvents: [
    {
      type: 'anchor-click',
      url: '<app-origin>/namespaces/default/workflows',
    },
  ],
  windowSentinel: {
    expected: 'migration-evidence-window-sentinel',
    observed: 'migration-evidence-window-sentinel',
    preserved: true,
  },
  navigationError: null,
  settleError: null,
  appApiRequests: [
    {
      method: 'GET',
      path: '/api/v1/namespaces/default/workflows',
      query: '',
      bodyCategory: 'none',
      status: 200,
      failure: 'net::ERR_ABORTED',
      mock: null,
      count: 1,
    },
  ],
  catchAllMocks: { used: [], unapproved: [] },
  consoleMessages: [
    {
      type: 'error',
      text: 'Known error with generated stack details',
      classification: 'known-error',
    },
  ],
  consoleMessagesForParity: [{ type: 'error', classification: 'known-error' }],
  unexpectedConsoleErrors: [],
  pageErrors: ['Known page error with generated stack details'],
  unexpectedPageErrors: [],
  errors: [],
});

describe('client navigation evidence', () => {
  it('normalizes successful post-response aborts in the parity projection', () => {
    expect(
      clientNavigationForParity(collectedEvidence()).appApiRequests,
    ).toMatchObject([{ status: 200, failure: null }]);
  });

  it('keeps unexpected console, page, and API failures in the parity projection', () => {
    const evidence = collectedEvidence();
    evidence.appApiRequests[0] = {
      ...evidence.appApiRequests[0],
      status: 500,
      failure: 'server failed',
    };
    evidence.unexpectedConsoleErrors = [{ text: 'unexpected console error' }];
    evidence.unexpectedPageErrors = [{ text: 'unexpected page error' }];
    evidence.errors = ['Client navigation API failures: GET /api/test 500'];

    expect(clientNavigationForParity(evidence)).toMatchObject({
      appApiRequests: [{ status: 500, failure: 'server failed' }],
      unexpectedConsoleErrors: [{ text: 'unexpected console error' }],
      unexpectedPageErrors: [{ text: 'unexpected page error' }],
      errors: ['Client navigation API failures: GET /api/test 500'],
    });
  });

  it('omits raw known-error stacks from the normalized parity projection', () => {
    const projection = clientNavigationForParity(collectedEvidence());

    expect(projection).not.toHaveProperty('consoleMessages');
    expect(projection).not.toHaveProperty('pageErrors');
    expect(projection.consoleMessagesForParity).toEqual([
      { type: 'error', classification: 'known-error' },
    ]);
  });

  it('reports required evidence as missing unless it was collected', () => {
    expect(clientNavigationStatus('required', null)).toBe('missing');
    expect(
      clientNavigationStatus('required', {
        kind: 'exempt',
        reason: 'wrong exemption',
      }),
    ).toBe('missing');
    expect(clientNavigationStatus('required', collectedEvidence())).toBe(
      'collected',
    );
  });

  it('accepts exemptions only for manifest-exempt routes', () => {
    expect(
      clientNavigationStatus('exempt', {
        kind: 'exempt',
        reason: 'Server response',
      }),
    ).toBe('exempt');
    expect(clientNavigationStatus('exempt', collectedEvidence())).toBe(
      'missing',
    );
  });
});
