import { parseComponentMarkdown } from './markdown';

export type ComponentContent = ReturnType<typeof parseComponentMarkdown>;

export interface ComponentDocumentation {
  slug: string;
  name: string;
  description: string;
  markdown: string;
}

const markdownFiles = import.meta.glob<string>('../../static/components/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const entries = Object.entries(markdownFiles).map(([path, markdown]) => {
  const slug = path.split('/').pop()!.replace(/\.md$/, '');
  const content = parseComponentMarkdown(markdown);
  const documentation: ComponentDocumentation = {
    slug,
    markdown,
    name: content.name,
    description: content.description,
  };
  return { slug, content, documentation };
});

const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));

const getEntry = (slug: string) => {
  const entry = bySlug.get(slug);
  if (!entry) throw new Error(`Missing documentation for ${slug}`);
  return entry;
};

export const getComponentContent = (slug: string): ComponentContent =>
  getEntry(slug).content;

export const getComponentDocumentation = (
  slug: string,
): ComponentDocumentation => getEntry(slug).documentation;

/** Add `static/components/<slug>.md` and its page to list a component here. */
export const components: ComponentDocumentation[] = entries
  .map((entry) => entry.documentation)
  .sort((a, b) => a.name.localeCompare(b.name));
