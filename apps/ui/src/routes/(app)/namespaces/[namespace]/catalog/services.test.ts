import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { getCatalogServices } from './services';

vi.mock('virtual:catalog-local', () => ({
  localCatalog: [],
}));

describe('catalog services', () => {
  it('memoizes services per namespace across route visits', () => {
    const namespaceWriteDisabled = () => false;
    const first = getCatalogServices({
      namespace: 'one',
      namespaceWriteDisabled,
    });
    const again = getCatalogServices({
      namespace: 'one',
      namespaceWriteDisabled,
    });
    const other = getCatalogServices({
      namespace: 'two',
      namespaceWriteDisabled,
    });

    expect(again).toBe(first);
    expect(other).not.toBe(first);
    expect(other.sessionStore).not.toBe(first.sessionStore);
  });

  it('guards catalog sessions with active write and target namespace policy', () => {
    const source = readFileSync(
      resolve('src/routes/(app)/namespaces/[namespace]/catalog/services.ts'),
      'utf8',
    );

    expect(source).toContain('catalogStartAllowed');
    expect(source).toContain('page.data?.settings?.disableWriteActions');
    expect(source).toContain('startWorkflowDisabled?: boolean');
    expect(source).toContain('namespaceWriteDisabled');
    expect(source).toContain('resolveCatalogForNamespace(namespace)');
  });
});
