import { describe, expect, it } from 'vitest';

import {
  acceptsWriteActions,
  describeCommand,
  parseWorkflowQuery,
  requestErrorMessage,
  writeActionBlock,
} from './workflow-query';

const RUN = '0193a1b2-c3d4-7e8f-9a0b-1c2d3e4f5a6b';

describe('parseWorkflowQuery', () => {
  it('reads an ID that looks like an ID', () => {
    expect(parseWorkflowQuery(' order-12345 ')).toEqual({
      workflowId: 'order-12345',
    });
  });

  it('ignores plain search words', () => {
    expect(parseWorkflowQuery('billing')).toBeUndefined();
    expect(parseWorkflowQuery('ab1')).toBeUndefined();
    expect(parseWorkflowQuery('open the flags')).toBeUndefined();
  });

  it('reads an ID with a run ID', () => {
    expect(parseWorkflowQuery(`order-12345 ${RUN}`)).toEqual({
      workflowId: 'order-12345',
      runId: RUN,
    });
  });

  it('reads a pasted workflow URL with its namespace', () => {
    expect(
      parseWorkflowQuery(
        `https://cloud.temporal.io/namespaces/prod.a1b2c/workflows/order%2F1/${RUN}/history`,
      ),
    ).toEqual({ namespace: 'prod.a1b2c', workflowId: 'order/1', runId: RUN });
  });
});

describe('describeCommand', () => {
  it('quotes values for the shell', () => {
    expect(describeCommand('ns', "it's-1", RUN)).toBe(
      `temporal workflow describe --namespace 'ns' --workflow-id 'it'\\''s-1' --run-id '${RUN}'`,
    );
  });
});

describe('acceptsWriteActions', () => {
  const status = (isRunning: boolean, isPaused: boolean) => ({
    isRunning,
    isPaused,
  });

  it('is undefined while the workflow loads', () => {
    expect(acceptsWriteActions(undefined, true)).toBeUndefined();
  });

  it('accepts a running workflow', () => {
    expect(acceptsWriteActions(status(true, false), false)).toBe(true);
  });

  it('accepts a paused workflow only when the namespace can pause', () => {
    expect(acceptsWriteActions(status(false, true), true)).toBe(true);
    expect(acceptsWriteActions(status(false, true), false)).toBe(false);
  });

  it('rejects a closed workflow', () => {
    expect(acceptsWriteActions(status(false, false), true)).toBe(false);
  });
});

describe('writeActionBlock', () => {
  it('blocks a user who cannot write first', () => {
    expect(writeActionBlock({ allowed: false, accepts: true })).toBe(
      'not-allowed',
    );
  });

  it('waits for the workflow to load', () => {
    expect(writeActionBlock({ allowed: true, accepts: undefined })).toBe(
      'loading',
    );
  });

  it('blocks a closed workflow and allows a running one', () => {
    expect(writeActionBlock({ allowed: true, accepts: false })).toBe(
      'not-running',
    );
    expect(writeActionBlock({ allowed: true, accepts: true })).toBeUndefined();
  });
});

describe('requestErrorMessage', () => {
  it('reads the message requestFromAPI throws', () => {
    expect(
      requestErrorMessage(
        { statusCode: 400, statusText: 'Bad Request', message: 'closed' },
        'failed',
      ),
    ).toBe('closed');
  });

  it('falls back to the status text, then the fallback', () => {
    expect(
      requestErrorMessage(
        { statusCode: 403, statusText: 'Forbidden', message: '' },
        'failed',
      ),
    ).toBe('Forbidden');
    expect(requestErrorMessage(undefined, 'failed')).toBe('failed');
  });

  it('reads an Error', () => {
    expect(requestErrorMessage(new Error('offline'), 'failed')).toBe('offline');
  });
});
