import { get } from 'svelte/store';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  darkMode,
  getNextDarkModePreference,
  useDarkMode,
  useDarkModePreference,
} from './dark-mode';

describe('dark-mode utilities', () => {
  let matchMediaMock;

  beforeEach(() => {
    matchMediaMock = vi.fn();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useDarkMode', () => {
    it('should return true if prefers-color-scheme is dark and preference is null', () => {
      matchMediaMock.mockReturnValue({ matches: true }); // prefers dark
      useDarkModePreference.set(null);
      const value = get(useDarkMode);
      expect(value).toBe(true);
    });

    it('should return false if prefers-color-scheme is not dark and preference is null', () => {
      matchMediaMock.mockReturnValue({ matches: false });
      useDarkModePreference.set(null);
      const value = get(useDarkMode);
      expect(value).toBe(false);
    });

    it('should return the user preference if it is set', () => {
      useDarkModePreference.set(true);
      const value1 = get(useDarkMode);
      expect(value1).toBe(true);

      useDarkModePreference.set(false);
      const value2 = get(useDarkMode);
      expect(value2).toBe(false);
    });
  });

  describe('getNextDarkModePreference', () => {
    it('should return true if the current value is null', () => {
      expect(getNextDarkModePreference(null)).toBe(true);
    });

    it('should return false if the current value is true', () => {
      expect(getNextDarkModePreference(true)).toBe(false);
    });

    it('should return null if the current value is false', () => {
      expect(getNextDarkModePreference(false)).toBe(null);
    });
  });

  describe('darkMode', () => {
    it('should set data-theme to "dark" when dark mode is enabled', async () => {
      const node = document.createElement('div');
      useDarkModePreference.set(true);

      darkMode(node);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(node.dataset.theme).toBe('dark');
    });

    it('should set data-theme to "light" when dark mode is disabled', async () => {
      const node = document.createElement('div');
      useDarkModePreference.set(false);

      darkMode(node);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(node.dataset.theme).toBe('light');
    });
  });
});
