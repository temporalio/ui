import { describe, expect, it } from 'vitest';

import { headingId, overviewGroups } from './overview-groups';

describe('overviewGroups', () => {
  it('returns no groups when the section has no pages', () => {
    expect(overviewGroups([{ title: 'Guides/Theme' }], 'Layouts')).toEqual([]);
  });

  it('returns one unnamed group, sorted by name, when no page sets a group', () => {
    expect(
      overviewGroups(
        [
          { title: 'Guides/Theme', description: 'Tokens.' },
          { title: 'Guides/Forms' },
          { title: 'Components/Button' },
        ],
        'Guides',
      ),
    ).toEqual([
      {
        cards: [
          {
            name: 'Forms',
            href: '?path=/docs/guides-forms--docs',
            description: '',
          },
          {
            name: 'Theme',
            href: '?path=/docs/guides-theme--docs',
            description: 'Tokens.',
          },
        ],
      },
    ]);
  });

  it('orders named groups by the given order, then the rest, then Other', () => {
    const groups = overviewGroups(
      [
        { title: 'Components/Tag', group: 'Labels and status' },
        { title: 'Components/Badge', group: 'Labels and status' },
        { title: 'Components/Icon', group: 'Foundations' },
        { title: 'Components/Button', group: 'Actions and navigation' },
        { title: 'Components/New Thing' },
        { title: 'Components/Chart', group: 'Data display' },
      ],
      'Components',
      ['Labels and status', 'Actions and navigation', 'Foundations', 'Unused'],
    );

    expect(
      groups.map(({ name, cards }) => [name, cards.map((card) => card.name)]),
    ).toEqual([
      ['Labels and status', ['Badge', 'Tag']],
      ['Actions and navigation', ['Button']],
      ['Foundations', ['Icon']],
      ['Data display', ['Chart']],
      ['Other', ['New Thing']],
    ]);
    expect(groups[0].id).toBe('labels-and-status');
  });

  it('builds links from nested titles', () => {
    const [group] = overviewGroups(
      [{ title: 'Layouts/Page Header' }],
      'Layouts',
    );
    expect(group.cards[0]).toMatchObject({
      name: 'Page Header',
      href: '?path=/docs/layouts-page-header--docs',
    });
  });
});

describe('headingId', () => {
  it('slugifies group names', () => {
    expect(headingId('Actions and navigation')).toBe('actions-and-navigation');
  });
});
