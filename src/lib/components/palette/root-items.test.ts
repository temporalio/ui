import { describe, expect, it } from 'vitest';

import {
  groupIntoSections,
  rootItems,
  searchItems,
  sortToolSets,
} from './root-items';
import type { PaletteContext, PaletteTool, PaletteToolSet } from './types';

const ctx: PaletteContext = {
  push: () => {},
  pop: () => {},
  close: () => {},
  toast: () => {},
  namespace: () => undefined,
  subject: () => undefined,
};

function tool(id: string, section: string, extra: Partial<PaletteTool> = {}) {
  return {
    id,
    section,
    items: () => [{ id: 'item', title: `${id} item`, actions: [] }],
    ...extra,
  } satisfies PaletteTool;
}

describe('rootItems', () => {
  it('sorts tools by order', () => {
    const set: PaletteToolSet = {
      id: 'dev',
      label: 'Dev',
      key: 'd',
      tools: [
        tool('late', 'Late', { order: 50 }),
        tool('early', 'Early', { order: 1 }),
      ],
    };

    expect(
      rootItems([set], ctx, 'On this page').map(({ section }) => section),
    ).toEqual(['Early', 'Late']);
  });

  it('merges sets, labels sections, and keeps ids unique', () => {
    const user: PaletteToolSet = {
      id: 'user',
      label: 'User',
      key: 'u',
      tools: [tool('nav', 'Navigation')],
    };
    const dev: PaletteToolSet = {
      id: 'dev',
      label: 'Dev',
      key: 'd',
      tools: [tool('nav', 'Navigation')],
    };

    const entries = rootItems([user, dev], ctx, 'On this page');
    expect(entries.map(({ section }) => section)).toEqual([
      'User · Navigation',
      'Dev · Navigation',
    ]);
    expect(entries.map(({ item }) => item.id)).toEqual([
      'user:nav:item',
      'dev:nav:item',
    ]);
    expect(groupIntoSections(entries)).toHaveLength(2);
  });

  it('puts page tools first under one section', () => {
    const set: PaletteToolSet = {
      id: 'workflow',
      label: 'Workflow',
      key: 'w',
      tools: [
        tool('open', 'Open', { order: 1 }),
        tool('current', 'This workflow', { order: 50, placement: 'page' }),
      ],
    };

    expect(
      rootItems([set], ctx, 'On this page').map(({ section, page }) => [
        section,
        page,
      ]),
    ).toEqual([
      ['On this page', true],
      ['Open', false],
    ]);
  });
});

describe('searchItems', () => {
  const set: PaletteToolSet = {
    id: 'workflow',
    label: 'Workflow',
    key: 'w',
    tools: [
      tool('open', 'Open', {
        search: (query) => [{ id: 'q', title: `Open ${query}`, actions: [] }],
      }),
    ],
  };

  it('builds items from the trimmed query with prefixed ids', () => {
    const [entry] = searchItems([set], '  order-1 ', ctx, 'On this page');
    expect(entry.item).toMatchObject({
      id: 'workflow:open:q',
      title: 'Open order-1',
    });
  });

  it('builds nothing for an empty query', () => {
    expect(searchItems([set], '   ', ctx, 'On this page')).toEqual([]);
  });
});

describe('sortToolSets', () => {
  it('sorts sets by order, then id', () => {
    const set = (id: string, order?: number): PaletteToolSet => ({
      id,
      label: id,
      key: id[0],
      order,
      tools: [],
    });
    expect(
      sortToolSets([set('dev', 900), set('nav', 10), set('help')]).map(
        ({ id }) => id,
      ),
    ).toEqual(['nav', 'help', 'dev']);
  });
});
