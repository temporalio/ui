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

import {
  verifyCanonicalWorkflowCatalogAssemblies,
  writeCanonicalWorkflowCatalogAssemblies,
} from './canonical-assemblies';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('canonical workflow catalog assemblies', () => {
  it('generates deterministic index and workflow barrels from canonical example directories', async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), 'canonical-catalog-'));
    directories.push(rootDirectory);
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples/hello',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(exampleDirectory, 'example.ts'),
        "export const workflowCatalogExample = { execution: { kind: 'workflow', workflowType: 'hello' } };\n",
      ),
      writeFile(
        join(exampleDirectory, 'workflow.ts'),
        'export async function hello() {}\n',
      ),
    ]);

    await writeCanonicalWorkflowCatalogAssemblies(rootDirectory);

    await expect(
      readFile(
        join(
          rootDirectory,
          'src/lib/workflow-catalog/worker/examples/index.ts',
        ),
        'utf8',
      ),
    ).resolves.toContain('workflowCatalogExample as example0');
  });

  it('derives sorted recursive source files and exports workflows only for workflow examples', async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), 'canonical-catalog-'));
    directories.push(rootDirectory);
    const examplesDirectory = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples',
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
        "export const workflowCatalogExample = { execution: { kind: 'workflow', workflowType: 'alphaWorkflow' } };\n",
      ),
      writeFile(
        join(workflowDirectory, 'workflow.ts'),
        'export async function alphaWorkflow() {}\n',
      ),
      writeFile(join(workflowDirectory, 'activity.ts'), 'export {};\n'),
      writeFile(
        join(activityDirectory, 'example.ts'),
        "export const workflowCatalogExample = { execution: { kind: 'standalone-activity' } };\n",
      ),
      writeFile(join(activityDirectory, 'activity.ts'), 'export {};\n'),
    ]);

    await writeCanonicalWorkflowCatalogAssemblies(rootDirectory);

    const index = await readFile(join(examplesDirectory, 'index.ts'), 'utf8');
    const workflows = await readFile(
      join(examplesDirectory, '../workflows.ts'),
      'utf8',
    );
    expect(index).toContain(
      "'src/lib/workflow-catalog/worker/examples/alpha-workflow/activity.ts'",
    );
    expect(index.indexOf('alpha-workflow')).toBeLessThan(
      index.indexOf('zeta-activity'),
    );
    expect(workflows).toContain(
      "export { alphaWorkflow } from './examples/alpha-workflow/workflow.js';",
    );
    expect(workflows).not.toContain('zeta-activity');
  });

  it('requires every tracked example definition to export the canonical environment-neutral name', async () => {
    const examplesDirectory = join(
      process.cwd(),
      'src/lib/workflow-catalog/worker/examples',
    );
    const entries = await readdir(examplesDirectory, { withFileTypes: true });

    for (const entry of entries.filter((candidate) =>
      candidate.isDirectory(),
    )) {
      const source = await readFile(
        join(examplesDirectory, entry.name, 'example.ts'),
        'utf8',
      );
      expect(source).toContain('export const workflowCatalogExample');
      expect(source).not.toMatch(/\btargetId\s*:/);
      expect(source).not.toContain('SourceFiles');
    }
  });

  it('reports generated assembly drift without rewriting the stale file', async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), 'canonical-catalog-'));
    directories.push(rootDirectory);
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples/hello',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(exampleDirectory, 'example.ts'),
        "export const workflowCatalogExample = { execution: { kind: 'workflow', workflowType: 'hello' } };\n",
      ),
      writeFile(
        join(exampleDirectory, 'workflow.ts'),
        'export async function hello() {}\n',
      ),
    ]);
    await writeCanonicalWorkflowCatalogAssemblies(rootDirectory);
    const indexPath = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples/index.ts',
    );
    await writeFile(indexPath, 'stale\n');

    await expect(
      verifyCanonicalWorkflowCatalogAssemblies(rootDirectory),
    ).rejects.toThrow('run "pnpm workflow-catalog generate"');
    await expect(readFile(indexPath, 'utf8')).resolves.toBe('stale\n');
  });
});
