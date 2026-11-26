import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import SegmentedControl from './segmented-control.svelte';

const segments = createRawSnippet(() => ({
  render: () => '<span>Segments</span>',
}));

let component: ReturnType<typeof mount> | undefined;

const mountSegmentedControl = (props: Record<string, unknown> = {}) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(SegmentedControl, {
    target,
    props: { children: segments, ...props },
  });
  flushSync();
  return target.firstElementChild as HTMLElement;
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('SegmentedControl', () => {
  it('renders a div by default', () => {
    const control = mountSegmentedControl();

    expect(control.tagName).toBe('DIV');
    expect(control.textContent).toContain('Segments');
  });

  it('renders a nav landmark for page navigation', () => {
    const control = mountSegmentedControl({
      element: 'nav',
      'aria-label': 'Workflow pages',
    });

    expect(control.tagName).toBe('NAV');
    expect(control.getAttribute('aria-label')).toBe('Workflow pages');
  });
});
