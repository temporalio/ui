export interface LlmsComponent {
  slug: string;
  name: string;
  description: string;
  markdown: string;
  contract?: string;
  hasExample: boolean;
}

export interface LlmsInput {
  origin: string;
  guide: string;
  components: LlmsComponent[];
}

export const llmsPaths = {
  index: '/llms.txt',
  full: '/llms-full.txt',
  guide: '/agents.md',
  component: (slug: string) => `/components/${slug}.md`,
  contract: (slug: string) => `/contracts/${slug}.md`,
  example: (slug: string) => `/examples/${slug}.svelte`,
};

const title = '# io Design System';

const summary =
  "> Svelte 5 components for Temporal interfaces, built on Ark UI and styled with Tailwind and Temporal's theme tokens. They ship in `@temporalio/ui`; import each one from `@temporalio/ui/io-poc/<name>`.";

const notes =
  'Every component has a docs page, a runnable examples file, and a contract. Contracts list the rules for using the component as numbered MUST, SHOULD and MAY statements (for example `IN-1`); cite those IDs in reviews. Read the usage guide before choosing a component. Examples and usage snippets import from `$lib/io-poc/<name>`, which is `@temporalio/ui/io-poc/<name>` outside this repository.';

const stripFrontmatter = (markdown: string) =>
  markdown.replace(/^---\n[\s\S]*?\n---\n+/, '');

export function buildLlmsIndex({ origin, components }: LlmsInput): string {
  const url = (path: string) => `${origin}${path}`;
  const componentLines = components.map((component) => {
    const links = [
      component.contract &&
        `contract: ${url(llmsPaths.contract(component.slug))}`,
      component.hasExample &&
        `examples: ${url(llmsPaths.example(component.slug))}`,
    ].filter(Boolean);
    const extra = links.length ? ` (${links.join('; ')})` : '';
    return `- [${component.name}](${url(llmsPaths.component(component.slug))}): ${component.description.replace(/\s+/g, ' ')}${extra}`;
  });

  return [
    title,
    summary,
    notes,
    '## Guides',
    [
      `- [Using io-poc components](${url(llmsPaths.guide)}): Setup, which component to use when, the shared form API, overlays, and common mistakes.`,
      `- [Full documentation](${url(llmsPaths.full)}): The usage guide and every component's docs and contract in one file.`,
    ].join('\n'),
    '## Components',
    componentLines.join('\n'),
  ]
    .join('\n\n')
    .concat('\n');
}

export function buildLlmsFull({ guide, components }: LlmsInput): string {
  const sections = components.map((component) =>
    [component.markdown.trim(), component.contract]
      .filter((part): part is string => !!part)
      .map((part) => stripFrontmatter(part).trim())
      .join('\n\n'),
  );

  return [[title, summary, notes].join('\n\n'), guide.trim(), ...sections]
    .join('\n\n---\n\n')
    .concat('\n');
}
