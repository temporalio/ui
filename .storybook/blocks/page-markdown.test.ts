import { describe, expect, test } from 'vitest';

import { apiReference, pageMarkdown } from './page-markdown';

describe('pageMarkdown', () => {
  test('joins the title, description, usage, and API reference', () => {
    const usage = '## Usage\n\n```svelte\n<Button>Save</Button>\n```';
    const markdown = pageMarkdown({
      title: 'Button',
      description: 'Triggers an action.',
      usage,
      argTypes: { disabled: { type: { name: 'boolean' } } },
    });

    expect(
      markdown.startsWith(`# Button\n\nTriggers an action.\n\n${usage}\n\n`),
    ).toBe(true);
    expect(markdown).toContain('## API Reference\n\n| Name |');
    expect(markdown.endsWith('| disabled |  | `boolean` | — | No |\n')).toBe(
      true,
    );
  });

  test('omits missing description and usage', () => {
    expect(pageMarkdown({ title: 'Example' })).toBe(
      '# Example\n\n## API Reference\n\nNo props are documented for this component.\n',
    );
  });
});

describe('apiReference', () => {
  test('generates a table from visible API props', () => {
    const table = apiReference({
      variant: {
        description: 'Choose a style.\nUse primary | secondary.',
        type: { name: 'enum', required: true },
        table: {
          type: { summary: '"primary" | "secondary"' },
          defaultValue: { summary: '"primary"' },
        },
      },
      disabled: {
        type: { name: 'boolean' },
        table: { defaultValue: { summary: false } },
      },
      children: { table: { type: { summary: 'Snippet' } } },
      class: { table: { disable: true } },
    });

    expect(table).toContain(
      '| variant | Choose a style.<br />Use primary \\| secondary. | `"primary" \\| "secondary"` | `"primary"` | Yes |',
    );
    expect(table).toContain('| disabled |  | `boolean` | `false` | No |');
    expect(table).toContain('| children |  | `Snippet` | — | No |');
    expect(table).not.toContain('| class |');
  });

  test('includes expanded type details', () => {
    expect(
      apiReference({
        options: {
          table: { type: { summary: 'Options', detail: '{ size: number }' } },
        },
      }),
    ).toContain('`Options`<br />`{ size: number }`');
  });

  test('formats generic types as code so they are not read as HTML', () => {
    expect(
      apiReference({
        items: { table: { type: { summary: 'Array<string>' } } },
      }),
    ).toContain('| items |  | `Array<string>` | — | No |');
    expect(
      apiReference({
        label: { table: { type: { summary: 'Snippet<[`a`]>' } } },
      }),
    ).toContain('| label |  | `` Snippet<[`a`]> `` | — | No |');
  });
});
