import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';

import SegmentLink, { type SegmentLinkProps } from './segment-link.svelte';

const label = createRawSnippet(() => ({
  render: () => '<span>History</span>',
}));

let component: ReturnType<typeof mount> | undefined;

const mountSegmentLink = (props: Partial<SegmentLinkProps> = {}) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  component = mount(SegmentLink, {
    target,
    props: { href: '/history', children: label, ...props },
  });
  flushSync();
  return target.querySelector('a') as HTMLAnchorElement;
};

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = '';
});

describe('SegmentLink', () => {
  it('renders a link to the given href', () => {
    const link = mountSegmentLink();

    expect(link.getAttribute('href')).toBe('/history');
    expect(link.textContent).toContain('History');
  });

  it('is not marked as the current page by default', () => {
    const link = mountSegmentLink();

    expect(link.hasAttribute('aria-current')).toBe(false);
    expect(link.dataset.selected).toBe('false');
    expect(link.classList.contains('text-secondary')).toBe(true);
  });

  it('marks the current page when selected', () => {
    const link = mountSegmentLink({ selected: true });

    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.dataset.selected).toBe('true');
    expect(link.classList.contains('bg-interactive-secondary-hover')).toBe(
      true,
    );
    expect(link.classList.contains('text-brand')).toBe(true);
  });

  it('renders the count, including zero', () => {
    const link = mountSegmentLink({ count: 0 });

    expect(link.textContent).toContain('0');
  });

  it('passes extra attributes through to the link', () => {
    const link = mountSegmentLink({
      'data-testid': 'history-segment',
      target: '_blank',
    });

    expect(link.dataset.testid).toBe('history-segment');
    expect(link.target).toBe('_blank');
  });
});
