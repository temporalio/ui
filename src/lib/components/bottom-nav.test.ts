import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet, flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/navigation', () => ({ beforeNavigate: vi.fn() }));
vi.mock('$app/state', () => ({
  page: { params: {}, url: new URL('http://localhost/') },
}));

import '$lib/test-utilities/jsdom-browser-apis';

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

import { appPalette } from '$lib/components/app-palette/app-palette-state.svelte';
import AppPalette from '$lib/components/app-palette/app-palette.svelte';
import { registerToolSet } from '$lib/components/app-palette/registry.svelte';

import BottomNav from './bottom-nav.svelte';

const text = (value: string) =>
  createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

const paletteButton = createRawSnippet(() => ({
  render: () => '<button type="button">Command palette</button>',
  setup: (button) => {
    button.addEventListener('click', () => (appPalette.open = true));
  },
}));

describe('BottomNav', () => {
  const unregister: (() => void)[] = [];

  afterEach(() => {
    unregister.splice(0).forEach((remove) => remove());
    appPalette.open = false;
  });

  it('closes the settings sheet when the app palette opens', async () => {
    render(BottomNav, {
      props: { linksSnippet: text('links'), children: text('settings') },
    });

    await fireEvent.click(screen.getByTestId('nav-profile-button'));
    expect(document.querySelector('[data-nav="open"]')).toBeTruthy();

    appPalette.open = true;
    flushSync();
    // The sheet slides out before it leaves the page.
    await vi.waitFor(() =>
      expect(document.querySelector('[data-nav="open"]')).toBeNull(),
    );
  });

  it('returns focus to the profile button after a palette opened from the sheet closes', async () => {
    unregister.push(
      registerToolSet({
        id: 'set',
        label: 'Set',
        key: 's',
        tools: [
          {
            id: 'tool',
            section: 'Tool',
            items: () => [{ id: 'item', title: 'Item', actions: [] }],
          },
        ],
      }),
    );
    render(AppPalette, { props: { facts: { env: 'local' } } });
    render(BottomNav, {
      props: { linksSnippet: text('links'), children: paletteButton },
    });

    const profile = screen.getByTestId('nav-profile-button');
    await fireEvent.click(profile);
    const opener = screen.getByRole('button', { name: 'Command palette' });
    opener.focus();
    await fireEvent.click(opener);
    await vi.waitFor(() => expect(opener.isConnected).toBe(false));

    await fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });
    await vi.waitFor(() => expect(document.activeElement).toBe(profile));
  });
});
