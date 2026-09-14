import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  localCatalogSourceFiles,
  renderLocalCatalogAssemblies,
} from './local-assemblies';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('local catalog assemblies', () => {
  it('renders sorted registration and workflow barrels from authored examples', async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), 'local-catalog-'));
    directories.push(rootDirectory);
    const examplesDirectory = join(rootDirectory, 'catalog.local/examples');
    for (const exampleId of ['zeta', 'alpha']) {
      const directory = join(examplesDirectory, exampleId);
      await mkdir(directory, { recursive: true });
      await Promise.all([
        writeFile(
          join(directory, 'example.ts'),
          `export const catalogExample = { execution: { kind: 'workflow', workflowType: '${exampleId}Workflow' } };\n`,
        ),
        writeFile(
          join(directory, 'workflow.ts'),
          `export async function ${exampleId}Workflow() {}\n`,
        ),
      ]);
    }

    const rendered = await renderLocalCatalogAssemblies(rootDirectory);

    expect(rendered.registration).toContain('./examples/alpha/example.js');
    expect(rendered.workflows).toContain('./examples/zeta/workflow.js');
    expect(rendered.registration).toContain(
      'workflowExports: { ...workflows }',
    );
  });

  it('renders every support source while omitting standalone examples from workflow exports', async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), 'local-catalog-'));
    directories.push(rootDirectory);
    const examplesDirectory = join(rootDirectory, 'catalog.local/examples');
    const workflowDirectory = join(examplesDirectory, 'alpha-workflow');
    const standaloneDirectory = join(examplesDirectory, 'zeta-activity');
    await Promise.all([
      mkdir(workflowDirectory, { recursive: true }),
      mkdir(standaloneDirectory, { recursive: true }),
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
        join(standaloneDirectory, 'example.ts'),
        "export const catalogExample = { execution: { kind: 'standalone-activity' } };\n",
      ),
      writeFile(join(standaloneDirectory, 'activity.ts'), 'export {};\n'),
    ]);

    const rendered = await renderLocalCatalogAssemblies(rootDirectory);

    expect(rendered.registration).toContain(
      "'catalog.local/examples/alpha-workflow/activity.ts'",
    );
    expect(rendered.registration).toContain(
      "'catalog.local/examples/zeta-activity/activity.ts'",
    );
    expect(rendered.workflows).toContain(
      './examples/alpha-workflow/workflow.js',
    );
    expect(rendered.workflows).not.toContain('zeta-activity');
  });

  it('declares authored example files only', () => {
    const sourceFiles = localCatalogSourceFiles([
      {
        id: 'alpha',
        sourceFiles: [
          'catalog.local/examples/alpha/example.ts',
          'catalog.local/examples/alpha/workflow.ts',
        ],
      },
      {
        id: 'beta',
        sourceFiles: ['catalog.local/examples/alpha/example.ts'],
      },
    ]);

    expect(sourceFiles).toEqual([
      'catalog.local/examples/alpha/example.ts',
      'catalog.local/examples/alpha/workflow.ts',
    ]);
  });
});
