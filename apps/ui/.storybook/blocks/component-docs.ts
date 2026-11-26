import {
  Anchor,
  AnchorMdx,
  ArgTypes,
  Canvas,
  Controls,
  Description,
  DocsContext,
  DocsPage,
  Heading,
  Markdown,
  Subheading,
  Title,
  useOf,
} from '@storybook/addon-docs/blocks';
import {
  Fragment,
  createElement as h,
  type ReactElement,
  useContext,
} from 'react';
import type { StrictArgTypes } from 'storybook/internal/types';
import { filterArgTypes } from 'storybook/preview-api';

import { PageActions } from './page-actions';

const ioStoriesPrefix = './src/lib/io/';

function Examples(): ReactElement | null {
  const { componentStories, projectAnnotations, getStoryContext } =
    useContext(DocsContext);
  let stories = componentStories();
  const filter = projectAnnotations.parameters?.docs?.stories?.filter;
  if (filter) {
    stories = stories.filter((story) => filter(story, getStoryContext(story)));
  }
  if (stories.some((story) => story.tags?.includes('autodocs'))) {
    stories = stories.filter(
      (story) => story.tags?.includes('autodocs') && !story.usesMount,
    );
  }
  stories = stories.slice(1);
  if (!stories.length) return null;

  return h(
    Fragment,
    null,
    h(Heading, null, 'Examples'),
    ...stories.map((story) =>
      h(
        Anchor,
        { key: story.id, storyId: story.id },
        h(
          Subheading,
          null,
          h(
            AnchorMdx,
            { href: `./?path=/story/${story.id}`, target: '_top' },
            story.name,
          ),
        ),
        h(Description, { of: story.moduleExport }),
        h(Canvas, {
          of: story.moduleExport,
          withToolbar: story.parameters.docs?.canvas?.withToolbar ?? false,
          story: { __forceInitialArgs: true },
          source: { __forceInitialArgs: true },
        }),
      ),
    ),
  );
}

export function ComponentDocs(): ReactElement {
  const { preparedMeta } = useOf('meta', ['meta']);
  const fileName: string = preparedMeta.parameters.fileName ?? '';
  if (!fileName.startsWith(ioStoriesPrefix)) return h(DocsPage);

  const usage: string | undefined = preparedMeta.parameters.docs?.usage;
  const excludedControls = Object.entries(preparedMeta.argTypes ?? {})
    .filter(
      ([, argType]) =>
        argType.control === false ||
        (typeof argType.control === 'object' && argType.control?.disable),
    )
    .map(([name]) => name);
  const excludeParameter: string[] | RegExp | undefined =
    preparedMeta.parameters.docs?.controls?.exclude;
  const parameterExcludes =
    excludeParameter instanceof RegExp
      ? Object.keys(preparedMeta.argTypes ?? {}).filter((name) =>
          excludeParameter.test(name),
        )
      : (excludeParameter ?? []);
  const controlsExclude = [...excludedControls, ...parameterExcludes];
  const controllableArgTypes: StrictArgTypes = filterArgTypes(
    (preparedMeta.argTypes ?? {}) as StrictArgTypes,
    preparedMeta.parameters.docs?.controls?.include,
    controlsExclude,
  );
  const hasControls = Object.values(controllableArgTypes).some(
    (argType) => argType.control && !argType.table?.disable,
  );
  const canvas = h(
    'div',
    { className: 'io-docs-canvas' },
    h(Canvas, { withToolbar: true, sourceState: 'shown' }),
  );

  return h(
    Fragment,
    null,
    h(PageActions),
    h(Title),
    h(Description),
    h(Heading, null, 'Playground'),
    hasControls
      ? h(
          'div',
          { className: 'io-docs-playground' },
          canvas,
          h(
            'section',
            { className: 'io-docs-adjust-props', 'aria-label': 'Adjust props' },
            h(Controls, { exclude: controlsExclude }),
          ),
        )
      : canvas,
    h('div', { className: 'io-docs-examples' }, h(Examples)),
    usage ? h(Markdown, null, usage) : null,
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
