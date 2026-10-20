import { flushSync } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import type { PaletteToolSet } from './types';

import { registeredToolSets, registerToolSet } from './registry.svelte';

const set = (id: string, label = id): PaletteToolSet => ({
  id,
  label,
  key: id[0],
  tools: [],
});

describe('registerToolSet', () => {
  const unregister: (() => void)[] = [];

  afterEach(() => {
    unregister.splice(0).forEach((remove) => remove());
  });

  it('adds sets in the order they register', () => {
    unregister.push(
      registerToolSet(set('alpha')),
      registerToolSet(set('beta')),
    );
    expect(registeredToolSets().map(({ id }) => id)).toEqual(['alpha', 'beta']);
  });

  it('removes a set when its unregister function runs', () => {
    const removeAlpha = registerToolSet(set('alpha'));
    unregister.push(registerToolSet(set('beta')));
    removeAlpha();
    expect(registeredToolSets().map(({ id }) => id)).toEqual(['beta']);
  });

  it('replaces a set with the same id', () => {
    const removeOld = registerToolSet(set('alpha', 'Old'));
    unregister.push(registerToolSet(set('alpha', 'New')));
    expect(registeredToolSets().map(({ label }) => label)).toEqual(['New']);

    removeOld();
    expect(registeredToolSets().map(({ label }) => label)).toEqual(['New']);
  });

  it('registers from an effect without rerunning it', () => {
    let runs = 0;
    const stop = $effect.root(() => {
      $effect(() => {
        runs += 1;
        return registerToolSet(set('alpha'));
      });
    });
    flushSync();
    expect(runs).toBe(1);
    expect(registeredToolSets().map(({ id }) => id)).toEqual(['alpha']);

    stop();
    expect(registeredToolSets()).toEqual([]);
  });
});
