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
    it('should return true if prefers-color-scheme is dark and preference is system', () => {
      matchMediaMock.mockReturnValue({ matches: true }); // prefers dark
      useDarkModePreference.set('system');
      const value = get(useDarkMode);
      expect(value).toBe(true);
    });

    it('should return false if prefers-color-scheme is not dark and preference is system', () => {
      matchMediaMock.mockReturnValue({ matches: false });
      useDarkModePreference.set('system');
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
    it('should return true if the current value is system', () => {
      expect(getNextDarkModePreference('system')).toBe(true);
    });

    it('should return false if the current value is true', () => {
      expect(getNextDarkModePreference(true)).toBe(false);
    });

    it('should return system if the current value is false', () => {
      expect(getNextDarkModePreference(false)).toBe('system');
    });
  });

  describe('darkMode', () => {
    it('should set data-theme to "dark" when dark mode is enabled', () => {
      const node = document.createElement('div');
      useDarkModePreference.set(true);

      darkMode(node);

      expect(node.dataset.theme).toBe('dark');
    });

    it('should set data-theme to "light" when dark mode is disabled', () => {
      const node = document.createElement('div');
      useDarkModePreference.set(false);

      darkMode(node);

      expect(node.dataset.theme).toBe('light');
    });

    it('should force "light" via overrideTheme even when dark mode is enabled', () => {
      const node = document.createElement('div');
      useDarkModePreference.set(true);

      darkMode(node, 'light');

      expect(node.dataset.theme).toBe('light');
    });

    it('should force "dark" via overrideTheme even when dark mode is disabled', () => {
      const node = document.createElement('div');
      useDarkModePreference.set(false);

      darkMode(node, 'dark');

      expect(node.dataset.theme).toBe('dark');
    });

    it('should re-apply the theme when the override changes via update', () => {
      const node = document.createElement('div');
      useDarkModePreference.set(true);

      const action = darkMode(node, 'light');
      expect(node.dataset.theme).toBe('light');

      action.update('dark');
      expect(node.dataset.theme).toBe('dark');
    });

    it('should fall back to the store theme when the override is cleared', () => {
      const node = document.createElement('div');
      useDarkModePreference.set(true);

      const action = darkMode(node, 'light');
      expect(node.dataset.theme).toBe('light');

      action.update(undefined);
      expect(node.dataset.theme).toBe('dark');
    });

    it('should stop updating data-theme after destroy', () => {
      const node = document.createElement('div');
      useDarkModePreference.set(false);

      const action = darkMode(node);
      expect(node.dataset.theme).toBe('light');

      action.destroy();
      useDarkModePreference.set(true);

      expect(node.dataset.theme).toBe('light');
    });
  });
});
