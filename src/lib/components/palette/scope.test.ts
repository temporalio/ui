import { describe, expect, it } from 'vitest';

import { duplicateKeys, nextScope, scopedToolSets, setForKey } from './scope';
import type { PaletteToolSet } from './types';

const set = (id: string, key: string): PaletteToolSet => ({
  id,
  label: id,
  key,
  tools: [],
});

const sets = [set('navigation', 'g'), set('workflow', 'w'), set('dev', 'd')];

describe('setForKey', () => {
  it('finds a set by its key, ignoring case', () => {
    expect(setForKey(sets, 'W')?.id).toBe('workflow');
  });

  it('finds nothing for longer queries or unknown keys', () => {
    expect(setForKey(sets, 'wo')).toBeUndefined();
    expect(setForKey(sets, 'x')).toBeUndefined();
  });
});

describe('nextScope', () => {
  it('cycles from All through every set and back', () => {
    expect(nextScope(sets, null, 1)).toBe('navigation');
    expect(nextScope(sets, 'dev', 1)).toBeNull();
    expect(nextScope(sets, null, -1)).toBe('dev');
  });

  it('restarts from All when the scope is gone', () => {
    expect(nextScope(sets, 'hidden', 1)).toBe('navigation');
  });
});

describe('scopedToolSets', () => {
  it('keeps only the scoped set', () => {
    expect(scopedToolSets(sets, 'dev').map(({ id }) => id)).toEqual(['dev']);
  });

  it('shows every set for All or for a set that is not visible', () => {
    expect(scopedToolSets(sets, null)).toHaveLength(3);
    expect(scopedToolSets(sets, 'hidden')).toHaveLength(3);
  });
});

describe('duplicateKeys', () => {
  it('lists keys that more than one set uses', () => {
    expect(duplicateKeys([...sets, set('other', 'd')])).toEqual(['d']);
    expect(duplicateKeys(sets)).toEqual([]);
  });
});
