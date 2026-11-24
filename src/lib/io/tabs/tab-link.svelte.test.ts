import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import TabLinkBar from './tab-link-bar.svelte';
import TabLink from './tab-link.svelte';

const label = createRawSnippet(() => ({
  render: () => '<span>History</span>',
}));

describe('TabLink', () => {
  it('renders a link to the given href', () => {
    render(TabLink, { props: { href: '/history', children: label } });

    const link = screen.getByRole('link', { name: 'History' });
    expect(link.getAttribute('href')).toBe('/history');
    expect(link.hasAttribute('aria-current')).toBe(false);
  });

  it('marks the current page', () => {
    render(TabLink, {
      props: { href: '/history', current: true, children: label },
    });

    expect(screen.getByRole('link').getAttribute('aria-current')).toBe('page');
  });

  it('renders the count, including zero', () => {
    render(TabLink, { props: { href: '/history', count: 0, children: label } });

    expect(screen.getByRole('link').textContent).toContain('0');
  });

  it('passes extra attributes through to the link', () => {
    render(TabLink, {
      props: {
        href: '/history',
        children: label,
        'data-testid': 'history-tab',
        target: '_blank',
      },
    });

    const link = screen.getByTestId('history-tab');
    expect(link.getAttribute('target')).toBe('_blank');
  });
});

describe('TabLinkBar', () => {
  it('renders a labelled nav landmark, not a tablist', () => {
    render(TabLinkBar, { props: { 'aria-label': 'Workflow pages' } });

    expect(
      screen.getByRole('navigation', { name: 'Workflow pages' }),
    ).toBeTruthy();
    expect(screen.queryByRole('tablist')).toBeNull();
  });
});
