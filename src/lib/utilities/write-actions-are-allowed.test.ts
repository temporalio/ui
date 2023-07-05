import { Writable, writable } from 'svelte/store';

import { describe, expect, it } from 'vitest';

import { writeActionsAreAllowed } from './write-actions-are-allowed';
import type { Settings } from '../../types/global';

describe('writeActionsAreAllowed', () => {
  it('should return true if the disableWriteActions flag is set to false', () => {
    const settings = writable({
      disableWriteActions: false,
    }) as Writable<Settings>;

    expect(writeActionsAreAllowed(settings)).toBe(true);
  });

  it('should return false if the disableWriteActions flag is set to true', () => {
    const settings = writable({
      disableWriteActions: true,
    }) as Writable<Settings>;

    expect(writeActionsAreAllowed(settings)).toBe(false);
  });
});
