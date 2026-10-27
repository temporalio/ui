import { sanitize } from 'hast-util-sanitize';
import { toHtml } from 'hast-util-to-html';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { gfmTableFromMarkdown } from 'mdast-util-gfm-table';
import { toHast } from 'mdast-util-to-hast';
import { gfmTable } from 'micromark-extension-gfm-table';

import type { PropDefinition } from '../components/props-table.svelte';

type MarkdownNode = ReturnType<typeof fromMarkdown>['children'][number];
interface TextNode {
  type: string;
  value?: string;
  children?: TextNode[];
}
const text = (node: TextNode): string =>
  node.value ?? node.children?.map(text).join('') ?? '';

export type AnatomySide = 'top' | 'right' | 'bottom' | 'left';

export interface AnatomyPart {
  name: string;
  description: string;
  selector?: string;
  side?: AnatomySide;
  children: AnatomyPart[];
}

export type DocumentationBlock =
  | { type: 'html'; html: string }
  | { type: 'anatomy'; parts: AnatomyPart[] }
  | { type: 'code'; code: string; filename: string }
  | { type: 'props'; componentName: string; rows: PropDefinition[] };

export interface MarkdownSection {
  id: string;
  title: string;
  blocks: DocumentationBlock[];
}

export function parseComponentMarkdown(markdown: string) {
  const root = fromMarkdown(markdown, {
    extensions: [gfmTable()],
    mdastExtensions: [gfmTableFromMarkdown()],
  });
  const heading = root.children[0];
  const description = root.children[1];
  if (
    heading?.type !== 'heading' ||
    heading.depth !== 1 ||
    description?.type !== 'paragraph'
  ) {
    throw new Error(
      'Component Markdown must start with a level-one name and a description paragraph.',
    );
  }

  const sections: Record<string, MarkdownSection> = {};
  let section: MarkdownSection | undefined;
  let componentName = text(heading);
  for (const node of root.children.slice(2)) {
    if (node.type === 'heading' && node.depth === 2) {
      const title = text(node);
      const id =
        title === 'API reference'
          ? 'api'
          : title.toLowerCase().replace(/\s+/g, '-');
      if (sections[id])
        throw new Error(`Duplicate documentation section: ${id}`);
      section = sections[id] = { id, title, blocks: [] };
      continue;
    }
    if (!section)
      throw new Error(
        'Component Markdown content must belong to a level-two section.',
      );
    if (node.type === 'heading' && node.depth === 3) componentName = text(node);
    if (section.id === 'anatomy' && node.type === 'list') {
      section.blocks.push({ type: 'anatomy', parts: toAnatomyParts(node) });
      continue;
    }
    section.blocks.push(toBlock(node, componentName));
  }
  for (const id of ['examples', 'usage', 'api']) {
    if (!sections[id]) throw new Error(`Missing documentation section: ${id}`);
  }
  return { name: text(heading), description: text(description), sections };
}

type ListNode = Extract<MarkdownNode, { type: 'list' }>;

function toAnatomyParts(list: ListNode): AnatomyPart[] {
  return list.children.map((item) => {
    const [summary, ...rest] = item.children;
    const strong =
      summary?.type === 'paragraph'
        ? summary.children.find((child) => child.type === 'strong')
        : undefined;
    if (!strong || summary?.type !== 'paragraph') {
      throw new Error('Anatomy items must start with a bold part name.');
    }
    const name = text(strong);
    const after = summary.children.slice(summary.children.indexOf(strong) + 1);
    const code = after.find((child) => child.type === 'inlineCode');
    const remainder = after
      .filter((child) => child !== code)
      .map(text)
      .join('');
    const side = remainder.match(/^\s*\((top|right|bottom|left)\)/)?.[1] as
      | AnatomySide
      | undefined;
    const description = remainder
      .replace(/^\s*\((top|right|bottom|left)\)/, '')
      .replace(/^[\s:—–-]+/, '')
      .trim();
    const nested = rest.find((child) => child.type === 'list');
    return {
      name,
      description,
      ...(code ? { selector: code.value } : {}),
      ...(side ? { side } : {}),
      children: nested ? toAnatomyParts(nested) : [],
    };
  });
}

export function toBlock(
  node: MarkdownNode,
  componentName: string,
): DocumentationBlock {
  if (node.type === 'code') {
    return {
      type: 'code',
      code: node.value,
      filename: `Example.${node.lang === 'svelte' ? 'svelte' : (node.lang ?? 'txt')}`,
    };
  }
  if (node.type === 'table') {
    const [header, ...rows] = node.children;
    if (
      header.children.map(text).join(',') !== 'Prop,Type,Default,Description' ||
      rows.some((row) => row.children.length !== 4)
    ) {
      throw new Error(
        'API tables must have Prop, Type, Default, and Description columns.',
      );
    }
    return {
      type: 'props',
      componentName,
      rows: rows.map((row): PropDefinition => {
        const [name, type, defaultValue, description] = row.children.map(text);
        return [name, type, defaultValue, description];
      }),
    };
  }
  // Raw HTML is omitted by toHast; sanitize also filters unsafe links and markup.
  return {
    type: 'html',
    html: toHtml(sanitize(toHast({ type: 'root', children: [node] }))),
  };
}

export interface ContractDocument {
  meta: Record<string, string>;
  title: string;
  intro: MarkdownSection;
  sections: MarkdownSection[];
}

export function parseContractMarkdown(markdown: string): ContractDocument {
  const frontmatter = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) {
    throw new Error('Contracts must start with YAML frontmatter.');
  }
  const meta = Object.fromEntries(
    frontmatter[1]
      .split('\n')
      .map((line) => line.match(/^([A-Za-z]+):\s*(.*)$/))
      .filter((match): match is RegExpMatchArray => !!match)
      .map(([, key, value]) => [key, value.trim()]),
  );
  for (const key of ['component', 'source', 'status']) {
    if (!meta[key]) throw new Error(`Contract frontmatter is missing ${key}.`);
  }
  const root = fromMarkdown(markdown.slice(frontmatter[0].length), {
    extensions: [gfmTable()],
    mdastExtensions: [gfmTableFromMarkdown()],
  });
  const [heading, ...nodes] = root.children;
  if (heading?.type !== 'heading' || heading.depth !== 1) {
    throw new Error('Contracts must have a level-one title.');
  }
  const intro: MarkdownSection = { id: 'intro', title: '', blocks: [] };
  const sections: MarkdownSection[] = [];
  let current = intro;
  for (const node of nodes) {
    if (node.type === 'heading' && node.depth === 2) {
      const title = text(node);
      current = {
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title,
        blocks: [],
      };
      sections.push(current);
      continue;
    }
    current.blocks.push(toBlock(node, meta.component));
  }
  return { meta, title: text(heading), intro, sections };
}
