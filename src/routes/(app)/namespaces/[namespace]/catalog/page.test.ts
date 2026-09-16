import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('/namespaces/[namespace]/catalog', () => {
  it('renders the catalog list scoped to the route namespace', () => {
    const source = readFileSync(
      resolve('src/routes/(app)/namespaces/[namespace]/catalog/+page.svelte'),
      'utf8',
    );

    expect(source).toContain('page.params.namespace');
    expect(source).toContain('resolveCatalogForNamespace(namespace)');
    expect(source).toContain('getCatalogServices');
    expect(source).toContain(
      'routeForCatalogExample({ namespace, exampleId })',
    );
    expect(source).toContain('<PageTitle title="Catalog" />');
    expect(source).toContain('<h1>Catalog</h1>');
    expect(source).toContain(
      'Browse and run catalog examples for local development.',
    );
    expect(source).toMatch(/<CatalogList\s/);
    expect(source).toContain('sessionStore={services.sessionStore}');
    expect(source).not.toContain('createApiWorkbenchHost');
    expect(source).not.toContain('getCatalogContext');
    expect(source).not.toContain('NamespacePicker');
  });
});
