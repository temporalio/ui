import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import Switch from './switch.svelte';

let component: ReturnType<typeof mount> | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('Switch', () => {
  it('exposes switch semantics on the focusable input', () => {
    const target = document.body.appendChild(document.createElement('div'));
    component = mount(Switch, { target, props: { label: 'Live updates' } });
    flushSync();

    const input = target.querySelector('input[type="checkbox"]');
    expect(input?.getAttribute('role')).toBe('switch');
  });
});
