import { describe, expect, it } from 'vitest';

import { terminalStatusPresentation } from './session-presentation';

describe('terminalStatusPresentation', () => {
  it.each([
    ['completed', { label: 'Completed', type: 'success' }],
    ['canceled', { label: 'Canceled', type: 'warning' }],
    ['continued-as-new', { label: 'Continued as new', type: 'primary' }],
    ['failed', { label: 'Failed', type: 'danger' }],
    ['terminated', { label: 'Terminated', type: 'danger' }],
    ['timed-out', { label: 'Timed out', type: 'danger' }],
  ] as const)('presents %s sessions', (status, presentation) => {
    expect(terminalStatusPresentation(status)).toEqual(presentation);
  });
});
