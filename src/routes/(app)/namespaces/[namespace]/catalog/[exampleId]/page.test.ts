import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const pagePath = resolve(
  'src/routes/(app)/namespaces/[namespace]/catalog/[exampleId]/+page.svelte',
);

describe('/namespaces/[namespace]/catalog/[exampleId]', () => {
  it('presents the selected example scoped to the route namespace', () => {
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain("import Badge from '$lib/holocene/badge.svelte'");
    expect(source).toContain("import Link from '$lib/holocene/link.svelte'");
    expect(source).toContain('LeadingIcon={IconChevronLeft}');
    expect(source).toContain('routeForCatalog({ namespace })');
    expect(source).toContain('resolveCatalogForNamespace(namespace)');
    expect(source).toContain('{descriptor.title}');
    expect(source).toContain('{descriptor.description}');
    expect(source).toContain("descriptor.source.id === 'local'");
    expect(source).toContain('{descriptor.source.label}');
    expect(source).not.toContain('Permalink');
    expect(source).not.toContain('routeForCatalogExample(');
    expect(source).not.toContain('getCatalogContext');
  });

  it('renders a clear not-found state for an unknown catalog ID', () => {
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain(
      'findRouteCatalogDescriptor(\n      resolveCatalogForNamespace(namespace),\n      exampleId,\n    )',
    );
    expect(source).toContain('Catalog example not found');
    expect(source).toContain('routeForCatalog');
  });
});
