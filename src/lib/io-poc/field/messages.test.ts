import { describe, expect, it } from 'vitest';

import { getFieldMessageIds } from './messages';

describe('getFieldMessageIds', () => {
  it('derives stable ids from the base id', () => {
    expect(getFieldMessageIds('retries', {})).toEqual({
      helperTextId: 'retries-helper-text',
      errorTextId: 'retries-error-text',
      describedBy: undefined,
    });
  });

  it('describes the control with only the messages that are shown', () => {
    expect(
      getFieldMessageIds('retries', { helperText: 'Hint' }).describedBy,
    ).toBe('retries-helper-text');
    expect(getFieldMessageIds('retries', { showError: true }).describedBy).toBe(
      'retries-error-text',
    );
    expect(
      getFieldMessageIds('retries', { helperText: '', showError: false })
        .describedBy,
    ).toBeUndefined();
  });

  it('lists helper text first unless errorFirst is set', () => {
    const shown = { helperText: 'Hint', showError: true };
    expect(getFieldMessageIds('retries', shown).describedBy).toBe(
      'retries-helper-text retries-error-text',
    );
    expect(
      getFieldMessageIds('retries', { ...shown, errorFirst: true }).describedBy,
    ).toBe('retries-error-text retries-helper-text');
  });
});
