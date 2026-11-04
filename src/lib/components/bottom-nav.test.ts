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

import BottomNav from './bottom-nav.svelte';

const text = (value: string) =>
  createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('BottomNav', () => {
  afterEach(() => {
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
});
