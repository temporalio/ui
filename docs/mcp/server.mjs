#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const docsDir = join(root, 'docs/static/components');
const examplesDir = join(root, 'docs/src/examples');
const ioArkDir = join(root, 'src/lib/io-poc');

const read = (path) => readFileSync(path, 'utf8');

const findContracts = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return findContracts(path);
    return entry.name.endsWith('.contract.md') ? [path] : [];
  });

const contracts = new Map(
  findContracts(ioArkDir).map((path) => [
    path
      .split('/')
      .pop()
      .replace(/\.contract\.md$/, ''),
    path,
  ]),
);

export const components = readdirSync(docsDir)
  .filter((file) => file.endsWith('.md'))
  .map((file) => {
    const slug = file.replace(/\.md$/, '');
    const markdown = read(join(docsDir, file));
    const [, name = slug, paragraph = ''] =
      markdown.match(/^# (.+)\n+([^#][\s\S]*?)\n\n/) ?? [];
    const description = paragraph.replace(/\s+/g, ' ');
    const contract = contracts.get(slug);
    const entryPoint = contract
      ? `@temporalio/ui/io-poc/${relative(ioArkDir, dirname(contract))}`
      : undefined;
    return { slug, name, description, entryPoint, hasContract: !!contract };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

const slugs = components.map((component) => component.slug);
const slugInput = {
  slug: z
    .enum(slugs)
    .describe('Component slug from list_components, such as "select".'),
};

const text = (value) => ({ content: [{ type: 'text', text: value }] });

export function createServer() {
  const server = new McpServer({ name: 'io-poc', version: '0.1.0' });

  server.registerTool(
    'list_components',
    {
      title: 'List io-poc components',
      description:
        'Lists every io-poc component with its slug, name, one-line description, package entry point, and whether it has a contract. Call this first to find the right component and slug.',
    },
    () => text(JSON.stringify(components, null, 2)),
  );

  server.registerTool(
    'get_usage_guide',
    {
      title: 'Get the io-poc usage guide',
      description:
        'Returns the guide for teams using io-poc: setup with the Tailwind preset, which component to use when, the shared form API and value shapes, overlays, and common mistakes. Read it before choosing or combining components.',
    },
    () => text(read(join(ioArkDir, 'AGENTS.md'))),
  );

  server.registerTool(
    'get_component_docs',
    {
      title: 'Get component docs',
      description:
        "Returns a component's documentation as Markdown: anatomy, usage snippets, and the API reference with every prop, type and default.",
      inputSchema: slugInput,
    },
    ({ slug }) => text(read(join(docsDir, `${slug}.md`))),
  );

  server.registerTool(
    'get_contract',
    {
      title: 'Get component contract',
      description:
        "Returns a component's contract: numbered MUST, SHOULD and MAY rules for inputs, behavior, display, accessibility and tests (for example IN-1), plus known gaps and open decisions. Cite rule IDs when reviewing code.",
      inputSchema: slugInput,
    },
    ({ slug }) => {
      const path = contracts.get(slug);
      return path
        ? text(read(path))
        : { ...text(`${slug} has no contract.`), isError: true };
    },
  );

  server.registerTool(
    'get_example',
    {
      title: 'Get component examples',
      description:
        "Returns the Svelte source of a component's docs examples, covering its common variants and states. Imports use $lib/io-poc/<name>; outside the temporalio/ui repository use @temporalio/ui/io-poc/<name>.",
      inputSchema: slugInput,
    },
    ({ slug }) => {
      try {
        return text(read(join(examplesDir, `${slug}-examples.svelte`)));
      } catch {
        return { ...text(`${slug} has no examples file.`), isError: true };
      }
    },
  );

  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await createServer().connect(new StdioServerTransport());
}
