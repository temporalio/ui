import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The duplicate key warning only runs in development builds.
vi.mock('esm-env', () => ({ DEV: true, BROWSER: true }));

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

  it('keeps a shared set while another registration still holds it', () => {
    const shared = set('shared');
    const removeFirst = registerToolSet(shared);
    unregister.push(registerToolSet(shared));

    removeFirst();
    expect(registeredToolSets().map(({ id }) => id)).toEqual(['shared']);
  });

  it('shows the earlier set again when the latest one with its id goes', () => {
    unregister.push(registerToolSet(set('alpha', 'Old')));
    const removeNew = registerToolSet(set('alpha', 'New'));

    removeNew();
    expect(registeredToolSets().map(({ label }) => label)).toEqual(['Old']);
  });

  it('warns when two sets use the same key', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    unregister.push(
      registerToolSet(set('alpha')),
      registerToolSet({ ...set('another'), key: 'A' }),
    );

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('a'));
    warn.mockRestore();
  });
});
