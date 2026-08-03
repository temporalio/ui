import { get } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toaster } from './toaster';

describe('toaster', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    toaster.clear();
    vi.useRealTimers();
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

  describe('announcements', () => {
    it('announces an error toast assertively', () => {
      toaster.push({ variant: 'error', message: 'This is an error' });
      const announcements = get(toaster.announcements);
      expect(announcements).toHaveLength(1);
      expect(announcements[0].message).toBe('This is an error');
      expect(announcements[0].politeness).toBe('assertive');
    });

    it('announces a non-error toast politely', () => {
      toaster.push({ variant: 'success', message: 'Everything went well' });
      const announcements = get(toaster.announcements);
      expect(announcements[0].politeness).toBe('polite');
    });

    it('announcement persists at least as long as the toast duration', () => {
      toaster.push({ variant: 'success', message: 'Saved', duration: 10000 });
      vi.advanceTimersByTime(7000);
      expect(get(toaster.announcements)).toHaveLength(1);
      vi.advanceTimersByTime(3000);
      expect(get(toaster.announcements)).toHaveLength(0);
    });
  });
});
