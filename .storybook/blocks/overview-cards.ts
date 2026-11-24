import { AnchorMdx, HeaderMdx } from '@storybook/addon-docs/blocks';
import { Fragment, createElement as h, type ReactElement } from 'react';

import { type OverviewEntry, overviewGroups } from './overview-groups';

type StoriesModule = {
  default?: {
    title?: string;
    parameters?: {
      docs?: { description?: { component?: string }; group?: string };
    };
  };
};

const modules = import.meta.glob<StoriesModule>(
  '../../src/lib/io/**/*.stories.svelte',
  { eager: true },
);

const entries: OverviewEntry[] = Object.values(modules).flatMap(
  ({ default: meta }) =>
    meta?.title
      ? [
          {
            title: meta.title,
            description: meta.parameters?.docs?.description?.component,
            group: meta.parameters?.docs?.group,
          },
        ]
      : [],
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
