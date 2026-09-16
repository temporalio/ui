import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { renderCanonicalCatalogAssemblies } from './canonical-assemblies';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('canonical catalog assemblies', () => {
  it('renders deterministic index and workflow barrels from canonical examples', async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), 'canonical-catalog-'));
    directories.push(rootDirectory);
    const examplesDirectory = join(
      rootDirectory,
      'src/lib/catalog/worker/examples',
    );
    const workflowDirectory = join(examplesDirectory, 'alpha-workflow');
    const activityDirectory = join(examplesDirectory, 'zeta-activity');
    await Promise.all([
      mkdir(workflowDirectory, { recursive: true }),
      mkdir(activityDirectory, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(workflowDirectory, 'example.ts'),
        "export const catalogExample = { execution: { kind: 'workflow', workflowType: 'alphaWorkflow' } };\n",
      ),
      writeFile(
        join(workflowDirectory, 'workflow.ts'),
        'export async function alphaWorkflow() {}\n',
      ),
      writeFile(join(workflowDirectory, 'activity.ts'), 'export {};\n'),
      writeFile(
        join(activityDirectory, 'example.ts'),
        "export const catalogExample = { execution: { kind: 'standalone-activity' } };\n",
      ),
      writeFile(join(activityDirectory, 'activity.ts'), 'export {};\n'),
    ]);

    const assemblies = await renderCanonicalCatalogAssemblies(rootDirectory);
    const index = assemblies.find(({ path }) =>
      path.endsWith('/index.ts'),
    )?.content;
    const workflows = assemblies.find(({ path }) =>
      path.endsWith('/workflows.ts'),
    )?.content;

    expect(index).toContain('catalogExample as example0');
    expect(index).toContain(
      "'src/lib/catalog/worker/examples/alpha-workflow/activity.ts'",
    );
    expect(index?.indexOf('alpha-workflow')).toBeLessThan(
      index?.indexOf('zeta-activity') ?? Infinity,
    );
    expect(workflows).toContain(
      "export { alphaWorkflow } from './examples/alpha-workflow/workflow.js';",
    );
    expect(workflows).not.toContain('zeta-activity');
    expect(index).not.toContain('sharedWorkflowCorpusInventory');
  });

  it('requires every tracked example definition to use the canonical environment-neutral shape', async () => {
    const examplesDirectory = join(
      process.cwd(),
      'src/lib/catalog/worker/examples',
    );
    const entries = await readdir(examplesDirectory, { withFileTypes: true });

    for (const entry of entries.filter((candidate) =>
      candidate.isDirectory(),
    )) {
      const source = await readFile(
        join(examplesDirectory, entry.name, 'example.ts'),
        'utf8',
      );
      expect(source).toContain('export const catalogExample');
      expect(source).not.toMatch(/\btargetId\s*:/);
      expect(source).not.toContain('SourceFiles');
    }
  });
});
