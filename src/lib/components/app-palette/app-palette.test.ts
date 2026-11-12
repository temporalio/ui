import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { params: {}, data: {} } }));

import '$lib/test-utilities/jsdom-browser-apis';

import { paletteShortcutTool } from './shortcut-tool';
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
    appPalette.open = false;
    appPalette.setUserShortcut(undefined);
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

  it("opens with the app's shortcut instead of the default", async () => {
    unregister.push(registerToolSet(devSet));
    render(AppPalette, {
      props: {
        facts: { env: 'local' },
        shortcut: { key: 'j', code: 'KeyJ', ctrl: true, shift: true },
      },
    });
    expect(appPalette.shortcutLabel).toBe('Ctrl+Shift+J');

    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();

    await fireEvent.keyDown(window, {
      key: 'J',
      code: 'KeyJ',
      ctrlKey: true,
      shiftKey: true,
    });
    expect(await screen.findByText('Toggle flags')).toBeTruthy();
  });

  it("uses the user's shortcut, and none when the user turned it off", async () => {
    unregister.push(registerToolSet(devSet));
    render(AppPalette, { props: { facts: { env: 'local' } } });

    appPalette.setUserShortcut('off');
    await tick();
    expect(appPalette.shortcutLabel).toBeUndefined();
    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();

    appPalette.setUserShortcut({ key: 'j', code: 'KeyJ', ctrl: true });
    await tick();
    await fireEvent.keyDown(window, { key: 'j', code: 'KeyJ', ctrlKey: true });
    expect(await screen.findByText('Toggle flags')).toBeTruthy();
  });

  it('records a new shortcut with the palette shortcut tool', async () => {
    unregister.push(
      registerToolSet({
        id: 'help',
        label: 'Help',
        key: 'h',
        tools: [paletteShortcutTool],
      }),
    );
    render(AppPalette, { props: { facts: { env: 'local' } } });

    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(await screen.findByText('Palette shortcut')).toBeTruthy();
    const input = screen.getByRole('combobox');
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(await screen.findAllByText('Press the new shortcut')).toBeTruthy();

    await fireEvent.keyDown(input, { key: 'k', code: 'KeyK', ctrlKey: true });
    expect(appPalette.userShortcut).toEqual({
      key: 'k',
      code: 'KeyK',
      meta: false,
      ctrl: true,
      alt: false,
      shift: false,
    });

    await fireEvent.keyDown(input, { key: 'Enter' });
    await fireEvent.keyDown(input, {
      key: 'J',
      code: 'KeyJ',
      ctrlKey: true,
      shiftKey: true,
    });
    expect(appPalette.shortcutLabel).toBe('Ctrl+Shift+J');
    expect(
      await screen.findAllByText('The palette now opens with Ctrl+Shift+J'),
    ).toBeTruthy();
    expect(localStorage.getItem('palette-shortcut')).toContain('KeyJ');
  });

  it('records an Alt shortcut and opens with it', async () => {
    unregister.push(
      registerToolSet({
        id: 'help',
        label: 'Help',
        key: 'h',
        tools: [paletteShortcutTool],
      }),
    );
    render(AppPalette, { props: { facts: { env: 'local' } } });

    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const input = await screen.findByRole('combobox');
    expect(await screen.findAllByText('Palette shortcut')).toBeTruthy();
    await fireEvent.keyDown(input, { key: 'Enter' });
    await fireEvent.keyDown(input, { key: '˚', code: 'KeyK', altKey: true });
    expect(appPalette.shortcutLabel).toBe('Alt+K');

    await fireEvent.keyDown(input, { key: 'Escape' });
    await fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('combobox')).toBeNull());

    await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.queryByRole('combobox')).toBeNull();
    await fireEvent.keyDown(window, { key: '˚', code: 'KeyK', altKey: true });
    expect(await screen.findByRole('combobox')).toBeTruthy();
  });

  it('drops a request to open while no set is visible', async () => {
    render(AppPalette, { props: { facts: { env: 'local' } } });
    appPalette.open = true;
    await tick();

    unregister.push(registerToolSet(devSet));
    await tick();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
