import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { createUiWorkflowCatalogAuthoring } from './ui-authoring';

describe('UI workflow catalog authoring adapter', () => {
  it('regenerates and verifies the canonical UI catalog without changing bytes', async () => {
    const generatedPaths = [
      'src/lib/workflow-catalog/worker/examples/index.ts',
      'src/lib/workflow-catalog/worker/workflows.ts',
      'src/lib/workflow-catalog/browser/catalog.generated.json',
      'src/lib/workflow-catalog/browser/catalog.generated.ts',
    ];
    const before = await Promise.all(
      generatedPaths.map((path) => readFile(path, 'utf8')),
    );
    const authoring = createUiWorkflowCatalogAuthoring();

    await authoring.generate();
    await expect(authoring.verify()).resolves.toBeUndefined();
    await expect(
      Promise.all(generatedPaths.map((path) => readFile(path, 'utf8'))),
    ).resolves.toEqual(before);
  });
});
