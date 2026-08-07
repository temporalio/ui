import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('/dev-tools/workflow-catalog/[exampleId]', () => {
  it('presents the selected example with native context and no self-referential link', () => {
    const source = readFileSync(
      resolve(
        'src/routes/(app)/dev-tools/workflow-catalog/[exampleId]/+page.svelte',
      ),
      'utf8',
    );

    expect(source).toContain("import Badge from '$lib/holocene/badge.svelte'");
    expect(source).toContain("import Link from '$lib/holocene/link.svelte'");
    expect(source).toContain('leadingIcon="chevron-left"');
    expect(source).toContain('<Link href={routeForWorkflowCatalog()}');
    expect(source).toContain('{descriptor.title}');
    expect(source).toContain('{descriptor.description}');
    expect(source).toContain("descriptor.source.id === 'local'");
    expect(source).toContain('{descriptor.source.label}');
    expect(source).not.toContain('Permalink');
    expect(source).not.toContain('routeForWorkflowCatalogExample(');
  });

  it('renders a clear not-found state for an unknown catalog ID', () => {
    const source = readFileSync(
      resolve(
        'src/routes/(app)/dev-tools/workflow-catalog/[exampleId]/+page.svelte',
      ),
      'utf8',
    );

    expect(source).toContain(
      'findRouteWorkflowDescriptor(routeWorkflowCatalog, exampleId)',
    );
    expect(source).toContain('Workflow example not found');
    expect(source).toContain('routeForWorkflowCatalog');
  });
});
