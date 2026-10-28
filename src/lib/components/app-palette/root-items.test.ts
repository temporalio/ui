import { describe, expect, it } from 'vitest';

import { IconFlag, IconKey } from '$lib/io/icon';

import {
  groupIntoSections,
  rootItems,
  searchItems,
  sortToolSets,
  uniqueById,
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
  it("gives items their tool's icon unless they set their own", () => {
    const set: PaletteToolSet = {
      id: 'dev',
      label: 'Dev',
      key: 'd',
      tools: [
        {
          id: 'flags',
          section: 'Flags',
          icon: IconFlag,
          items: () => [
            { id: 'plain', title: 'Plain', actions: [] },
            { id: 'own', title: 'Own', icon: IconKey, actions: [] },
          ],
        },
      ],
    };
    const icons = rootItems([set], () => ctx, 'On this page').map(
      ({ item }) => item.icon,
    );
    expect(icons).toEqual([IconFlag, IconKey]);
  });

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
      rootItems([set], () => ctx, 'On this page').map(({ section }) => section),
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

    const entries = rootItems([user, dev], () => ctx, 'On this page');
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
      rootItems([set], () => ctx, 'On this page').map(({ section, page }) => [
        section,
        page,
      ]),
    ).toEqual([
      ['On this page', true],
      ['Open', false],
    ]);
  });
});

describe('rootItems contexts', () => {
  it("builds each set's context from its variant", () => {
    const variants: string[] = [];
    const sets: PaletteToolSet[] = [
      { id: 'user', label: 'User', key: 'u', tools: [tool('a', 'A')] },
      {
        id: 'dev',
        label: 'Dev',
        key: 'd',
        variant: 'dev',
        tools: [tool('b', 'B')],
      },
    ];
    rootItems(
      sets,
      (variant) => {
        variants.push(variant);
        return ctx;
      },
      'On this page',
    );
    expect(variants).toEqual(['default', 'dev']);
  });
});

describe('uniqueById', () => {
  it('keeps the first item for each id', () => {
    expect(
      uniqueById([
        { id: 'a', n: 1 },
        { id: 'b', n: 2 },
        { id: 'a', n: 3 },
      ]),
    ).toEqual([
      { id: 'a', n: 1 },
      { id: 'b', n: 2 },
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
    const [entry] = searchItems([set], '  order-1 ', () => ctx, 'On this page');
    expect(entry.item).toMatchObject({
      id: 'workflow:open:q',
      title: 'Open order-1',
    });
  });

  it('builds nothing for an empty query', () => {
    expect(searchItems([set], '   ', () => ctx, 'On this page')).toEqual([]);
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
