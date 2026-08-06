import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('application navigation', () => {
  it('adds one local cluster-level Workflow catalog link to shared navigation data', () => {
    const source = readFileSync(
      resolve('src/routes/(app)/+layout.svelte'),
      'utf8',
    );

    expect(source).toContain('routeForWorkflowCatalog');
    expect(source).toContain("label: 'Workflow catalog'");
    expect(source).toContain('showWorkflowCatalogNav');
    expect(source).toContain('hidden: !showWorkflowCatalogNav');
    expect(source.match(/linkList/g)?.length).toBeGreaterThan(2);
    expect(source).not.toMatch(
      /showNamespacePicker[\s\S]*workflowCatalogRoute[\s\S]*\.some/,
    );
  });
});
