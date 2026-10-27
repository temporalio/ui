import { type ContractDocument, parseContractMarkdown } from './markdown';

export interface ComponentContract extends ContractDocument {
  slug: string;
  path: string;
  markdown: string;
}

const files = import.meta.glob<string>(
  '../../../src/lib/io-poc/**/*.contract.md',
  { query: '?raw', import: 'default', eager: true },
);

const contracts = new Map(
  Object.entries(files).map(([file, markdown]) => {
    const path = file.replace(/^(\.\.\/)+/, '');
    const slug = path
      .split('/')
      .pop()!
      .replace(/\.contract\.md$/, '');
    return [slug, { slug, path, markdown, ...parseContractMarkdown(markdown) }];
  }),
);

export const getContract = (slug: string): ComponentContract | undefined =>
  contracts.get(slug);

export const contractSlugs = [...contracts.keys()].sort();

export const maintainerSections = [
  'known-gaps',
  'review-candidates',
  'decisions',
  'reconciliation-log',
];
