import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('application navigation', () => {
  it('keeps Workflow catalog out of shared navigation data', () => {
    const source = readFileSync(
      resolve('src/routes/(app)/+layout.svelte'),
      'utf8',
    );

    expect(source).not.toContain('routeForWorkflowCatalog');
    expect(source).not.toContain("label: 'Workflow catalog'");
    expect(source).not.toContain('showWorkflowCatalogNav');
  });
});
