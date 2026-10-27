import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { params: {}, data: {} } }));

import '$lib/test-utilities/jsdom-browser-apis';

import type { PaletteToolSet } from './types';

import { appPalette } from './app-palette-state.svelte';
import AppPalette from './app-palette.svelte';
import { registerToolSet } from './registry.svelte';

const devSet: PaletteToolSet = {
  id: 'dev',
  label: 'Dev',
  key: 'd',
  variant: 'dev',
  rules: { env: ['local', 'staging'] },
  tools: [
    {
      id: 'flags',
      section: 'Flags',
      items: () => [{ id: 'toggle', title: 'Toggle flags', actions: [] }],
    },
  ],
};

describe('AppPalette', () => {
  const unregister: (() => void)[] = [];

  afterEach(() => {
    unregister.splice(0).forEach((remove) => remove());
  });

  it('opens with the hotkey and shows registered sets that match the facts', async () => {
    unregister.push(registerToolSet(devSet));
    render(AppPalette, { props: { facts: { env: 'staging' } } });

    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(await screen.findByText('Toggle flags')).toBeTruthy();
  });

  it('renders nothing when no registered set matches the facts', async () => {
    unregister.push(registerToolSet(devSet));
    render(AppPalette, { props: { facts: { env: 'production' } } });

    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is available only while mounted with a matching set', () => {
    unregister.push(registerToolSet(devSet));
    expect(appPalette.available).toBe(false);

    const { unmount } = render(AppPalette, {
      props: { facts: { env: 'local' } },
    });
    expect(appPalette.available).toBe(true);

    unmount();
    expect(appPalette.available).toBe(false);
  });

  it('is not available when no registered set matches the facts', () => {
    unregister.push(registerToolSet(devSet));
    render(AppPalette, { props: { facts: { env: 'production' } } });

    expect(appPalette.available).toBe(false);
  });

  it('is not available with no registered sets', () => {
    render(AppPalette, { props: { facts: { env: 'local' } } });

    expect(appPalette.available).toBe(false);
  });
});
