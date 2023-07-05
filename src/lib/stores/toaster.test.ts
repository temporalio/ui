import { get } from 'svelte/store';

import { afterEach, describe, expect, it } from 'vitest';

import { toaster } from './toaster';

describe('toaster', () => {
  afterEach(() => {
    toaster.clear();
  });

  it('should have a subscribe function', () => {
    expect(toaster.subscribe).toBeDefined();
  });

  it('should start with an empty array', () => {
    expect(get(toaster)).toEqual([]);
  });

  describe('add', () => {
    it('should increase the length by 1', () => {
      toaster.push({ variant: 'error', message: 'This is an error' });
      expect(get(toaster)).toHaveLength(1);
    });

    it('should have the correct data', () => {
      toaster.push({ variant: 'error', message: 'This is an error' });
      const [toast] = get(toaster);

      expect(toast.variant).toBe('error');
      expect(toast.message).toBe('This is an error');
    });
  });

  describe('clear', () => {
    it('should clear out all of the notifications', () => {
      toaster.push({ variant: 'error', message: 'This is an error' });
      toaster.push({ variant: 'error', message: 'This is an error' });
      toaster.push({ variant: 'error', message: 'This is an error' });

      toaster.clear();

      expect(get(toaster)).toHaveLength(0);
    });
  });

  describe('dismiss', () => {
    it('should remove a notification', () => {
      toaster.push({ variant: 'error', message: 'This is an error' });
      toaster.push({ variant: 'success', message: 'Everything went well' });

      const [toast] = get(toaster);
      const { id } = toast;

      toaster.pop(id);

      expect(get(toaster)).toHaveLength(1);
    });

    it('should remove a the correct notification', () => {
      toaster.push({ variant: 'error', message: 'This is an error' });
      toaster.push({ variant: 'success', message: 'Everything went well' });

      const [toast] = get(toaster);
      const { id } = toast;

      toaster.pop(id);

      expect(get(toaster)).not.toContain(toast);
    });
  });
});
