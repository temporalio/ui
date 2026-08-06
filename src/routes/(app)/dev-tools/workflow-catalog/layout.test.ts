import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('/dev-tools/workflow-catalog layout', () => {
  it('renders children without replacing the app-owned catalog session', () => {
    const source = readFileSync(
      resolve('src/routes/(app)/dev-tools/workflow-catalog/+layout.svelte'),
      'utf8',
    );

    expect(source).not.toContain('createOssUiWorkbenchHost');
    expect(source).not.toContain('createWorkflowCatalogSessionStore');
    expect(source).not.toContain('setWorkflowCatalogContext');
    expect(source).not.toContain('onDestroy');
    expect(source).toContain('{@render children()}');
  });
});
