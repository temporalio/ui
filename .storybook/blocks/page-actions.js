import { useOf } from '@storybook/addon-docs/blocks';
import { createElement, useEffect, useId, useRef } from 'react';
import { filterArgTypes } from 'storybook/preview-api';
import { mount, unmount } from 'svelte';

import { pageMarkdown } from './page-markdown';

import PageActionsButton from './page-actions.svelte';

export function PageActions({ documentation }) {
  const { preparedMeta } = useOf('meta', ['meta']);
  const { title, argTypes, parameters } = preparedMeta;
  const { include, exclude } = parameters.docs?.argTypes ?? {};
  const markdown = pageMarkdown(
    title.split('/').at(-1),
    documentation,
    filterArgTypes(argTypes, include, exclude),
  );
  const target = useRef(null);
  const id = `io-docs-page-actions-${useId().replace(/:/g, '')}`;

  // Docs blocks render in React; mount the shared Svelte control inside this block.
  useEffect(() => {
    const component = mount(PageActionsButton, {
      target: target.current,
      props: { markdown, id },
    });
    return () => {
      void unmount(component);
    };
  }, [markdown, id]);

  return createElement('div', {
    ref: target,
    className: 'io-docs-page-actions sb-unstyled',
  });
}
