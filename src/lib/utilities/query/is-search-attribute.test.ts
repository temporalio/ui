import { writable } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { isSearchAttribute } from './is-search-attribute';

const searchAttributes = writable<SearchAttributes>({
  WorkflowType: 'Keyword',
});

describe('isSearchAttribute', () => {
  it('should return true if the attribute is a key in the search attributes', () => {
    expect(isSearchAttribute('WorkflowType', searchAttributes)).toBe(true);
  });

  it('should return false if the attribute is not a key in the search attributes', () => {
    expect(isSearchAttribute('NotAKey', searchAttributes)).toBe(false);
  });

  it('should return false if the attribute is null', () => {
    expect(isSearchAttribute(null as unknown as string, searchAttributes)).toBe(
      false,
    );
  });

  it('should return false if the attribute is undefined', () => {
    expect(
      isSearchAttribute(undefined as unknown as string, {
        WorkflowType: 'Keyword',
      }),
    ).toBe(false);
  });

  describe('with store', () => {});
});
