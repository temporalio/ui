import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import i18next, { i18n } from 'i18next';

import { translate } from './translate';

describe('translate', () => {
  beforeEach(() => {
    vi.mock('i18next', async () => {
      const actual: i18n = await vi.importActual('i18next');

      return {
        default: {
          ...actual,
          t: vi.fn(),
        },
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
