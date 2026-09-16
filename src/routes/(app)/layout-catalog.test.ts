import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const layoutSource = () =>
  readFileSync(resolve('src/routes/(app)/+layout.svelte'), 'utf8');

describe('application navigation', () => {
  it('keeps Catalog out of shared navigation data', () => {
    const source = layoutSource();

    expect(source).not.toContain("label: 'Catalog'");
    expect(source).not.toContain('showCatalogNav');
    expect(source).not.toContain('CatalogProvider');
  });

  it('shows the namespace picker on catalog routes', () => {
    const source = layoutSource();

    expect(source).toContain('catalogRoute: routeForCatalog({ namespace })');
    expect(source).toMatch(
      /showNamespacePicker = \$derived\(\s*\[[^\]]*catalogRoute/,
    );
    expect(source).toMatch(
      /subPath: 'catalog',\s*fullRoute: routeForCatalog\(\{ namespace \}\)/,
    );
  });
});
