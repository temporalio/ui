import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('WorkflowCatalogProvider', () => {
  it('guards catalog sessions with active write and target namespace policy', () => {
    const provider = readFileSync(
      resolve(
        'src/routes/(app)/dev-tools/workflow-catalog/workflow-catalog-provider.svelte',
      ),
      'utf8',
    );

    expect(provider).toContain('workflowCatalogStartAllowed');
    expect(provider).toContain('page.data?.settings?.disableWriteActions');
    expect(provider).toContain('startWorkflowDisabled?: boolean');
    expect(provider).toContain('$coreUser.namespaceWriteDisabled');
    expect(provider).toMatch(
      /createWorkflowCatalogSessionStore\(host, \{[\s\S]*startAllowed:/,
    );
  });

  it('owns the catalog session above route navigation and below app teardown', () => {
    const appLayout = readFileSync(
      resolve('src/routes/(app)/+layout.svelte'),
      'utf8',
    );
    const catalogLayout = readFileSync(
      resolve('src/routes/(app)/dev-tools/workflow-catalog/+layout.svelte'),
      'utf8',
    );
    const provider = readFileSync(
      resolve(
        'src/routes/(app)/dev-tools/workflow-catalog/workflow-catalog-provider.svelte',
      ),
      'utf8',
    );

    expect(appLayout).toMatch(
      /<WorkflowCatalogProvider>[\s\S]*<ErrorBoundary>[\s\S]*\{@render children\(\)\}[\s\S]*<\/ErrorBoundary>[\s\S]*<\/WorkflowCatalogProvider>/,
    );
    expect(provider).toContain('createOssUiWorkbenchHost');
    expect(provider).toContain('createWorkflowCatalogSessionStore');
    expect(provider).toContain(
      'setWorkflowCatalogContext({ host, sessionStore });',
    );
    expect(provider).toContain('onDestroy(() => sessionStore.dispose());');
    expect(catalogLayout).not.toContain('createOssUiWorkbenchHost');
    expect(catalogLayout).not.toContain('createWorkflowCatalogSessionStore');
  });
});
