import i18next, { i18n } from 'i18next';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { translate } from './translate';

describe('translate', () => {
  beforeEach(() => {
    vi.mock('i18next', async () => {
      const actual: i18n = await vi.importActual('i18next');
      const mockT = vi.fn();
      return {
        default: {
          ...actual,
          t: mockT,
        },
        t: mockT,
      };
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('accepts a key and defaults to the default namespace', () => {
    translate('loading');

    expect(i18next.t).toHaveBeenCalledWith('common:loading', {});
  });

  test('accepts a key and replace params', () => {
    translate('loading', { foo: 'bar' });

    expect(i18next.t).toHaveBeenCalledWith('common:loading', {
      replace: { foo: 'bar' },
    });
  });

  test('accepts a key and count', () => {
    translate('loading', 10);

    expect(i18next.t).toHaveBeenCalledWith('common:loading', {
      count: 10,
    });
  });

  test('accepts a count of 0', () => {
    translate('loading', 0);

    expect(i18next.t).toHaveBeenCalledWith('common:loading', {
      count: 0,
    });
  });

  test('accepts a key, count, and replace parameters', () => {
    translate('loading', 10, { foo: 'bar' });

    expect(i18next.t).toHaveBeenCalledWith('common:loading', {
      count: 10,
      replace: { foo: 'bar' },
    });
  });

  test('accepts a namespace and a key', () => {
    translate('workflows', 'recent-workflows');

    expect(i18next.t).toHaveBeenCalledWith('workflows:recent-workflows', {});
  });

  test('accepts a namespace, key, and count', () => {
    translate('workflows', 'recent-workflows', 10);

    expect(i18next.t).toHaveBeenCalledWith('workflows:recent-workflows', {
      count: 10,
    });
  });

  test('accepts a namespace, key, and replace', () => {
    translate('workflows', 'recent-workflows', { foo: 'bar' });

    expect(i18next.t).toHaveBeenCalledWith('workflows:recent-workflows', {
      replace: { foo: 'bar' },
    });
  });

  test('accepts a namespace, key, count, and replace params', () => {
    translate('workflows', 'recent-workflows', 10, { foo: 'bar' });

    expect(i18next.t).toHaveBeenCalledWith('workflows:recent-workflows', {
      count: 10,
      replace: { foo: 'bar' },
    });
  });
});
