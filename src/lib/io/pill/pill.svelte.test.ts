import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Pill, { type PillProps } from './pill.svelte';

const label = createRawSnippet(() => ({
  render: () => '<span>Inbound</span>',
}));

let component: ReturnType<typeof mount> | undefined;

const mountPill = (props: PillProps = {}) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(Pill, { target, props: { children: label, ...props } });
  flushSync();
  return target.querySelector('button') as HTMLButtonElement;
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('Pill', () => {
  it('renders an inactive button by default', () => {
    const button = mountPill();

    expect(button.type).toBe('button');
    expect(button.dataset.active).toBe('false');
    expect(button.classList.contains('bg-transparent')).toBe(true);
    expect(button.classList.contains('bg-interactive-primary')).toBe(false);
    expect(button.textContent).toContain('Inbound');
  });

  it('applies the primary fill when active', () => {
    const button = mountPill({ active: true });

    expect(button.dataset.active).toBe('true');
    expect(button.classList.contains('bg-interactive-primary')).toBe(true);
    expect(button.classList.contains('text-white')).toBe(true);
  });

  it('calls onclick when enabled', () => {
    const onclick = vi.fn();
    const button = mountPill({ onclick });

    button.click();

    expect(onclick).toHaveBeenCalledOnce();
  });

  it('does not call onclick when disabled', () => {
    const onclick = vi.fn();
    const button = mountPill({ onclick, disabled: true });

    button.click();

    expect(button.disabled).toBe(true);
    expect(onclick).not.toHaveBeenCalled();
  });

  it('renders the count, including zero', () => {
    const button = mountPill({ count: 0 });

    expect(button.textContent).toContain('0');
  });

  it('omits the count when not provided', () => {
    const button = mountPill();

    expect(button.textContent?.trim()).toBe('Inbound');
  });

  it('passes tab attributes through to the button', () => {
    const button = mountPill({
      id: 'nexus-links-inbound',
      role: 'tab',
      'aria-selected': true,
      'aria-controls': 'panel',
    });

    expect(button.id).toBe('nexus-links-inbound');
    expect(button.getAttribute('role')).toBe('tab');
    expect(button.getAttribute('aria-selected')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe('panel');
  });

  it('marks the button busy while loading', () => {
    const button = mountPill({ isLoading: true });

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('svg.animate-spin')).not.toBeNull();
  });
});
