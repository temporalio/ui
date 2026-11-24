import { describe, expect, test } from 'vitest';

import {
  type AgentDocsComponent,
  buildLlmsFull,
  buildLlmsIndex,
  loadComponents,
} from './agent-docs';
import { getProjectRoot } from '../scripts/get-project-root';

const button: AgentDocsComponent = {
  slug: 'button',
  name: 'Button',
  description: 'Triggers an action.',
  markdown: '# Button\n\nTriggers an action.\n',
};

describe('buildLlmsIndex', () => {
  test('links the docs, the For agents section, and each component relative to llms.txt', () => {
    const index = buildLlmsIndex([button]);

    expect(index).toMatch(/^# io Design System\n\n> /);
    expect(index).toContain('- [Full documentation](llms-full.txt)');
    expect(index).toContain(
      '- [For agents](./?path=/docs/overview--docs#for-agents)',
    );
    expect(index).toContain('- [Button](io/button.md): Triggers an action.');
  });
});

describe('buildLlmsFull', () => {
  test('joins every component page after the summary', () => {
    const full = buildLlmsFull([button]);

    expect(full).toMatch(/^# io Design System/);
    expect(full).toContain('\n\n---\n\n# Button\n\nTriggers an action.\n');
  });
});

describe('loadComponents', () => {
  const components = loadComponents(getProjectRoot());

  test('reads generated component pages without their banner', () => {
    const page = components.find(({ slug }) => slug === 'button');

    expect(page?.name).toBe('Button');
    expect(page?.markdown).toMatch(/^# Button\n/);
  });

  test('uses the folder name as the slug for nested components', () => {
    expect(
      components.find(({ slug }) => slug === 'page-header')?.markdown,
    ).toMatch(/^# Page Header\n/);
  });

  test('skips usage files and hand-written Markdown', () => {
    expect(components.map(({ slug }) => slug)).not.toContain('icon/README');
    expect(new Set(components.map(({ slug }) => slug)).size).toBe(
      components.length,
    );
  });
});
