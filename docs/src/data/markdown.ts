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

export type DocumentationBlock =
  | { type: 'html'; html: string }
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
    section.blocks.push(toBlock(node, componentName));
  }
  for (const id of ['examples', 'usage', 'api']) {
    if (!sections[id]) throw new Error(`Missing documentation section: ${id}`);
  }
  return { name: text(heading), description: text(description), sections };
}

function toBlock(
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
