import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('/dev-tools/workflow-catalog', () => {
  it('renders the flat catalog list using the layout-scoped session store', () => {
    const source = readFileSync(
      resolve('src/routes/(app)/dev-tools/workflow-catalog/+page.svelte'),
      'utf8',
    );

    expect(source).toContain('routeWorkflowCatalog');
    expect(source).toContain("from './catalog'");
    expect(source).toContain('getWorkflowCatalogContext');
    expect(source).toContain('<PageTitle title="Workflow catalog" />');
    expect(source).toContain('<h1>Workflow catalog</h1>');
    expect(source).toContain(
      'Browse and run workflow examples for local development.',
    );
    expect(source).toMatch(/<WorkflowCatalogList\s[^>]*descriptors=/);
    expect(source).toContain('sessionStore={context.sessionStore}');
    expect(source).not.toContain('createOssUiWorkbenchHost');
    expect(source).not.toContain('page.params.namespace');
    expect(source).not.toContain('NamespacePicker');
  });
});
