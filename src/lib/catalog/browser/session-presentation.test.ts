import { describe, expect, it } from 'vitest';

import { terminalStatusPresentation } from './session-presentation';

describe('terminalStatusPresentation', () => {
  it.each([
    ['completed', { label: 'Completed', status: 'Completed' }],
    ['canceled', { label: 'Canceled', status: 'Canceled' }],
    [
      'continued-as-new',
      { label: 'Continued as new', status: 'ContinuedAsNew' },
    ],
    ['failed', { label: 'Failed', status: 'Failed' }],
    ['terminated', { label: 'Terminated', status: 'Terminated' }],
    ['timed-out', { label: 'Timed out', status: 'TimedOut' }],
  ] as const)('presents %s sessions', (status, presentation) => {
    expect(terminalStatusPresentation(status)).toEqual(presentation);
  });
});
