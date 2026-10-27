import { flushSync, mount, unmount } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import NavigationMenu from './navigation-menu.svelte';

let component: ReturnType<typeof mount> | undefined;

beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('NavigationMenu', () => {
  it('renders a disabled child link without a destination', () => {
    const target = document.body.appendChild(document.createElement('div'));
    component = mount(NavigationMenu, {
      target,
      props: {
        value: 'Deployments',
        items: [
          {
            label: 'Deployments',
            children: [
              { label: 'Worker deployments', href: '/deployments' },
              { label: 'Build IDs', href: '/build-ids', disabled: true },
            ],
          },
        ],
      },
    });
    flushSync();

    const links = [...target.querySelectorAll('a')];
    const enabled = links.find((link) =>
      link.textContent?.includes('Worker deployments'),
    );
    const disabled = links.find((link) =>
      link.textContent?.includes('Build IDs'),
    );
    expect(enabled?.getAttribute('href')).toBe('/deployments');
    expect(disabled?.hasAttribute('href')).toBe(false);
    expect(disabled?.getAttribute('aria-disabled')).toBe('true');
  });
});
