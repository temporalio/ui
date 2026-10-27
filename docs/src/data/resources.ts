import { components } from './components';
import { getContract } from './contracts';
import type { LlmsInput } from './llms';
import guide from '../../../src/lib/io-poc/AGENTS.md?raw';

const exampleFiles = import.meta.glob<string>('../examples/*-examples.svelte', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const examples = new Map(
  Object.entries(exampleFiles).map(([path, source]) => [
    path
      .split('/')
      .pop()!
      .replace(/-examples\.svelte$/, ''),
    source,
  ]),
);

export const usageGuide = guide;

export const exampleSlugs = [...examples.keys()].sort();

export const getExampleSource = (slug: string) => examples.get(slug);

export const getLlmsInput = (origin: string): LlmsInput => ({
  origin,
  guide,
  components: components.map((component) => ({
    ...component,
    contract: getContract(component.slug)?.markdown,
    hasExample: examples.has(component.slug),
  })),
});
