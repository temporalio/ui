import { AnchorMdx, HeaderMdx } from '@storybook/addon-docs/blocks';
import { Fragment, createElement as h, type ReactElement } from 'react';

import { type OverviewEntry, overviewGroups } from './overview-groups';
import { pageSummary } from '../docs-markdown';

type StoriesModule = {
  default?: {
    title?: string;
    parameters?: {
      docs?: { description?: { component?: string }; group?: string };
    };
  };
};

const storiesSuffix = '.stories.svelte';

const modules = import.meta.glob<StoriesModule>(
  '../../src/lib/io/**/*.stories.svelte',
  { eager: true },
);

const pages = import.meta.glob<string>(
  [
    '../../src/lib/io/**/*.md',
    '!**/*.usage.md',
    '!**/AGENTS.md',
    '!**/README.md',
  ],
  { eager: true, query: '?raw', import: 'default' },
);

const entries: OverviewEntry[] = Object.entries(modules).flatMap(
  ([path, { default: meta }]) => {
    if (!meta?.title) return [];
    const page = pages[`${path.slice(0, -storiesSuffix.length)}.md`];
    return [
      {
        title: meta.title,
        description:
          meta.parameters?.docs?.description?.component ??
          (page ? pageSummary(page).description : undefined),
        group: meta.parameters?.docs?.group,
      },
    ];
  },
);

type OverviewCardsProps = {
  section: string;
  order?: string[];
};

export function OverviewCards({
  section,
  order,
}: OverviewCardsProps): ReactElement {
  return h(
    Fragment,
    null,
    ...overviewGroups(entries, section, order).map((group) =>
      h(
        Fragment,
        { key: group.name ?? section },
        group.id && h(HeaderMdx, { as: 'h3', id: group.id }, group.name),
        h(
          'div',
          { className: 'io-overview-grid' },
          ...group.cards.map((card) =>
            h(
              'div',
              { key: card.href, className: 'io-overview-card' },
              h(
                'p',
                null,
                h(
                  'strong',
                  null,
                  h(AnchorMdx, { href: card.href, target: '_top' }, card.name),
                ),
              ),
              card.description && h('p', null, card.description),
            ),
          ),
        ),
      ),
    ),
  );
}
