import {
  ArgTypes,
  Canvas,
  Controls,
  Description,
  Heading,
  Markdown,
  Stories,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks';
import { Fragment, createElement as h } from 'react';

import { PageActions } from './page-actions';

/** Shared IO docs layout; Meta in the attached MDX supplies the component stories. */
export function ComponentDocs({ documentation }) {
  const { preparedMeta } = useOf('meta', ['meta']);
  const excludedControls = Object.entries(preparedMeta.argTypes ?? {})
    .filter(
      ([, argType]) => argType.control === false || argType.control?.disable,
    )
    .map(([name]) => name);

  return h(
    Fragment,
    null,
    h(PageActions, { documentation }),
    h(Title),
    h(Description),
    h(Heading, null, 'Playground'),
    h(
      'div',
      { className: 'io-docs-playground' },
      h(
        'div',
        { className: 'io-docs-canvas' },
        h(Canvas, { withToolbar: true, sourceState: 'shown' }),
      ),
      h(
        'section',
        { className: 'io-docs-adjust-props', 'aria-label': 'Adjust props' },
        h(Controls, { exclude: excludedControls }),
      ),
    ),
    h(Stories, {
      title: h(Heading, null, 'Examples'),
      includePrimary: false,
    }),
    h(Markdown, null, documentation),
    h(Heading, null, 'API Reference'),
    h(
      'div',
      {
        className: 'io-docs-api-reference',
        role: 'region',
        'aria-label': 'API reference table',
        tabIndex: 0,
      },
      h(ArgTypes),
    ),
  );
}
