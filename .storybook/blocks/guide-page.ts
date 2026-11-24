import {
  AnchorMdx,
  Canvas,
  CodeOrSourceMdx,
  HeadersMdx,
  Markdown,
} from '@storybook/addon-docs/blocks';
import { Fragment, createElement as h, type ReactElement } from 'react';
import { components } from 'storybook/internal/components';

import { splitGuide } from '../docs-markdown';

const markdownOptions = {
  overrides: {
    a: AnchorMdx,
    code: CodeOrSourceMdx,
    ...HeadersMdx,
    ol: components.ol,
    ul: components.ul,
    li: components.li,
    blockquote: components.blockquote,
    hr: components.hr,
    dl: components.dl,
    img: components.img,
  },
};

type GuidePageProps = {
  markdown: string;
  stories?: Record<string, unknown>;
};

export function GuidePage({
  markdown,
  stories = {},
}: GuidePageProps): ReactElement {
  return h(
    Fragment,
    null,
    ...splitGuide(markdown).map((part, index) => {
      if (part.type === 'markdown') {
        return h(Markdown, {
          key: index,
          options: markdownOptions,
          children: part.markdown,
        });
      }
      const story = stories[part.story];
      if (!story) {
        throw new Error(
          `The guide marks a story named "${part.story}", but its stories file has no export with that name.`,
        );
      }
      return h(Canvas, { key: index, of: story });
    }),
  );
}
