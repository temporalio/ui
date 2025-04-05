import { get } from 'svelte/store';

import { describe, expect, it } from 'vitest';

import { importEventGroups, importEvents } from './import-events';

describe('ImportEvents', () => {
  it('should get default values', () => {
    expect(get(importEvents)).toEqual([]);
    expect(get(importEventGroups)).toEqual([]);
  });
});
