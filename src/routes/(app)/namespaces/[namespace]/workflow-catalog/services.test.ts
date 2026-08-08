import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { getWorkflowCatalogServices } from './services';

vi.mock('virtual:workflow-catalog-local', () => ({
  localWorkflowCatalog: [],
}));

describe('workflow catalog services', () => {
  it('memoizes services per namespace across route visits', () => {
    const namespaceWriteDisabled = () => false;
    const first = getWorkflowCatalogServices({
      namespace: 'one',
      namespaceWriteDisabled,
    });
    const again = getWorkflowCatalogServices({
      namespace: 'one',
      namespaceWriteDisabled,
    });
    const other = getWorkflowCatalogServices({
      namespace: 'two',
      namespaceWriteDisabled,
    });

    expect(again).toBe(first);
    expect(other).not.toBe(first);
    expect(other.sessionStore).not.toBe(first.sessionStore);
  });

  it('guards catalog sessions with active write and target namespace policy', () => {
    const source = readFileSync(
      resolve(
        'src/routes/(app)/namespaces/[namespace]/workflow-catalog/services.ts',
      ),
      'utf8',
    );

    expect(source).toContain('workflowCatalogStartAllowed');
    expect(source).toContain('page.data?.settings?.disableWriteActions');
    expect(source).toContain('startWorkflowDisabled?: boolean');
    expect(source).toContain('namespaceWriteDisabled');
    expect(source).toContain('resolveWorkflowCatalogForNamespace(namespace)');
  });
});
