import { fireEvent, render, screen } from '@testing-library/svelte';
import { type ComponentProps, flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import TabsFixture from './tabs-fixture.svelte';

type FixtureProps = ComponentProps<typeof TabsFixture>;

function setup(props: FixtureProps) {
  const result = render(TabsFixture, { props });
  const tab = (name: string) => screen.getByRole('tab', { name });
  const panel = (name: string) => screen.getByTestId(`panel-${name}`);

  function focus(name: string) {
    tab(name).focus();
    flushSync();
  }

  async function press(key: string) {
    await fireEvent.keyDown(document.activeElement ?? document.body, { key });
  }

  function focused() {
    return document.activeElement?.textContent?.trim();
  }

  function selected() {
    return screen
      .getAllByRole('tab')
      .filter((element) => element.getAttribute('aria-selected') === 'true')
      .map((element) => element.textContent?.trim());
  }

  function tabStops() {
    return screen
      .getAllByRole('tab')
      .filter((element) => element.getAttribute('tabindex') === '0')
      .map((element) => element.textContent?.trim());
  }

  async function update(next: Partial<FixtureProps>) {
    await result.rerender({ ...props, ...next });
  }

  return { tab, panel, focus, press, focused, selected, tabStops, update };
}

describe('Tabs', () => {
  it('links each tab to its panel', () => {
    const { tab, panel } = setup({ tabs: ['a', 'b'] });

    expect(tab('a').getAttribute('aria-controls')).toBe(panel('a').id);
    expect(panel('a').getAttribute('role')).toBe('tabpanel');
    expect(panel('a').getAttribute('aria-labelledby')).toBe(tab('a').id);
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(
      'horizontal',
    );
  });

  it('links tabs whose values contain spaces', () => {
    const { tab, panel } = setup({ tabs: ['recent runs', 'upcoming runs'] });

    expect(tab('recent runs').id).not.toMatch(/\s/);
    expect(tab('recent runs').getAttribute('aria-controls')).toBe(
      panel('recent runs').id,
    );
    expect(panel('recent runs').getAttribute('aria-labelledby')).toBe(
      tab('recent runs').id,
    );
  });

  it('keeps ids stable when tabs are reordered', async () => {
    const { tab, update } = setup({ tabs: ['a', 'b', 'c'] });
    const idBefore = tab('c').id;

    await update({ tabs: ['c', 'a', 'b'] });

    expect(tab('c').id).toBe(idBefore);
  });

  it('mounts only the selected panel by default', () => {
    const { panel } = setup({ tabs: ['a', 'b'], selectedTab: 'b' });

    expect(panel('a').hidden).toBe(true);
    expect(panel('a').textContent?.trim()).toBe('');
    expect(panel('b').hidden).toBe(false);
    expect(panel('b').textContent?.trim()).toBe('b content');
  });

  it('keeps hidden panels mounted with keepMounted', () => {
    const { panel } = setup({ tabs: ['a', 'b'], keepMounted: true });

    expect(panel('b').hidden).toBe(true);
    expect(panel('b').textContent?.trim()).toBe('b content');
  });

  it('makes the selected tab the only tab stop', () => {
    const { tabStops } = setup({ tabs: ['a', 'b', 'c'], selectedTab: 'b' });

    expect(tabStops()).toEqual(['b']);
  });

  it('selects a tab on click', async () => {
    const onSelectedTabChange = vi.fn();
    const { tab, selected } = setup({ tabs: ['a', 'b'], onSelectedTabChange });

    await fireEvent.click(tab('b'));

    expect(selected()).toEqual(['b']);
    expect(onSelectedTabChange).toHaveBeenCalledWith('b');
  });

  it('does not report a change when the selected tab is clicked', async () => {
    const onSelectedTabChange = vi.fn();
    const { tab } = setup({ tabs: ['a', 'b'], onSelectedTabChange });

    await fireEvent.click(tab('a'));

    expect(onSelectedTabChange).not.toHaveBeenCalled();
  });

  it('moves focus and selection with arrow keys by default', async () => {
    const { focus, press, focused, selected, tabStops } = setup({
      tabs: ['a', 'b', 'c'],
    });

    focus('a');
    await press('ArrowRight');

    expect(focused()).toBe('b');
    expect(selected()).toEqual(['b']);
    expect(tabStops()).toEqual(['b']);

    await press('ArrowLeft');
    await press('ArrowLeft');

    expect(focused()).toBe('c');
    expect(selected()).toEqual(['c']);
  });

  it('moves to the first and last tabs with Home and End', async () => {
    const { focus, press, focused } = setup({ tabs: ['a', 'b', 'c'] });

    focus('b');
    await press('End');
    expect(focused()).toBe('c');

    await press('Home');
    expect(focused()).toBe('a');
  });

  it('uses up and down arrows when vertical', async () => {
    const { focus, press, focused } = setup({
      tabs: ['a', 'b', 'c'],
      orientation: 'vertical',
    });

    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(
      'vertical',
    );

    focus('a');
    await press('ArrowRight');
    expect(focused()).toBe('a');

    await press('ArrowDown');
    expect(focused()).toBe('b');
  });

  it('marks disabled tabs and skips them with arrow keys', async () => {
    const { tab, focus, press, focused } = setup({
      tabs: ['a', 'b', 'c'],
      disabledTabs: ['b'],
    });

    expect(tab('b').getAttribute('aria-disabled')).toBe('true');
    expect(tab('a').hasAttribute('aria-disabled')).toBe(false);

    focus('a');
    await press('ArrowRight');

    expect(focused()).toBe('c');
  });

  it('does not select a disabled tab', async () => {
    const onSelectedTabChange = vi.fn();
    const { tab, selected } = setup({
      tabs: ['a', 'b'],
      disabledTabs: ['b'],
      element: 'div',
      onSelectedTabChange,
    });

    await fireEvent.click(tab('b'));
    await fireEvent.keyDown(tab('b'), { key: 'Enter' });

    expect(selected()).toEqual(['a']);
    expect(onSelectedTabChange).not.toHaveBeenCalled();
  });

  it('moves the tab stop off a tab that becomes disabled', async () => {
    const { tabStops, update } = setup({
      tabs: ['a', 'b', 'c'],
      selectedTab: 'b',
    });

    expect(tabStops()).toEqual(['b']);

    await update({ disabledTabs: ['b'] });

    expect(tabStops()).toEqual(['a']);
  });

  it('moves focus without selecting under manual activation', async () => {
    const { focus, press, focused, selected, tabStops } = setup({
      tabs: ['a', 'b', 'c'],
      activation: 'manual',
    });

    focus('a');
    await press('ArrowRight');

    expect(focused()).toBe('b');
    expect(selected()).toEqual(['a']);
    expect(tabStops()).toEqual(['b']);
  });

  it('returns the tab stop to the selected tab when focus leaves', async () => {
    const { focus, press, tabStops } = setup({
      tabs: ['a', 'b', 'c'],
      activation: 'manual',
    });

    focus('a');
    await press('ArrowRight');
    screen.getByRole('button', { name: 'Outside' }).focus();
    flushSync();

    expect(tabStops()).toEqual(['a']);
  });

  it('selects non-button tabs with Enter and Space', async () => {
    const { focus, press, selected } = setup({
      tabs: ['a', 'b', 'c'],
      activation: 'manual',
      element: 'div',
    });

    focus('a');
    await press('ArrowRight');
    await press('Enter');
    expect(selected()).toEqual(['b']);

    await press('ArrowRight');
    await press(' ');
    expect(selected()).toEqual(['c']);
  });
});
