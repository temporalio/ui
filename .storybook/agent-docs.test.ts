import { describe, expect, test } from 'vitest';

import {
  type AgentDocsPage,
  buildLlmsFull,
  buildLlmsIndex,
  llmsSections,
  loadPages,
  sectionForFolder,
  servedPageMarkdown,
} from './agent-docs';
import { getProjectRoot } from '../scripts/get-project-root';

const button: AgentDocsPage = {
  slug: 'button',
  name: 'Button',
  section: 'Components',
  description: 'Triggers an action.',
  markdown: '# Button\n\nTriggers an action.\n',
};

const forms: AgentDocsPage = {
  slug: 'forms',
  name: 'Forms',
  section: 'Guides',
  description: 'Building forms.',
  markdown:
    '# Forms\n\nBuilding forms.\n\nSee the [modal guide](?path=/docs/guides-modals--docs).\n',
};

const pageHeader: AgentDocsPage = {
  slug: 'page-header',
  name: 'Page Header',
  section: 'Layouts',
  description: 'A responsive page heading.',
  markdown: '# Page Header\n\nA responsive page heading.\n',
};

describe('buildLlmsIndex', () => {
  test('links the docs and each page relative to llms.txt, by section', () => {
    const index = buildLlmsIndex([pageHeader, button, forms]);

    expect(index).toMatch(/^# io Design System\n\n> /);
    expect(index).toContain('- [Full documentation](llms-full.txt)');
    expect(index).toContain(
      '- [For agents](./?path=/docs/overview--docs#for-agents)',
    );
    expect(index).toContain(
      [
        '## Guides',
        '- [Forms](io/forms.md): Building forms.',
        '## Components',
        '- [Button](io/button.md): Triggers an action.',
        '## Layouts',
        '- [Page Header](io/page-header.md): A responsive page heading.',
      ].join('\n\n'),
    );
  });
});

describe('llmsSections', () => {
  test('puts unknown sections after the known ones', () => {
    expect(
      llmsSections([
        { ...button, section: 'Patterns', name: 'Empty States' },
        pageHeader,
        button,
        forms,
      ]).map(({ section }) => section),
    ).toEqual(['Guides', 'Components', 'Layouts', 'Patterns']);
  });
});

describe('buildLlmsFull', () => {
  test('joins every page after the summary, guides first', () => {
    const full = buildLlmsFull([button, forms]);

    expect(full).toMatch(/^# io Design System/);
    expect(full.indexOf('# Forms')).toBeLessThan(full.indexOf('# Button'));
    expect(full).toContain('\n\n---\n\n# Button\n\nTriggers an action.\n');
  });

  test('points Storybook links at the site root', () => {
    expect(buildLlmsFull([forms])).toContain(
      '[modal guide](./?path=/docs/guides-modals--docs)',
    );
  });
});

describe('servedPageMarkdown', () => {
  test('points Storybook links up from /io/', () => {
    expect(servedPageMarkdown(forms)).toContain(
      '[modal guide](../?path=/docs/guides-modals--docs)',
    );
  });
});

describe('sectionForFolder', () => {
  test('reads the section from the folder', () => {
    expect(sectionForFolder('guides/forms')).toBe('Guides');
    expect(sectionForFolder('layouts/page-header')).toBe('Layouts');
    expect(sectionForFolder('button')).toBe('Components');
  });
});

describe('loadPages', () => {
  const pages = loadPages(getProjectRoot());

  test('reads generated component pages without their banner', () => {
    const page = pages.find(({ slug }) => slug === 'button');

    expect(page).toMatchObject({ name: 'Button', section: 'Components' });
    expect(page?.markdown).toMatch(/^# Button\n/);
  });

  test('reads guide pages without their story markers', () => {
    const page = pages.find(({ slug }) => slug === 'modals-and-drawers');

    expect(page).toMatchObject({
      name: 'Modals and Drawers',
      section: 'Guides',
    });
    expect(page?.markdown).not.toContain('<!-- story:');
  });

  test('gives every page a description and a unique slug', () => {
    for (const page of pages) {
      expect(page.description, page.slug).toBeTruthy();
    }
    expect(new Set(pages.map(({ slug }) => slug)).size).toBe(pages.length);
  });

  test('skips usage files and Markdown without a stories file', () => {
    expect(pages.map(({ slug }) => slug)).not.toContain('icon/README');
    expect(pages.map(({ name }) => name)).not.toContain('IO Components');
  });
});
