import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

import {
  generatedBannerPrefix,
  pageSummary,
  stripGeneratedBanner,
  stripStoryMarkers,
} from './docs-markdown';

export type AgentDocsPage = {
  slug: string;
  name: string;
  section: string;
  description: string;
  markdown: string;
};

export const agentDocsPaths = {
  index: '/llms.txt',
  full: '/llms-full.txt',
  page: (slug: string) => `/io/${slug}.md`,
  overviewPage: './?path=/docs/overview--docs',
  forAgentsSection: './?path=/docs/overview--docs#for-agents',
};

export const llmsSectionOrder = ['Guides', 'Components', 'Layouts'];

const relativeLink = (path: string) => path.replace(/^\//, '');

const title = '# io Design System';

const summary =
  "> Temporal's design system for product UI: Svelte 5 components, semantic theme tokens, and an icon library. Components ship in `@temporalio/ui`; import each one from its own entry point, `$lib/io/<name>` inside temporalio/ui or `@temporalio/ui/io/<name>` in other apps.";

const notes =
  "Every guide and component has a Markdown page, written from the same source as its Storybook docs page. Component pages include usage guidance, Do / Don't rules, and an API reference. Prefer semantic theme classes such as `text-primary`, `bg-surface-primary`, and `border-primary` so UI follows the light and dark themes.";

const storiesSuffix = '.stories.svelte';

export function generatedMarkdownFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return generatedMarkdownFiles(path);
    return entry.name.endsWith('.md') &&
      !entry.name.endsWith('.usage.md') &&
      readFileSync(path, 'utf8').startsWith(generatedBannerPrefix)
      ? [path]
      : [];
  });
}

function pageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return pageFiles(path);
    return entry.name.endsWith('.md') &&
      !entry.name.endsWith('.usage.md') &&
      existsSync(`${path.slice(0, -'.md'.length)}${storiesSuffix}`)
      ? [path]
      : [];
  });
}

export const sectionForFolder = (folder: string): string => {
  if (folder.startsWith('guides/')) return 'Guides';
  if (folder.startsWith('layouts/')) return 'Layouts';
  return 'Components';
};

const sectionRank = (section: string) => {
  const index = llmsSectionOrder.indexOf(section);
  return index === -1 ? llmsSectionOrder.length : index;
};

const byReadingOrder = (a: AgentDocsPage, b: AgentDocsPage) =>
  sectionRank(a.section) - sectionRank(b.section) ||
  a.section.localeCompare(b.section) ||
  a.name.localeCompare(b.name);

export const rebaseStorybookLinks = (markdown: string, base: string) =>
  markdown.replace(/\]\(\?path=/g, `](${base}?path=`);

export const servedPageMarkdown = (page: AgentDocsPage) =>
  rebaseStorybookLinks(page.markdown, '../');

export function loadPages(root: string): AgentDocsPage[] {
  const ioDirectory = join(root, 'src', 'lib', 'io');

  return pageFiles(ioDirectory)
    .map((path) => {
      const markdown = stripStoryMarkers(
        stripGeneratedBanner(readFileSync(path, 'utf8')),
      );
      const folder = relative(ioDirectory, dirname(path)).split('\\').join('/');
      const slug = folder.split('/').at(-1) ?? folder;
      const { name = slug, description } = pageSummary(markdown);
      return {
        slug,
        name,
        section: sectionForFolder(folder),
        description,
        markdown,
      };
    })
    .sort(byReadingOrder);
}

export function llmsSections(
  pages: AgentDocsPage[],
): { section: string; pages: AgentDocsPage[] }[] {
  const sections = new Map<string, AgentDocsPage[]>();
  for (const page of [...pages].sort(byReadingOrder)) {
    sections.set(page.section, [...(sections.get(page.section) ?? []), page]);
  }
  return [...sections.entries()].map(([section, sectionPages]) => ({
    section,
    pages: sectionPages,
  }));
}

export function buildLlmsIndex(pages: AgentDocsPage[]): string {
  const url = relativeLink;
  const line = (page: AgentDocsPage) =>
    `- [${page.name}](${url(agentDocsPaths.page(page.slug))})${page.description ? `: ${page.description}` : ''}`;

  return [
    title,
    summary,
    notes,
    '## Docs',
    [
      `- [Overview](${url(agentDocsPaths.overviewPage)}): Getting started, the guides, and every component.`,
      `- [Full documentation](${url(agentDocsPaths.full)}): Every guide and component page in one file.`,
      `- [For agents](${url(agentDocsPaths.forAgentsSection)}): The files on this site written for AI tools, and how to point an assistant at them.`,
    ].join('\n'),
    ...llmsSections(pages).flatMap(({ section, pages: sectionPages }) => [
      `## ${section}`,
      sectionPages.map(line).join('\n'),
    ]),
  ]
    .join('\n\n')
    .concat('\n');
}

export function buildLlmsFull(pages: AgentDocsPage[]): string {
  return [
    [title, summary, notes].join('\n\n'),
    ...[...pages]
      .sort(byReadingOrder)
      .map((page) => rebaseStorybookLinks(page.markdown, './').trim()),
  ]
    .join('\n\n---\n\n')
    .concat('\n');
}
