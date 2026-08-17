import { describe, expect, it } from 'vitest';

import type { Failure } from '$lib/types';

import { formatWorkflowFailureDiagnostic } from './workflow-failure-diagnostic';

describe('formatWorkflowFailureDiagnostic', () => {
  it.each([undefined, null])(
    'returns an empty diagnostic for %s',
    (failure) => {
      expect(formatWorkflowFailureDiagnostic(failure)).toEqual({
        levels: [],
        messages: [],
        sources: [],
        stackTraces: [],
        combinedMessage: '',
        combinedStackTrace: '',
        transcript: '',
      });
    },
  );

  it('ignores a failure with no diagnostic text', () => {
    expect(formatWorkflowFailureDiagnostic({})).toEqual({
      levels: [],
      messages: [],
      sources: [],
      stackTraces: [],
      combinedMessage: '',
      combinedStackTrace: '',
      transcript: '',
    });
  });

  it('formats a single failure', () => {
    const failure: Failure = {
      message: 'activity failed',
      source: 'TypeScriptSDK',
      stackTrace: 'at activity (/worker.ts:12:4)',
    };

    expect(formatWorkflowFailureDiagnostic(failure)).toEqual({
      levels: [failure],
      messages: ['activity failed'],
      sources: ['TypeScriptSDK'],
      stackTraces: ['at activity (/worker.ts:12:4)'],
      combinedMessage: 'activity failed',
      combinedStackTrace: 'at activity (/worker.ts:12:4)',
      transcript: [
        'activity failed',
        'Source: TypeScriptSDK',
        'Stack trace:',
        'at activity (/worker.ts:12:4)',
      ].join('\n'),
    });
  });

  it('preserves outer-to-root causal order across nested failures', () => {
    const failure: Failure = {
      message: 'workflow task failed',
      source: 'Server',
      stackTrace: 'outer frame',
      cause: {
        message: 'activity failed',
        source: 'TypeScriptSDK',
        stackTrace: 'middle frame',
        cause: {
          message: 'database unavailable',
          source: 'Postgres',
          stackTrace: 'root frame',
        },
      },
    };

    const diagnostic = formatWorkflowFailureDiagnostic(failure);

    expect(diagnostic.messages).toEqual([
      'workflow task failed',
      'activity failed',
      'database unavailable',
    ]);
    expect(diagnostic.combinedMessage).toBe(
      [
        'workflow task failed',
        'Caused by: activity failed',
        'Caused by: database unavailable',
      ].join('\n'),
    );
    expect(diagnostic.combinedStackTrace).toBe(
      ['outer frame', 'Caused by: middle frame', 'Caused by: root frame'].join(
        '\n',
      ),
    );
    expect(diagnostic.transcript).toBe(
      [
        'workflow task failed',
        'Source: Server',
        'Stack trace:',
        'outer frame',
        '',
        'Caused by:',
        'activity failed',
        'Source: TypeScriptSDK',
        'Stack trace:',
        'middle frame',
        '',
        'Caused by:',
        'database unavailable',
        'Source: Postgres',
        'Stack trace:',
        'root frame',
      ].join('\n'),
    );
  });

  it('ignores whitespace-only fields while retaining nonempty raw strings', () => {
    const diagnostic = formatWorkflowFailureDiagnostic({
      message: '  outer message  ',
      source: '   ',
      stackTrace: '\n\t',
      cause: {
        message: '\t',
        source: '  Worker  ',
      },
    });

    expect(diagnostic.levels).toEqual([
      {
        message: '  outer message  ',
        source: undefined,
        stackTrace: undefined,
      },
      { message: undefined, source: '  Worker  ', stackTrace: undefined },
    ]);
    expect(diagnostic.messages).toEqual(['  outer message  ']);
    expect(diagnostic.sources).toEqual(['  Worker  ']);
    expect(diagnostic.transcript).toBe(
      '  outer message  \n\nCaused by:\nSource:   Worker  ',
    );
  });

  it('deduplicates exact trimmed values and skips fully duplicate levels', () => {
    const diagnostic = formatWorkflowFailureDiagnostic({
      message: 'repeated',
      source: 'Server',
      stackTrace: 'same frame',
      cause: {
        message: '  repeated  ',
        source: ' Server ',
        stackTrace: ' same frame ',
        cause: {
          message: 'root',
          source: 'Server',
          stackTrace: 'root frame',
        },
      },
    });

    expect(diagnostic.messages).toEqual(['repeated', 'root']);
    expect(diagnostic.sources).toEqual(['Server']);
    expect(diagnostic.stackTraces).toEqual(['same frame', 'root frame']);
    expect(diagnostic.transcript).toBe(
      [
        'repeated',
        'Source: Server',
        'Stack trace:',
        'same frame',
        '',
        'Caused by:',
        'root',
        'Stack trace:',
        'root frame',
      ].join('\n'),
    );
  });

  it('formats message-only failures', () => {
    const diagnostic = formatWorkflowFailureDiagnostic({
      message: 'outer',
      cause: { message: 'inner' },
    });

    expect(diagnostic.transcript).toBe('outer\n\nCaused by:\ninner');
    expect(diagnostic.combinedMessage).toBe('outer\nCaused by: inner');
    expect(diagnostic.combinedStackTrace).toBe('');
  });

  it('formats stack-only failures', () => {
    const diagnostic = formatWorkflowFailureDiagnostic({
      stackTrace: 'outer frame',
      cause: { stackTrace: 'root frame' },
    });

    expect(diagnostic.messages).toEqual([]);
    expect(diagnostic.stackTraces).toEqual(['outer frame', 'root frame']);
    expect(diagnostic.transcript).toBe(
      [
        'Stack trace:',
        'outer frame',
        '',
        'Caused by:',
        'Stack trace:',
        'root frame',
      ].join('\n'),
    );
  });

  it('includes every distinct source and stack trace once', () => {
    const diagnostic = formatWorkflowFailureDiagnostic({
      source: 'Server',
      stackTrace: 'server frame',
      cause: {
        source: 'GoSDK',
        stackTrace: 'sdk frame',
        cause: {
          source: 'Application',
          stackTrace: 'application frame',
        },
      },
    });

    expect(diagnostic.sources).toEqual(['Server', 'GoSDK', 'Application']);
    expect(diagnostic.stackTraces).toEqual([
      'server frame',
      'sdk frame',
      'application frame',
    ]);

    for (const value of [...diagnostic.sources, ...diagnostic.stackTraces]) {
      expect(diagnostic.transcript.split(value)).toHaveLength(2);
    }
  });

  it('does not mutate the failure chain', () => {
    const cause: Failure = Object.freeze({
      message: 'root cause',
      source: 'Application',
    });
    const failure: Failure = Object.freeze({
      message: 'outer failure',
      stackTrace: 'outer frame',
      cause,
    });

    expect(() => formatWorkflowFailureDiagnostic(failure)).not.toThrow();
    expect(failure).toEqual({
      message: 'outer failure',
      stackTrace: 'outer frame',
      cause,
    });
    expect(failure.cause).toBe(cause);
  });

  it('stops when a malformed failure chain contains a cycle', () => {
    const outer: Failure = { message: 'outer' };
    const inner: Failure = { message: 'inner', cause: outer };
    outer.cause = inner;

    const diagnostic = formatWorkflowFailureDiagnostic(outer);

    expect(diagnostic.messages).toEqual(['outer', 'inner']);
    expect(diagnostic.levels).toHaveLength(2);
    expect(diagnostic.transcript).toBe('outer\n\nCaused by:\ninner');
  });

  it('limits malformed acyclic chains to a generous maximum depth', () => {
    const root: Failure = { message: 'failure 104' };
    let current = root;

    for (let index = 103; index >= 0; index -= 1) {
      current = { message: `failure ${index}`, cause: current };
    }

    const diagnostic = formatWorkflowFailureDiagnostic(current);

    expect(diagnostic.levels).toHaveLength(100);
    expect(diagnostic.messages[0]).toBe('failure 0');
    expect(diagnostic.messages.at(-1)).toBe('failure 99');
  });
});
