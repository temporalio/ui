import assert from 'node:assert/strict';
import { test } from 'node:test';

import { pageMarkdown } from './page-markdown.js';

test('exports Markdown verbatim and generates a table from visible API props', () => {
  const documentation = '## Usage\n\n```svelte\n<Button>Save</Button>\n```';
  const markdown = pageMarkdown('Button', documentation, {
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
    children: { control: false, table: { type: { summary: 'Snippet' } } },
    class: { table: { disable: true } },
  });

  assert.ok(markdown.startsWith(`# Button\n\n${documentation}\n`));
  assert.ok(markdown.includes('## API Reference\n\n| Name |'));
  assert.ok(
    markdown.includes(
      '| variant | Choose a style.<br />Use primary \\| secondary. | "primary" \\| "secondary" | "primary" | Yes |',
    ),
  );
  assert.ok(markdown.includes('| disabled |  | boolean | false | No |'));
  assert.ok(markdown.includes('| children |  | Snippet | — | No |'));
  assert.ok(!markdown.includes('| class |'));
});

test('includes expanded type details and handles an empty API reference', () => {
  const markdown = pageMarkdown('Example', 'Some documentation.', {
    options: {
      table: { type: { summary: 'Options', detail: '{ size: number }' } },
    },
  });
  assert.ok(markdown.includes('Options<br />{ size: number }'));
  assert.ok(pageMarkdown('Example', '').includes('No props are documented'));
});
