import { describe, expect, it } from 'vitest';

import {
  deriveConnectionStatus,
  formatConnectionCheckTime,
} from './connection-status';

describe('deriveConnectionStatus', () => {
  it('returns pending for undefined computeStatus', () => {
    expect(deriveConnectionStatus(undefined)).toBe('pending');
  });

  it('returns pending when providerValidation has no lastCheckTime', () => {
    expect(deriveConnectionStatus({ providerValidation: {} })).toBe('pending');
  });

  it('returns pending when lastCheckTime absent even with errorMessage', () => {
    expect(
      deriveConnectionStatus({
        providerValidation: { errorMessage: 'some error' },
      }),
    ).toBe('pending');
  });

  it('returns connected when lastCheckTime present and errorMessage undefined', () => {
    expect(
      deriveConnectionStatus({
        providerValidation: { lastCheckTime: { seconds: 1000, nanos: 0 } },
      }),
    ).toBe('connected');
  });

  it('returns connected when lastCheckTime present and errorMessage is empty string', () => {
    expect(
      deriveConnectionStatus({
        providerValidation: {
          lastCheckTime: { seconds: 1000, nanos: 0 },
          errorMessage: '',
        },
      }),
    ).toBe('connected');
  });

  it('returns failed when lastCheckTime present and errorMessage is non-empty', () => {
    expect(
      deriveConnectionStatus({
        providerValidation: {
          lastCheckTime: { seconds: 1000, nanos: 0 },
          errorMessage: 'some error',
        },
      }),
    ).toBe('failed');
  });
});

describe('formatConnectionCheckTime', () => {
  it('returns less than an hour ago for a time 30 minutes ago', () => {
    const time = new Date(Date.now() - 30 * 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('less than an hour ago');
  });

  it('returns 1 hour ago for a time ~1h ago', () => {
    const time = new Date(Date.now() - 65 * 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('1 hour ago');
  });

  it('returns 5 hours ago for a time ~5h ago', () => {
    const time = new Date(Date.now() - 5 * 3600 * 1000 - 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('5 hours ago');
  });

  it('returns 36 hours ago for a time ~36h ago', () => {
    const time = new Date(Date.now() - 36 * 3600 * 1000 - 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('36 hours ago');
  });

  it('returns less than an hour ago for a future time', () => {
    const time = new Date(Date.now() + 60 * 1000);
    expect(formatConnectionCheckTime(time)).toBe('less than an hour ago');
  });

  it('returns 5 hours ago for a Timestamp 5h ago', () => {
    const ts = {
      seconds: Math.floor((Date.now() - 5 * 3600 * 1000 - 60 * 1000) / 1000),
      nanos: 0,
    };
    expect(formatConnectionCheckTime(ts)).toBe('5 hours ago');
  });
});
