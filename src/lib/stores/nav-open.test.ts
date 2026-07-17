import { get } from 'svelte/store';

import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadNavStores = async () => {
  vi.resetModules();
  return import('./nav-open');
};

describe('nav-open stores', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults the main nav open and saved views collapsed', async () => {
    const { navOpen, savedQueryNavOpen } = await loadNavStores();

    expect(get(navOpen)).toBe(true);
    expect(get(savedQueryNavOpen)).toBe(false);
  });

  it('collapses both navs by default without persisting a preference', async () => {
    const { initializeNavDefaults, navOpen, savedQueryNavOpen } =
      await loadNavStores();

    initializeNavDefaults(true);

    expect(get(navOpen)).toBe(false);
    expect(get(savedQueryNavOpen)).toBe(false);
    expect(localStorage.getItem('navOpen')).toBeNull();
    expect(localStorage.getItem('savedQueryNavOpen')).toBeNull();
  });

  it('leaves both navs open when collapsed by default is false', async () => {
    const { initializeNavDefaults, navOpen, savedQueryNavOpen } =
      await loadNavStores();

    initializeNavDefaults(false);

    expect(get(navOpen)).toBe(true);
    expect(get(savedQueryNavOpen)).toBe(true);
  });

  it('keeps stored preferences when collapsed by default is true', async () => {
    localStorage.setItem('navOpen', 'true');
    localStorage.setItem('savedQueryNavOpen', 'true');
    const { initializeNavDefaults, navOpen, savedQueryNavOpen } =
      await loadNavStores();

    initializeNavDefaults(true);

    expect(get(navOpen)).toBe(true);
    expect(get(savedQueryNavOpen)).toBe(true);
  });

  it('persists nav changes after applying the collapsed default', async () => {
    const { initializeNavDefaults, navOpen } = await loadNavStores();

    initializeNavDefaults(true);
    navOpen.set(true);

    expect(get(navOpen)).toBe(true);
    expect(localStorage.getItem('navOpen')).toBe('true');
  });
});
