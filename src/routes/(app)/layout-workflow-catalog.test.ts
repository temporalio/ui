import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const layoutSource = () =>
  readFileSync(resolve('src/routes/(app)/+layout.svelte'), 'utf8');

describe('application navigation', () => {
  it('keeps Workflow catalog out of shared navigation data', () => {
    const source = layoutSource();

    expect(source).not.toContain("label: 'Workflow catalog'");
    expect(source).not.toContain('showWorkflowCatalogNav');
    expect(source).not.toContain('WorkflowCatalogProvider');
  });

  it('shows the namespace picker on workflow catalog routes', () => {
    const source = layoutSource();

    expect(source).toContain(
      'workflowCatalogRoute: routeForWorkflowCatalog({ namespace })',
    );
    expect(source).toMatch(
      /showNamespacePicker = \$derived\(\s*\[[^\]]*workflowCatalogRoute/,
    );
    expect(source).toMatch(
      /subPath: 'workflow-catalog',\s*fullRoute: routeForWorkflowCatalog\(\{ namespace \}\)/,
    );
  });
});
