import { fireEvent, render, screen } from '@testing-library/svelte';
import { type ComponentProps, flushSync } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import RovingFocusFixture from './roving-focus-fixture.svelte';

type FixtureProps = ComponentProps<typeof RovingFocusFixture>;

function setup(props: FixtureProps) {
  const result = render(RovingFocusFixture, { props });
  const button = (name: string) => screen.getByRole('button', { name });

  function focus(name: string) {
    button(name).focus();
    flushSync();
  }

  async function press(key: string) {
    const target = document.activeElement ?? document.body;
    const notCancelled = await fireEvent.keyDown(target, { key });
    return { defaultPrevented: !notCancelled };
  }

  function focused() {
    return document.activeElement?.textContent;
  }

  function tabStops() {
    return screen
      .getAllByRole('button')
      .filter((element) => element.getAttribute('tabindex') === '0')
      .map((element) => element.textContent);
  }

  async function update(next: Partial<FixtureProps>) {
    await result.rerender({ ...props, ...next });
  }

  return { button, focus, press, focused, tabStops, update };
}

describe('createRovingFocus', () => {
  describe('tab stop', () => {
    it('gives exactly one item tabindex 0', () => {
      const { tabStops, button } = setup({ items: ['a', 'b', 'c'] });

      expect(tabStops()).toEqual(['a']);
      expect(button('b').getAttribute('tabindex')).toBe('-1');
      expect(button('c').getAttribute('tabindex')).toBe('-1');
    });

    it('starts on the reset item', () => {
      const { tabStops } = setup({ items: ['a', 'b', 'c'], selected: 'b' });

      expect(tabStops()).toEqual(['b']);
    });

    it('falls back to the first enabled item when the reset item is disabled', () => {
      const { tabStops } = setup({
        items: ['a', 'b', 'c'],
        selected: 'b',
        isDisabled: (id) => id !== 'c',
      });

      expect(tabStops()).toEqual(['c']);
    });

    it('follows focus', () => {
      const { focus, tabStops } = setup({ items: ['a', 'b', 'c'] });

      focus('c');

      expect(tabStops()).toEqual(['c']);
    });

    it('follows the reset item while nothing is focused', async () => {
      const { update, tabStops } = setup({
        items: ['a', 'b', 'c'],
        selected: 'a',
      });

      await update({ selected: 'c' });

      expect(tabStops()).toEqual(['c']);
    });
  });

  describe('horizontal arrows', () => {
    it('moves focus right and left', async () => {
      const { focus, press, focused, tabStops } = setup({
        items: ['a', 'b', 'c'],
      });
      focus('a');

      await press('ArrowRight');
      expect(focused()).toBe('b');
      expect(tabStops()).toEqual(['b']);

      await press('ArrowLeft');
      expect(focused()).toBe('a');
    });

    it('prevents default on handled keys only', async () => {
      const { focus, press } = setup({ items: ['a', 'b'] });
      focus('a');

      expect((await press('ArrowRight')).defaultPrevented).toBe(true);
      expect((await press('ArrowDown')).defaultPrevented).toBe(false);
      expect((await press('Enter')).defaultPrevented).toBe(false);
    });

    it('ignores vertical arrows', async () => {
      const { focus, press, focused } = setup({ items: ['a', 'b'] });
      focus('a');

      await press('ArrowDown');

      expect(focused()).toBe('a');
    });

    it('wraps by default', async () => {
      const { focus, press, focused } = setup({ items: ['a', 'b', 'c'] });
      focus('c');

      await press('ArrowRight');
      expect(focused()).toBe('a');

      await press('ArrowLeft');
      expect(focused()).toBe('c');
    });

    it('stops at the ends when loop is false', async () => {
      const { focus, press, focused } = setup({
        items: ['a', 'b', 'c'],
        loop: false,
      });
      focus('c');

      await press('ArrowRight');
      expect(focused()).toBe('c');

      focus('a');
      await press('ArrowLeft');
      expect(focused()).toBe('a');
    });
  });

  describe('vertical arrows', () => {
    it('moves focus down and up', async () => {
      const { focus, press, focused } = setup({
        items: ['a', 'b', 'c'],
        orientation: 'vertical',
      });
      focus('b');

      await press('ArrowDown');
      expect(focused()).toBe('c');

      await press('ArrowUp');
      expect(focused()).toBe('b');
    });

    it('ignores horizontal arrows', async () => {
      const { focus, press, focused } = setup({
        items: ['a', 'b'],
        orientation: 'vertical',
      });
      focus('a');

      const { defaultPrevented } = await press('ArrowRight');

      expect(focused()).toBe('a');
      expect(defaultPrevented).toBe(false);
    });

    it('picks up an orientation change', async () => {
      const { focus, press, focused, update } = setup({ items: ['a', 'b'] });
      await update({ orientation: 'vertical' });
      focus('a');

      await press('ArrowDown');

      expect(focused()).toBe('b');
    });
  });

  describe('Home and End', () => {
    it('jumps to the first and last items', async () => {
      const { focus, press, focused } = setup({ items: ['a', 'b', 'c', 'd'] });
      focus('b');

      await press('End');
      expect(focused()).toBe('d');

      await press('Home');
      expect(focused()).toBe('a');
    });

    it('skips disabled items at the ends', async () => {
      const { focus, press, focused } = setup({
        items: ['a', 'b', 'c', 'd'],
        disabled: ['a', 'd'],
      });
      focus('b');

      await press('End');
      expect(focused()).toBe('c');

      await press('Home');
      expect(focused()).toBe('b');
    });
  });

  describe('disabled items', () => {
    it('skips disabled and aria-disabled items', async () => {
      const { focus, press, focused } = setup({
        items: ['a', 'b', 'c', 'd'],
        disabled: ['b'],
        ariaDisabled: ['c'],
      });
      focus('a');

      await press('ArrowRight');
      expect(focused()).toBe('d');

      await press('ArrowLeft');
      expect(focused()).toBe('a');
    });

    it('stays put when every other item is disabled', async () => {
      const { focus, press, focused } = setup({
        items: ['a', 'b', 'c'],
        disabled: ['b', 'c'],
      });
      focus('a');

      await press('ArrowRight');

      expect(focused()).toBe('a');
    });

    it('uses a custom isDisabled', async () => {
      const { focus, press, focused } = setup({
        items: ['a', 'b', 'c'],
        isDisabled: (id) => id === 'b',
      });
      focus('a');

      await press('ArrowRight');

      expect(focused()).toBe('c');
    });
  });

  describe('onNavigate', () => {
    it('is called when a key moves focus', async () => {
      const onNavigate = vi.fn();
      const { focus, press, button } = setup({ items: ['a', 'b'], onNavigate });
      focus('a');

      await press('ArrowRight');

      expect(onNavigate).toHaveBeenCalledExactlyOnceWith('b', button('b'));
    });

    it('is not called when focus arrives another way', () => {
      const onNavigate = vi.fn();
      const { focus } = setup({ items: ['a', 'b'], onNavigate });

      focus('b');

      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('keys from non-items', () => {
    it('ignores keydown from other elements in the group', async () => {
      const { focus, press, focused, tabStops } = setup({
        items: ['a', 'b'],
        withAction: true,
      });
      focus('action');

      const { defaultPrevented } = await press('ArrowRight');

      expect(defaultPrevented).toBe(false);
      expect(focused()).toBe('action');
      expect(tabStops()).toEqual(['a']);
    });
  });

  describe('focus-out', () => {
    it('resets the tab stop to the reset item when focus leaves', async () => {
      const { focus, press, update, tabStops } = setup({
        items: ['a', 'b', 'c'],
        selected: 'a',
      });
      focus('a');
      await press('End');
      await update({ selected: 'b' });
      expect(tabStops()).toEqual(['c']);

      focus('outside');

      expect(tabStops()).toEqual(['b']);
    });

    it('keeps the tab stop when focus moves within the group', () => {
      const { focus, tabStops } = setup({
        items: ['a', 'b', 'c'],
        selected: 'a',
        withAction: true,
      });
      focus('c');

      focus('action');

      expect(tabStops()).toEqual(['c']);
    });

    it('resets when focus leaves the document', () => {
      const { focus, button, tabStops } = setup({
        items: ['a', 'b'],
        selected: 'a',
      });
      focus('b');

      button('b').blur();
      flushSync();

      expect(tabStops()).toEqual(['a']);
    });
  });

  describe('items changing while focused', () => {
    it('keeps the focused item as the tab stop when items are added', async () => {
      const { focus, press, focused, update, tabStops } = setup({
        items: ['b', 'c'],
      });
      focus('b');

      await update({ items: ['a', 'b', 'c', 'd'] });

      expect(focused()).toBe('b');
      expect(tabStops()).toEqual(['b']);
      await press('ArrowLeft');
      expect(focused()).toBe('a');
      await press('End');
      expect(focused()).toBe('d');
    });

    it('navigates from the focused item after others are removed', async () => {
      const { focus, press, focused, update } = setup({
        items: ['a', 'b', 'c', 'd'],
      });
      focus('c');

      await update({ items: ['a', 'c'] });
      await press('ArrowLeft');

      expect(focused()).toBe('a');
    });

    it('falls back to the reset item when the focused item is removed', async () => {
      const { focus, update, tabStops } = setup({
        items: ['a', 'b', 'c'],
        selected: 'a',
      });
      focus('c');

      await update({ items: ['a', 'b'] });

      expect(tabStops()).toEqual(['a']);
    });

    it('falls back to the first item when the focused and reset items are removed', async () => {
      const { focus, update, tabStops } = setup({
        items: ['a', 'b', 'c'],
        selected: 'a',
      });
      focus('a');

      await update({ items: ['b', 'c'] });

      expect(tabStops()).toEqual(['b']);
    });
  });
});
