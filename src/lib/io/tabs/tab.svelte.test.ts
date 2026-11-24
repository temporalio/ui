import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import Tab from './tab.svelte';

const label = createRawSnippet(() => ({
  render: () => '<span>History</span>',
}));

describe('Tab', () => {
  it('renders a button with its label', () => {
    render(Tab, { props: { children: label } });

    const tab = screen.getByRole('button', { name: 'History' });
    expect(tab.getAttribute('type')).toBe('button');
  });

  it('renders the count, including zero', () => {
    render(Tab, { props: { children: label, count: 0 } });

    expect(screen.getByRole('button').textContent).toContain('0');
  });

  it('omits the count when not provided', () => {
    render(Tab, { props: { children: label } });

    expect(screen.getByRole('button').textContent?.trim()).toBe('History');
  });

  it('passes tab attributes through to the button', () => {
    render(Tab, {
      props: {
        children: label,
        id: 'history-tab',
        role: 'tab',
        'aria-selected': true,
        'aria-controls': 'history-panel',
      },
    });

    const tab = screen.getByRole('tab');
    expect(tab.id).toBe('history-tab');
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(tab.getAttribute('aria-controls')).toBe('history-panel');
  });

  it('merges caller classes', () => {
    render(Tab, { props: { children: label, class: 'px-3' } });

    const tab = screen.getByRole('button');
    expect(tab.classList.contains('px-3')).toBe(true);
    expect(tab.classList.contains('px-1')).toBe(false);
  });
});
