import { describe, expect, it } from 'vitest';

import type { NamespaceListItem } from '$lib/types/global';

import { sortNamespaces } from './sort-namespaces';

const item = (namespace: string): NamespaceListItem => ({
  namespace,
  onClick: () => {},
});

describe('sortNamespaces', () => {
  it('sorts namespaces alphabetically', () => {
    const result = sortNamespaces([
      item('zebra'),
      item('apple'),
      item('mango'),
    ]);
    expect(result.map((n) => n.namespace)).toEqual(['apple', 'mango', 'zebra']);
  });

  it('does not mutate the input', () => {
    const input = [item('b'), item('a')];
    sortNamespaces(input);
    expect(input.map((n) => n.namespace)).toEqual(['b', 'a']);
  });

  it('sorts case-insensitively via localeCompare', () => {
    const result = sortNamespaces([item('Banana'), item('apple')]);
    expect(result[0].namespace).toBe('apple');
  });

  it('returns an empty array when given an empty list', () => {
    expect(sortNamespaces([])).toEqual([]);
  });
});
