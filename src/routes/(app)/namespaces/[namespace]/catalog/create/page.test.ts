import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('/namespaces/[namespace]/catalog/create', () => {
  it('wires concrete local authoring to the namespace catalog routes', () => {
    const source = readFileSync(
      resolve(
        'src/routes/(app)/namespaces/[namespace]/catalog/create/+page.svelte',
      ),
      'utf8',
    );

    expect(source).toContain('page.params.namespace');
    expect(source).toContain("import '../catalog';");
    expect(source).toContain('createFetchCatalogAuthoringHost()');
    expect(source).toContain('routeForCatalog({ namespace })');
    expect(source).toContain(
      'routeForCatalogExample({ namespace, exampleId })',
    );
    expect(source).toContain(
      '<PageTitle title="Create Local example | Catalog" />',
    );
    expect(source).toMatch(/<h1[^>]*>Create Local example<\/h1>/);
    expect(source).toContain('catalog.local');
    expect(source).toMatch(/<CatalogCreate\s/);
  });
});
