import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseComponentMarkdown, parseContractMarkdown } from './markdown';

const parse = (usage: string, api = '') =>
  parseComponentMarkdown(`# Example

A component description.

## Examples

A live example.

## Usage

${usage}

## API reference

${api}`);

describe('component Markdown', () => {
  it('reads the shipped docs and retains API types, defaults, and component table labels', () => {
    const load = (slug: string) =>
      parseComponentMarkdown(
        readFileSync(`docs/static/components/${slug}.md`, 'utf8'),
      );
    const button = load('button');
    const accordion = load('accordion');
    expect(button.name).toBe('Button');
    const buttonTables = button.sections.api.blocks.filter(
      (block) => block.type === 'props',
    );
    expect(buttonTables.map((block) => block.componentName)).toEqual([
      'Button',
      'ButtonLink',
    ]);
    expect(
      buttonTables[0].rows.find((row) => row[0] === 'colorScheme')?.[1],
    ).toBe('primary | secondary | tertiary | ghost | danger');
    expect(buttonTables[1].rows.find((row) => row[0] === 'href')?.[1]).toBe(
      'string | null',
    );
    expect(buttonTables[1].rows.find((row) => row[0] === 'target')?.[2]).toBe(
      '_self (browser default)',
    );
    const accordionTables = accordion.sections.api.blocks.filter(
      (block) => block.type === 'props',
    );
    expect(accordionTables.map((block) => block.componentName)).toEqual([
      'Accordion',
      'AccordionGroup',
    ]);
    expect(
      accordionTables[0].rows.find((row) => row[0] === 'children')?.[1],
    ).toBe('Snippet<[boolean]>');
    expect(
      accordionTables[1].rows.find(
        (row) => row[0] === 'Native div attributes',
      )?.[1],
    ).toBe('HTMLAttributes<HTMLDivElement>');
  });

  it('keeps fenced code intact, including headings and Svelte markup', () => {
    const code = '<script>\n// ## This is code\n</script>\n<Example />';
    const result = parse('```svelte\n' + code + '\n```');
    expect(result.sections.usage.blocks).toEqual([
      { type: 'code', code, filename: 'Example.svelte' },
    ]);
  });

  it('sanitizes raw HTML and unsafe URLs while keeping ordinary links', () => {
    const result = parse(
      '<script>alert(1)</script>\n\n[Unsafe](javascript:alert%281%29) and [Safe](https://example.com).',
    );
    const html = result.sections.usage.blocks
      .filter((block) => block.type === 'html')
      .map((block) => block.html)
      .join('');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('href="https://example.com"');
  });

  it('rejects missing sections and malformed API tables', () => {
    expect(() => parseComponentMarkdown('# Example\n\nDescription.')).toThrow(
      'Missing documentation section',
    );
    expect(() =>
      parse('', '| Prop | Description |\n| --- | --- |\n| open | Expanded |'),
    ).toThrow('API tables must have');
  });
});

describe('component contracts', () => {
  const contractFiles = readdirSync('src/lib/io-poc', { recursive: true })
    .map(String)
    .filter((file) => file.endsWith('.contract.md'))
    .map((file) => join('src/lib/io-poc', file));
  const docSlugs = readdirSync('docs/static/components').map((file) =>
    file.replace(/\.md$/, ''),
  );

  it('has one parseable contract per documented component, pointing at real source', () => {
    const slugs = contractFiles.map((file) =>
      file
        .split('/')
        .pop()!
        .replace(/\.contract\.md$/, ''),
    );
    expect(slugs.sort()).toEqual([...docSlugs].sort());
    for (const file of contractFiles) {
      const contract = parseContractMarkdown(readFileSync(file, 'utf8'));
      expect(existsSync(join(dirname(file), contract.meta.source))).toBe(true);
      expect(contract.title).toBe(
        `${readFileSync(
          `docs/static/components/${file
            .split('/')
            .pop()!
            .replace(/\.contract\.md$/, '')}.md`,
          'utf8',
        )
          .match(/^# (.+)$/m)![1]
          .trim()} contract`,
      );
      expect(contract.sections.map((section) => section.id)).toContain(
        'reconciliation-log',
      );
    }
  });

  it('keeps contracts out of the docs Markdown', () => {
    for (const slug of docSlugs) {
      const markdown = readFileSync(
        `docs/static/components/${slug}.md`,
        'utf8',
      );
      expect(markdown).not.toMatch(/^## Contract$/m);
    }
  });

  it('reads frontmatter and groups sections under level-two headings', () => {
    const contract = parseContractMarkdown(`---
component: Example
source: ./example.svelte
status: draft
---

# Example contract

Intro.

## Input

- **IN-1** Example MUST work.

## Known gaps

None.
`);
    expect(contract.meta).toMatchObject({
      component: 'Example',
      status: 'draft',
    });
    expect(contract.intro.blocks).toHaveLength(1);
    expect(contract.sections.map((section) => section.id)).toEqual([
      'input',
      'known-gaps',
    ]);
  });

  it('rejects contracts without frontmatter', () => {
    expect(() => parseContractMarkdown('# Example contract')).toThrow(
      'YAML frontmatter',
    );
  });
});
