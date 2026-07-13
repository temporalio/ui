import { describe, expect, it } from 'vitest';

import { getInitialComputeProvider } from './shared';

describe('getInitialComputeProvider', () => {
  it('defaults to Lambda when provider configuration is omitted', () => {
    expect(getInitialComputeProvider()).toBe('lambda');
  });

  it('uses the first visible enabled configured provider', () => {
    expect(
      getInitialComputeProvider({
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run' },
        ],
      }),
    ).toBe('cloud-run');
  });

  it('ignores hidden providers', () => {
    expect(
      getInitialComputeProvider({
        providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
      }),
    ).toBe('cloud-run');
  });

  it('falls back to Lambda when no configured provider is selectable', () => {
    expect(
      getInitialComputeProvider({
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run', hidden: true },
        ],
      }),
    ).toBe('lambda');
  });

  it('preserves an existing visible provider when it is disabled', () => {
    expect(
      getInitialComputeProvider({
        provider: 'lambda',
        providers: [
          { value: 'lambda', disabled: true },
          { value: 'cloud-run' },
        ],
      }),
    ).toBe('lambda');
  });

  it('preserves an existing provider when provider configuration is omitted', () => {
    expect(getInitialComputeProvider({ provider: 'cloud-run' })).toBe(
      'cloud-run',
    );
  });

  it('uses the first visible enabled provider when the existing provider is hidden', () => {
    expect(
      getInitialComputeProvider({
        provider: 'lambda',
        providers: [{ value: 'lambda', hidden: true }, { value: 'cloud-run' }],
      }),
    ).toBe('cloud-run');
  });

  it('uses the first visible enabled provider when the existing provider is absent', () => {
    expect(
      getInitialComputeProvider({
        provider: 'cloud-run',
        providers: [{ value: 'lambda' }],
      }),
    ).toBe('lambda');
  });
});
