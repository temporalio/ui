import { fireEvent, render, screen } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({
  page: { params: {}, data: {}, route: { id: null } },
}));
vi.mock('$lib/stores/toaster', () => ({
  toaster: { push: vi.fn() },
}));

import '$lib/test-utilities/jsdom-browser-apis';

import { loadRecent } from './recent';
import type {
  PaletteAction,
  PaletteContext,
  PaletteFacts,
  PaletteItem,
  PaletteToolSet,
  PaletteView,
} from './types';

import Palette from './palette.svelte';

const MOD = { ctrlKey: true };

function oneSet(
  items: () => PaletteItem[],
  extra: Partial<PaletteToolSet['tools'][number]> = {},
): PaletteToolSet[] {
  return [
    {
      id: 'set',
      label: 'Set',
      key: 's',
      tools: [{ id: 'tool', section: 'Tool', items, ...extra }],
    },
  ];
}

function mount(toolSets: PaletteToolSet[], facts?: PaletteFacts) {
  return render(Palette, {
    props: { toolSets, facts, recentKey: 'sessions' },
  });
}

async function openPalette() {
  await fireEvent.keyDown(window, { key: 'k', ...MOD });
  return screen.getByRole<HTMLInputElement>('combobox');
}

const titles = () =>
  screen.queryAllByRole('option').map((option) => option.textContent?.trim());

function viewItem(view: PaletteView): PaletteItem {
  return {
    id: 'open',
    title: 'Open View',
    actions: [{ title: 'Open', run: (ctx) => ctx.push(view) }],
  };
}

describe('Palette sessions', () => {
  beforeEach(() => localStorage.clear());

  it('renders repeated ids in a view without crashing, once each', async () => {
    const view: PaletteView = {
      id: 'v',
      title: 'View',
      items: () => [
        { id: 'alpha', title: 'Alpha', actions: [] },
        { id: 'alpha', title: 'Alpha again', actions: [] },
      ],
      search: (query) => [
        { id: 'alpha', title: `Typed ${query}`, actions: [] },
      ],
    };
    mount(oneSet(() => [viewItem(view)]));

    const input = await openPalette();
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(titles()).toEqual(['Alpha']);

    await fireEvent.input(input, { target: { value: 'al' } });
    expect(titles()).toEqual(['Typed al']);
  });

  it('applies item rules to the items a view shows', async () => {
    const view: PaletteView = {
      id: 'v',
      title: 'View',
      items: () => [
        { id: 'open', title: 'Everyone', actions: [] },
        {
          id: 'admin',
          title: 'Admins only',
          rules: { permissions: ['admin'] },
          actions: [],
        },
      ],
    };
    mount(
      oneSet(() => [viewItem(view)]),
      {
        env: 'local',
        can: () => false,
      },
    );

    const input = await openPalette();
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(titles()).toEqual(['Everyone']);
  });

  it('ignores a late push from an action that finishes after a close', async () => {
    let finish: () => void = () => {};
    const late: PaletteView = { id: 'late', title: 'Late', items: () => [] };
    const slow: PaletteAction = {
      title: 'Slow',
      run: (ctx) =>
        new Promise<void>((resolve) => {
          finish = () => {
            ctx.push(late);
            resolve();
          };
        }),
    };
    mount(oneSet(() => [{ id: 'slow', title: 'Slow', actions: [slow] }]));

    const input = await openPalette();
    await fireEvent.keyDown(input, { key: 'Enter' });
    await fireEvent.keyDown(input, { key: 'Escape' });
    finish();
    await Promise.resolve();

    await openPalette();
    expect(screen.queryByText('Late')).toBeNull();
    expect(screen.queryByText('Working…')).toBeNull();
  });

  it('does not save query items as recent', async () => {
    mount(
      oneSet(() => [], {
        search: (query) => [
          {
            id: 'pasted',
            title: `Open ${query}`,
            actions: [{ title: 'Open', run: () => {} }],
          },
        ],
      }),
    );

    const input = await openPalette();
    await fireEvent.input(input, { target: { value: 'wf-123' } });
    await fireEvent.keyDown(input, { key: 'Enter' });
    expect(loadRecent('sessions')).toEqual([]);
  });

  it('leaves Enter and the arrow keys to an IME composition', async () => {
    const run = vi.fn();
    mount(
      oneSet(() => [{ id: 'a', title: 'A', actions: [{ title: 'Run', run }] }]),
    );

    const input = await openPalette();
    await fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(run).not.toHaveBeenCalled();
  });

  it('runs the confirmed action even if the item rebuilds its actions', async () => {
    const disable = vi.fn();
    const enable = vi.fn();
    let enabled = $state(true);
    const items = (): PaletteItem[] => [
      {
        id: 'toggle',
        title: 'Toggle',
        actions: [
          enabled
            ? { title: 'Disable', confirm: 'Disable it?', run: disable }
            : { title: 'Enable', run: enable },
        ],
      },
    ];
    mount(oneSet(items));

    const input = await openPalette();
    await fireEvent.keyDown(input, { key: 'Enter' });
    enabled = false;
    flushSync();
    expect(screen.getByRole('option').textContent).toContain('Toggle');
    await fireEvent.click(screen.getByRole('button', { name: /Confirm/ }));

    expect(disable).toHaveBeenCalledOnce();
    expect(enable).not.toHaveBeenCalled();
  });

  it('gives a dev set its dev context, so its views keep the dev tag', async () => {
    let seen: PaletteContext | undefined;
    const view: PaletteView = { id: 'v', title: 'Dev view', items: () => [] };
    const sets: PaletteToolSet[] = [
      {
        id: 'user',
        label: 'User',
        key: 'u',
        tools: [{ id: 't', section: 'T', items: () => [] }],
      },
      {
        id: 'dev',
        label: 'Dev',
        key: 'd',
        variant: 'dev',
        tools: [
          {
            id: 't',
            section: 'T',
            items: (ctx) => {
              seen = ctx;
              return [{ id: 'x', title: 'X', actions: [] }];
            },
          },
        ],
      },
    ];
    mount(sets);

    await openPalette();
    seen?.push(view);
    await Promise.resolve();
    expect(await screen.findByText('Dev tools')).toBeTruthy();
  });

  it('cycles scopes with Tab only while the query is empty', async () => {
    const sets: PaletteToolSet[] = [
      ...oneSet(() => [{ id: 'a', title: 'A', actions: [] }]),
      {
        id: 'other',
        label: 'Other',
        key: 'o',
        tools: [{ id: 't', section: 'T', items: () => [] }],
      },
    ];
    mount(sets);

    const input = await openPalette();
    await fireEvent.input(input, { target: { value: 'a' } });
    const tab = await fireEvent.keyDown(input, { key: 'Tab' });
    expect(tab).toBe(true);
    expect(screen.getByRole('button', { name: /Scope/ }).textContent).toContain(
      'All',
    );
  });

  it('closes and runs view cleanup when it unmounts while open', async () => {
    const onClose = vi.fn();
    const view: PaletteView = { id: 'v', title: 'V', items: () => [], onClose };
    const { unmount } = mount(oneSet(() => [viewItem(view)]));

    const input = await openPalette();
    await fireEvent.keyDown(input, { key: 'Enter' });
    unmount();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
