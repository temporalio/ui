import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('/namespaces/[namespace]/workflow-catalog', () => {
  it('renders the catalog list scoped to the route namespace', () => {
    const source = readFileSync(
      resolve(
        'src/routes/(app)/namespaces/[namespace]/workflow-catalog/+page.svelte',
      ),
      'utf8',
    );

    expect(source).toContain('page.params.namespace');
    expect(source).toContain('resolveWorkflowCatalogForNamespace(namespace)');
    expect(source).toContain('getWorkflowCatalogServices');
    expect(source).toContain(
      'routeForWorkflowCatalogExample({ namespace, exampleId })',
    );
    expect(source).toContain('<PageTitle title="Workflow catalog" />');
    expect(source).toContain('<h1>Workflow catalog</h1>');
    expect(source).toContain(
      'Browse and run workflow examples for local development.',
    );
    expect(source).toMatch(/<WorkflowCatalogList\s/);
    expect(source).toContain('sessionStore={services.sessionStore}');
    expect(source).not.toContain('createApiWorkbenchHost');
    expect(source).not.toContain('getWorkflowCatalogContext');
    expect(source).not.toContain('NamespacePicker');
  });
});
