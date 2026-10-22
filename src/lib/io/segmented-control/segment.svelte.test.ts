import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Segment, { type SegmentProps } from './segment.svelte';

const label = createRawSnippet(() => ({
  render: () => '<span>Inbound</span>',
}));

let component: ReturnType<typeof mount> | undefined;

const mountSegment = (props: SegmentProps = {}) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(Segment, { target, props: { children: label, ...props } });
  flushSync();
  return target.querySelector('button') as HTMLButtonElement;
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('Segment', () => {
  it('renders an unselected button by default', () => {
    const button = mountSegment();

    expect(button.type).toBe('button');
    expect(button.dataset.selected).toBe('false');
    expect(button.classList.contains('text-secondary')).toBe(true);
    expect(button.classList.contains('bg-interactive-secondary-hover')).toBe(
      false,
    );
    expect(button.textContent).toContain('Inbound');
  });

  it('applies the brand tint when selected', () => {
    const button = mountSegment({ selected: true });

    expect(button.dataset.selected).toBe('true');
    expect(button.classList.contains('bg-interactive-secondary-hover')).toBe(
      true,
    );
    expect(button.classList.contains('text-brand')).toBe(true);
    expect(button.classList.contains('text-secondary')).toBe(false);
  });

  it('calls onclick when enabled', () => {
    const onclick = vi.fn();
    const button = mountSegment({ onclick });

    button.click();

    expect(onclick).toHaveBeenCalledOnce();
  });

  it('does not call onclick when disabled', () => {
    const onclick = vi.fn();
    const button = mountSegment({ onclick, disabled: true });

    button.click();

    expect(button.disabled).toBe(true);
    expect(onclick).not.toHaveBeenCalled();
  });

  it('renders the count, including zero', () => {
    const button = mountSegment({ count: 0 });

    expect(button.textContent).toContain('0');
  });

  it('omits the count when not provided', () => {
    const button = mountSegment();

    expect(button.textContent?.trim()).toBe('Inbound');
  });

  it('passes tab attributes through to the button', () => {
    const button = mountSegment({
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
    const button = mountSegment({ isLoading: true });

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.querySelector('svg.animate-spin')).not.toBeNull();
  });

  it('renders an unselected count with neutral colors and no border', () => {
    const button = mountSegment({ count: 3 });
    const count = button.querySelector('[data-segment-count]') as HTMLElement;

    expect(count.textContent).toBe('3');
    expect(count.classList.contains('bg-surface-overlay-tertiary')).toBe(true);
    expect(count.classList.contains('text-secondary')).toBe(true);
    expect(count.classList.contains('font-mono')).toBe(true);
    expect(count.classList.contains('border')).toBe(false);
  });

  it('renders a selected count with brand colors', () => {
    const button = mountSegment({ count: 3, selected: true });
    const count = button.querySelector('[data-segment-count]') as HTMLElement;

    expect(count.classList.contains('bg-interactive-secondary-hover')).toBe(
      true,
    );
    expect(count.classList.contains('text-brand')).toBe(true);
    expect(count.classList.contains('bg-surface-overlay-tertiary')).toBe(false);
  });
});
