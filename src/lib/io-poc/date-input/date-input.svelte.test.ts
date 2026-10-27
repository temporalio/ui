import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import DateInputInFieldset from '$fixtures/io-poc/date-input-in-fieldset.svelte';

let component: ReturnType<typeof mount> | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

const mountInFieldset = (disabled: boolean) => {
  const target = document.body.appendChild(document.createElement('div'));
  component = mount(DateInputInFieldset, { target, props: { disabled } });
  flushSync();
  return target.querySelector('[data-scope="date-input"][data-part="root"]');
};

describe('DateInput', () => {
  it('is disabled by a disabled Fieldset', () => {
    expect(mountInFieldset(true)?.hasAttribute('data-disabled')).toBe(true);
  });

  it('stays enabled inside an enabled Fieldset', () => {
    expect(mountInFieldset(false)?.hasAttribute('data-disabled')).toBe(false);
  });
});
