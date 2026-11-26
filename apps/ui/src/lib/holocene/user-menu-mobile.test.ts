import { render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { params: {}, data: {} } }));

import '$lib/test-utilities/jsdom-browser-apis';

import { appPalette } from '$lib/components/app-palette/app-palette-state.svelte';
import AppPalette from '$lib/components/app-palette/app-palette.svelte';
import { registerToolSet } from '$lib/components/app-palette/registry.svelte';

import UserMenuMobile from './user-menu-mobile.svelte';

describe('UserMenuMobile', () => {
  const unregister: (() => void)[] = [];

  afterEach(() => {
    unregister.splice(0).forEach((remove) => remove());
    appPalette.open = false;
  });

  it('hides the command palette button when the palette has no tools', () => {
    render(UserMenuMobile, { props: { logout: () => {} } });

    expect(screen.queryByTestId('command-palette')).toBeNull();
  });

  it('opens the palette from the command palette button', async () => {
    unregister.push(
      registerToolSet({
        id: 'dev',
        label: 'Dev',
        key: 'd',
        tools: [{ id: 'probe', section: 'Probe', items: () => [] }],
      }),
    );
    render(AppPalette, { props: { facts: { env: 'local' } } });
    render(UserMenuMobile, { props: { logout: () => {} } });

    (await screen.findByTestId('command-palette')).click();
    expect(appPalette.open).toBe(true);
  });
});
