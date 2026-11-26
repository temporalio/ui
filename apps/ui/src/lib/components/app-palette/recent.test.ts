import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadRecent, recencyBoost, recordUse, saveRecent } from './recent';

const DAY = 24 * 60 * 60 * 1000;

describe('recordUse', () => {
  it('moves an item to the front without duplicates', () => {
    const recent = recordUse(recordUse([], 'a', 1), 'b', 2);
    expect(recordUse(recent, 'a', 3).map(({ id }) => id)).toEqual(['a', 'b']);
  });

  it('keeps the list short', () => {
    let recent = recordUse([], 'first', 0);
    for (let index = 0; index < 30; index++) {
      recent = recordUse(recent, `item-${index}`, index);
    }
    expect(recent).toHaveLength(20);
    expect(recent.some(({ id }) => id === 'first')).toBe(false);
  });
});

describe('recencyBoost', () => {
  it('gives unused items nothing', () => {
    expect(recencyBoost([], 'a', 0)).toBe(0);
  });

  it('fades over a week but stays below one match tier', () => {
    const recent = [{ id: 'a', at: 0 }];
    const fresh = recencyBoost(recent, 'a', 0);
    const old = recencyBoost(recent, 'a', 30 * DAY);
    expect(fresh).toBeLessThan(1);
    expect(old).toBeGreaterThan(0);
    expect(old).toBeLessThan(fresh);
  });
});

describe('recent storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('round-trips through local storage and drops bad entries', () => {
    saveRecent('recent', [{ id: 'a', at: 1 }]);
    expect(loadRecent('recent')).toEqual([{ id: 'a', at: 1 }]);

    localStorage.setItem(
      'recent',
      JSON.stringify([{ id: 1 }, { id: 'b', at: 2 }]),
    );
    expect(loadRecent('recent')).toEqual([{ id: 'b', at: 2 }]);
  });

  it('works without storage', () => {
    const blocked = () => {
      throw new Error('blocked');
    };
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked });
    expect(() => saveRecent('recent', [{ id: 'a', at: 1 }])).not.toThrow();
    expect(loadRecent('recent')).toEqual([]);
  });
});
