import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const pagePath = resolve(
  'src/routes/(app)/namespaces/[namespace]/workflow-catalog/[exampleId]/+page.svelte',
);

describe('/namespaces/[namespace]/workflow-catalog/[exampleId]', () => {
  it('presents the selected example scoped to the route namespace', () => {
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain("import Badge from '$lib/holocene/badge.svelte'");
    expect(source).toContain("import Link from '$lib/holocene/link.svelte'");
    expect(source).toContain('leadingIcon="chevron-left"');
    expect(source).toContain('routeForWorkflowCatalog({ namespace })');
    expect(source).toContain('resolveWorkflowCatalogForNamespace(namespace)');
    expect(source).toContain('{descriptor.title}');
    expect(source).toContain('{descriptor.description}');
    expect(source).toContain("descriptor.source.id === 'local'");
    expect(source).toContain('{descriptor.source.label}');
    expect(source).not.toContain('Permalink');
    expect(source).not.toContain('routeForWorkflowCatalogExample(');
    expect(source).not.toContain('getWorkflowCatalogContext');
  });

  it('renders a clear not-found state for an unknown catalog ID', () => {
    const source = readFileSync(pagePath, 'utf8');

    expect(source).toContain(
      'findRouteWorkflowDescriptor(\n      resolveWorkflowCatalogForNamespace(namespace),\n      exampleId,\n    )',
    );
    expect(source).toContain('Workflow example not found');
    expect(source).toContain('routeForWorkflowCatalog');
  });
});
