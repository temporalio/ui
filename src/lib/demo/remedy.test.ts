import { describe, expect, it } from 'vitest';

import { failureMessage, NGROK_DOC, ngrokFixes } from './remedy';

describe('failureMessage', () => {
  it('leads with what was attempted', () => {
    expect(failureMessage({ attempting: 'Could not open a tunnel.' })).toBe(
      'Could not open a tunnel.',
    );
  });

  it('quotes tool output verbatim so it stays searchable', () => {
    const message = failureMessage({
      attempting: 'Failed.',
      reported: 'ERR_NGROK_105: authentication failed',
    });

    expect(message).toContain('ERR_NGROK_105: authentication failed');
    expect(message).toContain('It reported:');
  });

  it('omits empty sections rather than printing bare headings', () => {
    const message = failureMessage({ attempting: 'Failed.', reported: '   ' });

    expect(message).not.toContain('It reported:');
    expect(message).not.toContain('Try:');
    expect(message).not.toContain('See also:');
  });

  it('lists fixes and references under their own headings', () => {
    const message = failureMessage({
      attempting: 'Failed.',
      fixes: ['do this', 'then this'],
      seeAlso: ['some.log'],
    });

    expect(message).toContain('Try:\n  do this\n  then this');
    expect(message).toContain('See also:\n  some.log');
  });
});

describe('ngrokFixes', () => {
  it('gives a concrete command for a missing authtoken', () => {
    expect(ngrokFixes('ERR_NGROK_4018').join(' ')).toContain(
      'ngrok config add-authtoken',
    );
  });

  it('tells you to stop other agents when the session limit is hit', () => {
    expect(ngrokFixes('ERR_NGROK_108').join(' ')).toContain('pkill ngrok');
  });

  // An invented remedy is worse than none; the docs URL still helps.
  it('does not guess a remedy for an unknown code', () => {
    const fixes = ngrokFixes('ERR_NGROK_9999').join(' ');

    expect(fixes).toContain('No specific remedy is known');
  });

  it('falls back to general checks when there is no code at all', () => {
    expect(ngrokFixes().join(' ')).toContain('ngrok config check');
  });
});

describe('NGROK_DOC', () => {
  it('builds the documented per-code url', () => {
    expect(NGROK_DOC('ERR_NGROK_105')).toBe(
      'https://ngrok.com/docs/errors/err_ngrok_105/',
    );
  });
});
