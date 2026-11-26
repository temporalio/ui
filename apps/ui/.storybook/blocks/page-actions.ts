import { useOf } from '@storybook/addon-docs/blocks';
import {
  createElement,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { mount, unmount } from 'svelte';

import PageActionsButton from './page-actions.svelte';

const generatedPages = import.meta.glob<string>(
  [
    '/src/lib/io/**/*.md',
    '!/src/lib/io/**/*.usage.md',
    '!/src/lib/io/**/AGENTS.md',
    '!/src/lib/io/**/README.md',
  ],
  { query: '?raw', import: 'default' },
);

const generatedBanner = /^<!--[\s\S]*?-->\s*/;

function generatedPagePath(storiesFileName: string): string {
  return storiesFileName
    .replace(/^\./, '')
    .replace(/\.stories\.svelte$/, '.md');
}

export function PageActions(): ReactElement | null {
  const { preparedMeta } = useOf('meta', ['meta']);
  const fileName: string = preparedMeta.parameters.fileName ?? '';
  const loadPage = generatedPages[generatedPagePath(fileName)];
  const [markdown, setMarkdown] = useState<string>();
  const target = useRef<HTMLDivElement>(null);
  const id = `io-docs-page-actions-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    let active = true;
    setMarkdown(undefined);
    void loadPage?.().then((page) => {
      if (active) setMarkdown(page.replace(generatedBanner, ''));
    });
    return () => {
      active = false;
    };
  }, [loadPage]);

  // Docs blocks render in React; mount the shared Svelte control inside this block.
  useEffect(() => {
    if (!target.current || !markdown) return;
    const component = mount(PageActionsButton, {
      target: target.current,
      props: { markdown, id },
    });
    return () => {
      void unmount(component);
    };
  }, [markdown, id]);

  if (!markdown) return null;

  return createElement('div', {
    ref: target,
    className: 'io-docs-page-actions sb-unstyled',
  });
}
