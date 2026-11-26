import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import IoTranslateHost from './io-translate-host.svelte';

let component: ReturnType<typeof mount> | undefined;

const render = (props: Record<string, unknown> = {}) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(IoTranslateHost, { target, props });
  flushSync();
  return target;
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('Svelte singleton across apps/ui and @temporalio/io', () => {
  it('lets an Io component read a context that the app sets', () => {
    const target = render({
      translate: (key: string) => `app:${key}`,
    });

    expect(target.textContent).toContain('app:workflows.running');
  });

  it('falls back to the Io default text when the app sets no context', () => {
    const target = render();

    expect(target.textContent).toContain('Running');
    expect(target.textContent).not.toContain('app:');
  });
});
