import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({ page: { params: {}, data: {} } }));
vi.mock('$lib/stores/toaster', () => ({
  toaster: { push: vi.fn() },
}));

import '$lib/test-utilities/jsdom-browser-apis';

import type { PaletteToolSet, PaletteView } from './types';

import Palette from './palette.svelte';

// jsdom's user agent is not a Mac, so the palette's modifier is Ctrl.
const MOD = { ctrlKey: true };

function setup(toolSets?: PaletteToolSet[]) {
  const toggle = vi.fn();
  const destroy = vi.fn();
  const secondary = vi.fn();
  const onClose = vi.fn();

  const detailView: PaletteView = {
    id: 'detail',
    title: 'Detail',
    items: () => [
      {
        id: 'alpha',
        title: 'Alpha',
        actions: [{ title: 'Pick', run: toggle }],
      },
      { id: 'beta', title: 'Beta', actions: [{ title: 'Pick', run: toggle }] },
    ],
    onClose,
  };

  const defaultSets: PaletteToolSet[] = [
    {
      id: 'dev',
      label: 'Dev',
      key: 'd',
      tools: [
        {
          id: 'test',
          section: 'Testing',
          items: () => [
            {
              id: 'open',
              title: 'Open Detail',
              actions: [{ title: 'Open', run: (ctx) => ctx.push(detailView) }],
            },
            {
              id: 'danger',
              title: 'Delete Things',
              actions: [
                { title: 'Delete', confirm: 'Really delete?', run: destroy },
                { title: 'Other', run: secondary },
              ],
            },
          ],
        },
      ],
    },
  ];

  render(Palette, { props: { toolSets: toolSets ?? defaultSets } });
  return { toggle, destroy, secondary, onClose };
}

async function openPalette() {
  await fireEvent.keyDown(window, { key: 'k', ...MOD });
  return screen.getByRole<HTMLInputElement>('combobox');
}

describe('Palette', () => {
  // Recent items persist in local storage between renders.
  beforeEach(() => localStorage.clear());

  it('opens on Mod+K even when the focused element stops key events', async () => {
    setup();
    // Holocene buttons stop the propagation of every keydown.
    const button = document.createElement('button');
    button.addEventListener('keydown', (event) => event.stopPropagation());
    document.body.append(button);
    button.focus();

    await fireEvent.keyDown(button, { key: 'k', ...MOD });
    expect(screen.getByRole('dialog')).toBeTruthy();
    button.remove();
  });

  it('opens on Mod+K and closes on Escape', async () => {
    setup();
    expect(screen.queryByRole('dialog')).toBeNull();

    const input = await openPalette();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Testing')).toBeTruthy();

    await fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('filters as you type and pushes a view on Enter', async () => {
    const { toggle, onClose } = setup();
    const input = await openPalette();

    await fireEvent.input(input, { target: { value: 'detail' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);

    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Alpha')).toBeTruthy();

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(toggle).toHaveBeenCalledTimes(1);
    expect(
      screen
        .getAllByRole('option')
        .map((option) => option.getAttribute('aria-selected')),
    ).toEqual(['false', 'true']);

    await fireEvent.keyDown(input, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByText('Open Detail')).toBeTruthy();
    expect(input.value).toBe('detail');
  });

  it('asks for a second Enter before a confirm action runs', async () => {
    const { destroy } = setup();
    const input = await openPalette();

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(destroy).not.toHaveBeenCalled();
    expect(screen.getByText('Really delete?')).toBeTruthy();

    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('lets a mouse user confirm with a second click or the Confirm button', async () => {
    const { destroy } = setup();
    await openPalette();
    const row = screen.getByText('Delete Things');

    await fireEvent.click(row);
    await fireEvent.click(row);
    expect(destroy).toHaveBeenCalledTimes(1);

    await fireEvent.click(row);
    await fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));
    expect(destroy).toHaveBeenCalledTimes(2);
  });

  it('drops a pending confirm when the mouse selects another row', async () => {
    const { destroy } = setup();
    const input = await openPalette();

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('Really delete?')).toBeTruthy();

    await fireEvent.mouseMove(screen.getByText('Open Detail'));
    expect(screen.queryByText('Really delete?')).toBeNull();
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(destroy).not.toHaveBeenCalled();
  });

  it('keeps focus in the search input when a row is pressed', async () => {
    setup();
    await openPalette();

    const pressed = await fireEvent.mouseDown(screen.getByText('Open Detail'));
    expect(pressed).toBe(false);
  });

  it('runs the second action on Mod+Enter and lists actions on Mod+K', async () => {
    const { secondary } = setup();
    const input = await openPalette();

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter', ...MOD });
    expect(secondary).toHaveBeenCalledTimes(1);

    await fireEvent.keyDown(window, { key: 'k', ...MOD });
    const menu = screen.getByRole('menu');
    expect(menu.textContent).toContain('Delete');
    expect(menu.textContent).toContain('Other');
    expect(input.getAttribute('aria-activedescendant')).toMatch(/action-0$/);

    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(secondary).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('shows action messages in the footer while open', async () => {
    setup([
      {
        id: 'user',
        label: 'User',
        key: 'u',
        tools: [
          {
            id: 'say',
            section: 'Say',
            items: () => [
              {
                id: 'hi',
                title: 'Say hi',
                actions: [
                  {
                    title: 'Say',
                    run: (ctx) => ctx.toast('Hi there', 'success'),
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
    const input = await openPalette();

    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByRole('status').textContent).toContain('Hi there');
  });

  it('marks dev sections when dev and user tools are mixed', async () => {
    const tool = (id: string) => ({
      id,
      section: id,
      items: () => [{ id: 'x', title: `${id} item`, actions: [] }],
    });
    setup([
      { id: 'user', label: 'User', key: 'u', tools: [tool('nav')] },
      {
        id: 'dev',
        label: 'Dev',
        key: 'd',
        variant: 'dev',
        tools: [tool('flags')],
      },
    ]);
    await openPalette();

    expect(screen.queryByText('Dev tools')).toBeNull();
    const devHeading = screen.getByText('Dev · flags');
    const userHeading = screen.getByText('User · nav');
    expect(devHeading.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(userHeading.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('styles the whole palette when only dev tools are present', async () => {
    setup([
      {
        id: 'dev',
        label: 'Dev',
        key: 'd',
        variant: 'dev',
        tools: [
          {
            id: 'flags',
            section: 'Flags',
            items: () => [{ id: 'x', title: 'Flag', actions: [] }],
          },
        ],
      },
    ]);
    await openPalette();

    expect(screen.getByText('Dev tools')).toBeTruthy();
  });

  describe('scopes, recents and touch', () => {
    const run = vi.fn();

    function scopedSetup(open = false) {
      const tool = (id: string, title: string, extra = {}) => ({
        id,
        section: id,
        items: () => [{ id: 'x', title, actions: [{ title: 'Run', run }] }],
        ...extra,
      });
      const sets: PaletteToolSet[] = [
        {
          id: 'workflow',
          label: 'Workflow',
          key: 'w',
          tools: [
            tool('open', 'Open Workflow', {
              search: (query: string) =>
                query.startsWith('fl')
                  ? [{ id: 'q', title: `Open workflow ${query}`, actions: [] }]
                  : [],
            }),
            {
              id: 'guarded',
              section: 'guarded',
              order: 200,
              items: () => [
                {
                  id: 'terminate',
                  title: 'Terminate Workflow',
                  actions: [
                    { title: 'Terminate', disabled: 'Not allowed here', run },
                    { title: 'Other', run },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'dev',
          label: 'Dev',
          key: 'd',
          variant: 'dev',
          tools: [tool('flags', 'Feature Flags')],
        },
      ];
      render(Palette, { props: { toolSets: sets, open } });
    }

    // Row text without the dev marker.
    const titles = () =>
      screen
        .getAllByRole('option')
        .map((option) => option.textContent?.replace(/^\s*dev\s*/, '').trim());

    beforeEach(() => run.mockClear());

    it('scopes with a key and a space, and unscopes with Backspace', async () => {
      scopedSetup();
      const input = await openPalette();
      expect(screen.getByRole('button', { name: 'Scope: All' })).toBeTruthy();

      await fireEvent.input(input, { target: { value: 'd' } });
      await fireEvent.keyDown(input, { key: ' ' });
      expect(input.value).toBe('');
      expect(
        screen.getByRole('button', { name: 'Scope: Dev tools' }),
      ).toBeTruthy();
      expect(titles()).toEqual(['Feature Flags']);

      await fireEvent.keyDown(input, { key: 'Backspace' });
      expect(screen.getByRole('button', { name: 'Scope: All' })).toBeTruthy();
      expect(titles()).toHaveLength(3);
    });

    it('keeps a space when the query is not a set key', async () => {
      scopedSetup();
      const input = await openPalette();
      await fireEvent.input(input, { target: { value: 'x' } });
      const event = await fireEvent.keyDown(input, { key: ' ' });
      expect(event).toBe(true);
      expect(screen.getByRole('button', { name: 'Scope: All' })).toBeTruthy();
    });

    it('cycles scopes with Tab and Shift+Tab', async () => {
      scopedSetup();
      const input = await openPalette();

      await fireEvent.keyDown(input, { key: 'Tab' });
      expect(
        screen.getByRole('button', { name: 'Scope: Workflow' }),
      ).toBeTruthy();
      await fireEvent.keyDown(input, { key: 'Tab' });
      expect(
        screen.getByRole('button', { name: 'Scope: Dev tools' }),
      ).toBeTruthy();
      await fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
      expect(
        screen.getByRole('button', { name: 'Scope: Workflow' }),
      ).toBeTruthy();
    });

    it('picks a scope from the chip', async () => {
      scopedSetup();
      await openPalette();

      await fireEvent.click(screen.getByRole('button', { name: 'Scope: All' }));
      const options = screen.getAllByRole('menuitemradio');
      expect(
        options.map((option) =>
          option.textContent?.replace(/\s+/g, ' ').trim(),
        ),
      ).toEqual(['All ⌫', 'Workflow w ␣', 'Dev dev d ␣']);

      await fireEvent.click(options[1]);
      expect(screen.queryByRole('menuitemradio')).toBeNull();
      expect(titles()).toEqual(['Open Workflow', 'Terminate Workflow']);
    });

    it('shows a disabled action with its reason and does not run it', async () => {
      scopedSetup();
      const input = await openPalette();
      await fireEvent.input(input, { target: { value: 'terminate' } });

      await fireEvent.keyDown(input, { key: 'Enter' });
      expect(run).not.toHaveBeenCalled();
      expect(screen.getByText('Not allowed here')).toBeTruthy();

      await fireEvent.keyDown(window, { key: 'k', ...MOD });
      const [disabled, other] = screen.getAllByRole('menuitem');
      expect(disabled.getAttribute('aria-disabled')).toBe('true');
      // The menu stays open, so the user can pick another action.
      await fireEvent.click(disabled);
      expect(run).not.toHaveBeenCalled();
      await fireEvent.click(other);
      expect(run).toHaveBeenCalledTimes(1);
    });

    it('shows fallback query items after the filtered results', async () => {
      render(Palette, {
        props: {
          toolSets: [
            {
              id: 'help',
              label: 'Help',
              key: 'h',
              tools: [
                {
                  id: 'docs',
                  section: 'Docs',
                  fallback: true,
                  items: () => [],
                  search: (query) => [
                    { id: 'q', title: `Search docs for ${query}`, actions: [] },
                  ],
                },
                {
                  id: 'links',
                  section: 'Links',
                  items: () => [
                    { id: 'status', title: 'Status page', actions: [] },
                  ],
                },
              ],
            },
          ],
        },
      });
      const input = await openPalette();
      await fireEvent.input(input, { target: { value: 'status' } });
      expect(
        screen
          .getAllByRole('option')
          .map((option) => option.textContent?.trim()),
      ).toEqual(['Status page', 'Search docs for status']);
    });

    it('shows query items above the filtered results', async () => {
      scopedSetup();
      const input = await openPalette();
      await fireEvent.input(input, { target: { value: 'flags' } });
      expect(titles()).toEqual(['Open workflow flags', 'Feature Flags']);
    });

    it('lists recently used items first on the next open', async () => {
      scopedSetup();
      let input = await openPalette();
      await fireEvent.input(input, { target: { value: 'feature' } });
      await fireEvent.keyDown(input, { key: 'Enter' });
      expect(run).toHaveBeenCalledTimes(1);

      await fireEvent.keyDown(input, { key: 'Escape' });
      input = await openPalette();
      expect(screen.getByText('Recent')).toBeTruthy();
      expect(titles()[0]).toContain('Feature Flags');
      expect(
        titles().filter((title) => title?.includes('Feature Flags')),
      ).toHaveLength(1);
    });

    it('puts user and dev page items under one heading', async () => {
      const pageTool = (id: string) => ({
        id,
        section: id,
        placement: 'page' as const,
        items: () => [{ id: 'x', title: `${id} item`, actions: [] }],
      });
      render(Palette, {
        props: {
          toolSets: [
            {
              id: 'workflow',
              label: 'Workflow',
              key: 'w',
              tools: [pageTool('current')],
            },
            {
              id: 'dev',
              label: 'Dev',
              key: 'd',
              variant: 'dev',
              tools: [pageTool('json')],
            },
          ],
        },
      });
      await openPalette();
      expect(screen.getAllByText('On this page')).toHaveLength(1);
      expect(titles()).toEqual(['current item', 'json item']);
      const devRow = screen.getAllByRole('option')[1];
      expect(devRow.querySelector('[aria-hidden="true"]')?.textContent).toBe(
        'dev',
      );
    });

    it('opens the actions menu from the row button', async () => {
      scopedSetup();
      const input = await openPalette();
      await fireEvent.input(input, { target: { value: 'terminate' } });

      const button = document.querySelector<HTMLButtonElement>(
        '[role="option"] button',
      );
      expect(button).not.toBeNull();
      if (button) await fireEvent.click(button);
      expect(screen.getByRole('menu').textContent).toContain(
        'Not allowed here',
      );
    });

    it('closes from the close button', async () => {
      scopedSetup();
      await openPalette();
      await fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('opens from the bound prop, as the user menu does', () => {
      scopedSetup(true);
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('announces the result count and the scope', async () => {
      scopedSetup();
      const input = await openPalette();
      const live = document.querySelector('[aria-live="polite"]');
      expect(live?.textContent?.trim()).toBe('3 results');

      await fireEvent.input(input, { target: { value: 'w' } });
      await fireEvent.keyDown(input, { key: ' ' });
      expect(live?.textContent?.trim()).toBe('Showing Workflow. 2 results');
    });
  });

  it("shows a view's query items above its filtered items", async () => {
    const send = vi.fn();
    setup([
      {
        id: 'workflow',
        label: 'Workflow',
        key: 'w',
        tools: [
          {
            id: 'signal',
            section: 'Signal',
            items: () => [
              {
                id: 'open',
                title: 'Signal workflow',
                actions: [
                  {
                    title: 'Choose',
                    run: (ctx) =>
                      ctx.push({
                        id: 'names',
                        title: 'Signal',
                        items: () => [
                          { id: 'approve', title: 'approve', actions: [] },
                        ],
                        search: (query) => [
                          {
                            id: 'typed',
                            title: `Send ${query}`,
                            actions: [{ title: 'Send', run: send }],
                          },
                        ],
                      }),
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);
    const input = await openPalette();
    await fireEvent.keyDown(input, { key: 'Enter' });
    await fireEvent.input(input, { target: { value: 'appr' } });

    expect(
      screen.getAllByRole('option').map((option) => option.textContent?.trim()),
    ).toEqual(['Send appr', 'approve']);
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(send).toHaveBeenCalledTimes(1);
  });
});
