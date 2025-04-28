import * as i18next from 'i18next';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { translate } from './translate';

const mockT = vi.fn();

vi.mock('i18next', async (importOriginal) => {
  const actual = (await importOriginal()) as i18next.i18n;
  return {
    default: {
      ...actual,
      t: mockT,
    },
    t: mockT,
  };
});

describe('translate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('accepts a namespace and key', () => {
    translate('common.loading');
    expect(i18next.t).toHaveBeenCalledWith('common:loading', {});
  });

  test('accepts a namespace, key, and replace params', () => {
    translate('common.loading', { foo: 'bar' });
    expect(i18next.t).toHaveBeenCalledWith('common:loading', { foo: 'bar' });
  });

  test('accepts a namespace, key, and count', () => {
    translate('common.loading', { count: 10 });
    expect(i18next.t).toHaveBeenCalledWith('common:loading', { count: 10 });
  });

  test('accepts namespace, key, and a count of 0', () => {
    translate('common.loading', { count: 0 });
    expect(i18next.t).toHaveBeenCalledWith('common:loading', { count: 0 });
  });

  test('accepts a namespace, key, count, and replace parameters', () => {
    translate('common.loading', { count: 10, foo: 'bar' });
    expect(i18next.t).toHaveBeenCalledWith('common:loading', {
      foo: 'bar',
      count: 10,
    });
  });
});
