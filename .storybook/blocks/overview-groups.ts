import { toId } from 'storybook/internal/csf';

export type OverviewEntry = {
  title: string;
  description?: string;
  group?: string;
};

export type OverviewCard = {
  name: string;
  href: string;
  description: string;
};

export type OverviewGroup = {
  name?: string;
  id?: string;
  cards: OverviewCard[];
};

export const otherGroupName = 'Other';

export const headingId = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function overviewGroups(
  entries: OverviewEntry[],
  section: string,
  order: string[] = [],
): OverviewGroup[] {
  const cards = entries
    .filter((entry) => entry.title.split('/')[0] === section)
    .map((entry) => ({
      card: {
        name: entry.title.split('/').at(-1) ?? entry.title,
        href: `?path=/docs/${toId(entry.title, 'Docs')}`,
        description: entry.description ?? '',
      },
      group: entry.group,
    }))
    .sort((a, b) => a.card.name.localeCompare(b.card.name));

  if (!cards.length) return [];
  if (!cards.some(({ group }) => group)) {
    return [{ cards: cards.map(({ card }) => card) }];
  }

  const groupOf = ({ group }: { group?: string }) => group ?? otherGroupName;
  const names = new Set(cards.map(groupOf));
  const unordered = [...names]
    .filter((name) => !order.includes(name) && name !== otherGroupName)
    .sort((a, b) => a.localeCompare(b));
  const groupNames = [
    ...order.filter((name) => names.has(name) && name !== otherGroupName),
    ...unordered,
    ...(names.has(otherGroupName) ? [otherGroupName] : []),
  ];

  return groupNames.map((name) => ({
    name,
    id: headingId(name),
    cards: cards
      .filter((entry) => groupOf(entry) === name)
      .map(({ card }) => card),
  }));
}
