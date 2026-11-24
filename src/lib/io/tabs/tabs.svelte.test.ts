import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import TabsFixture from './tabs-fixture.svelte';

describe('Tabs', () => {
  it('selects the first tab when no tab is bound', () => {
    render(TabsFixture, { props: { tabs: ['a', 'b'] } });

    expect(
      screen.getByRole('tab', { name: 'a' }).getAttribute('aria-selected'),
    ).toBe('true');
    expect(screen.getByRole('tabpanel', { name: 'a' }).hidden).toBe(false);
  });

  it('writes the selected tab back through bind:selectedTab', async () => {
    render(TabsFixture, { props: { tabs: ['a', 'b'], selectedTab: 'a' } });

    await fireEvent.click(screen.getByRole('tab', { name: 'b' }));

    expect(screen.getByTestId('bound').textContent).toBe('b');
    expect(screen.getByRole('tabpanel', { name: 'b' }).hidden).toBe(false);
  });
});
