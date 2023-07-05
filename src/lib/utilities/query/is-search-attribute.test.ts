import { writable } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isSearchAttribute } from './is-search-attribute';
import type { SearchAttributes } from '../../../types/workflows';

const store = writable<SearchAttributes>({
  WorkflowType: 'Keyword',
});

describe('isSearchAttribute', () => {
  it('should return true if the attribute is a key in the search attributes', () => {
    expect(isSearchAttribute('WorkflowType', store)).toBe(true);
  });

  it('should return false if the attribute is not a key in the search attributes', () => {
    expect(isSearchAttribute('NotAKey', store)).toBe(false);
  });

  it('should return false if the attribute is null', () => {
    expect(isSearchAttribute(null as unknown as string, store)).toBe(false);
  });

  it('should return false if the attribute is undefined', () => {
    expect(isSearchAttribute(undefined as unknown as string, store)).toBe(
      false,
    );
  });

  describe('with store', () => {
    beforeEach(() => {
      vi.mock('$lib/stores/search-attributes', () => {
        return {
          searchAttributes: writable<SearchAttributes>({
            WorkflowType: 'Keyword',
          }),
        };
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should return true if the attribute is a key in the search attributes', () => {
      expect(isSearchAttribute('WorkflowType')).toBe(true);
    });

    it('should return false if the attribute is not a key in the search attributes', () => {
      expect(isSearchAttribute('NotAKey')).toBe(false);
    });

    it('should return false if the attribute is null', () => {
      expect(isSearchAttribute(null as unknown as string)).toBe(false);
    });

    it('should return false if the attribute is undefined', () => {
      expect(isSearchAttribute(undefined as unknown as string)).toBe(false);
    });
  });
});
