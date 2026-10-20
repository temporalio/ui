import { describe, expect, it } from 'vitest';

import { filterPaletteItems } from './filter';
import type { PaletteItem } from './types';

function item(
  title: string,
  extra: Partial<Omit<PaletteItem, 'title'>> = {},
): PaletteItem {
  return { id: title, title, actions: [], ...extra };
}

const titles = (items: PaletteItem[]) => items.map(({ title }) => title);

describe('filterPaletteItems', () => {
  const items = [
    item('Toggle X-ray'),
    item('Feature Flags', { keywords: ['ff'] }),
    item('Clean E2E Namespaces', { subtitle: 'Delete e2e-- namespaces' }),
    item('Open Debugger'),
  ];

  it('returns every item for an empty query', () => {
    expect(titles(filterPaletteItems(items, '  '))).toEqual(titles(items));
  });

  it('matches keywords and subtitles', () => {
    expect(titles(filterPaletteItems(items, 'ff'))).toEqual(['Feature Flags']);
    expect(titles(filterPaletteItems(items, 'delete'))).toEqual([
      'Clean E2E Namespaces',
    ]);
  });

  it('requires every word to match', () => {
    expect(titles(filterPaletteItems(items, 'clean ns'))).toEqual([]);
    expect(titles(filterPaletteItems(items, 'clean name'))).toEqual([
      'Clean E2E Namespaces',
    ]);
  });

  it('ranks a title prefix above a word prefix', () => {
    const ranked = filterPaletteItems(
      [item('Toggle Debugger X-ray'), item('Debugger')],
      'deb',
    );
    expect(titles(ranked)).toEqual(['Debugger', 'Toggle Debugger X-ray']);
  });

  it('splits flag names on underscores', () => {
    expect(
      titles(filterPaletteItems([item('enable_custom_roles')], 'custom')),
    ).toEqual(['enable_custom_roles']);
  });
});
