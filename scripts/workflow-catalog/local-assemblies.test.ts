import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  verifyLocalWorkflowCatalogAssemblies,
  writeLocalWorkflowCatalogAssemblies,
} from './local-assemblies';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'workflow-catalog-assembly-'));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('local workflow catalog assemblies', () => {
  it('writes sorted explicit local registration and workflow barrels from example directories', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const examplesDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples',
    );
    for (const exampleId of ['zeta', 'alpha']) {
      const directory = join(examplesDirectory, exampleId);
      await mkdir(directory, { recursive: true });
      await Promise.all([
        writeFile(
          join(directory, 'example.ts'),
          `export const workflowCatalogExample = { execution: { kind: 'workflow', workflowType: '${exampleId}Workflow' } };\n`,
        ),
        writeFile(
          join(directory, 'workflow.ts'),
          `export async function ${exampleId}Workflow() {}\n`,
        ),
      ]);
    }

    await writeLocalWorkflowCatalogAssemblies(rootDirectory);

    await expect(
      readFile(
        join(rootDirectory, 'workflow-catalog.local/registration.ts'),
        'utf8',
      ),
    ).resolves.toContain('./examples/alpha/example.js');
    await expect(
      readFile(
        join(rootDirectory, 'workflow-catalog.local/workflows.ts'),
        'utf8',
      ),
    ).resolves.toContain('./examples/zeta/workflow.js');
  });

  it('refuses to overwrite an existing non-generated flat local overlay', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const examplesDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples/alpha',
    );
    await mkdir(examplesDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(examplesDirectory, 'example.ts'),
        "export const workflowCatalogExample = { execution: { kind: 'workflow', workflowType: 'alphaWorkflow' } };\n",
      ),
      writeFile(
        join(examplesDirectory, 'workflow.ts'),
        'export async function alphaWorkflow() {}\n',
      ),
      writeFile(
        join(rootDirectory, 'workflow-catalog.local/registration.ts'),
        'export const customizedRegistration = true;\n',
      ),
      writeFile(
        join(rootDirectory, 'workflow-catalog.local/workflows.ts'),
        'export const customizedWorkflow = true;\n',
      ),
    ]);

    await expect(
      writeLocalWorkflowCatalogAssemblies(rootDirectory),
    ).rejects.toThrow('migrate the legacy flat local overlay manually');
  });

  it('derives every support source and omits workflow exports for standalone examples', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const examplesDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples',
    );
    const workflowDirectory = join(examplesDirectory, 'alpha-workflow');
    const standaloneDirectory = join(examplesDirectory, 'zeta-activity');
    await Promise.all([
      mkdir(workflowDirectory, { recursive: true }),
      mkdir(standaloneDirectory, { recursive: true }),
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
        join(standaloneDirectory, 'example.ts'),
        "export const workflowCatalogExample = { execution: { kind: 'standalone-activity' } };\n",
      ),
      writeFile(join(standaloneDirectory, 'activity.ts'), 'export {};\n'),
    ]);

    await writeLocalWorkflowCatalogAssemblies(rootDirectory);

    const registration = await readFile(
      join(rootDirectory, 'workflow-catalog.local/registration.ts'),
      'utf8',
    );
    const workflows = await readFile(
      join(rootDirectory, 'workflow-catalog.local/workflows.ts'),
      'utf8',
    );
    expect(registration).toContain(
      "'workflow-catalog.local/examples/alpha-workflow/activity.ts'",
    );
    expect(registration).toContain(
      "'workflow-catalog.local/examples/zeta-activity/activity.ts'",
    );
    expect(workflows).toContain('./examples/alpha-workflow/workflow.js');
    expect(workflows).not.toContain('zeta-activity');
  });

  it('removes generated local outputs after the last authored example leaves', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const exampleDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples/alpha-workflow',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(exampleDirectory, 'example.ts'),
        "export const workflowCatalogExample = { execution: { kind: 'workflow', workflowType: 'alphaWorkflow' } };\n",
      ),
      writeFile(
        join(exampleDirectory, 'workflow.ts'),
        'export async function alphaWorkflow() {}\n',
      ),
    ]);
    await writeLocalWorkflowCatalogAssemblies(rootDirectory);
    const localDirectory = join(rootDirectory, 'workflow-catalog.local');
    await Promise.all([
      rm(exampleDirectory, { recursive: true }),
      writeFile(join(localDirectory, 'catalog.generated.json'), '{}\n'),
    ]);

    await writeLocalWorkflowCatalogAssemblies(rootDirectory);

    await expect(
      Promise.all([
        readFile(join(localDirectory, 'registration.ts'), 'utf8'),
        readFile(join(localDirectory, 'workflows.ts'), 'utf8'),
        readFile(join(localDirectory, 'catalog.generated.json'), 'utf8'),
      ]),
    ).rejects.toThrow();
  });

  it('reports stale generated local outputs when no authored examples remain', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const localDirectory = join(rootDirectory, 'workflow-catalog.local');
    await mkdir(localDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(localDirectory, 'registration.ts'),
        '// GENERATED FILE. DO NOT EDIT.\nstale\n',
      ),
      writeFile(
        join(localDirectory, 'workflows.ts'),
        '// GENERATED FILE. DO NOT EDIT.\nstale\n',
      ),
    ]);

    await expect(
      verifyLocalWorkflowCatalogAssemblies(rootDirectory),
    ).rejects.toThrow('run "pnpm workflow-catalog generate"');

    const artifactOnlyRoot = await createTemporaryDirectory();
    const artifactOnlyDirectory = join(
      artifactOnlyRoot,
      'workflow-catalog.local',
    );
    await mkdir(artifactOnlyDirectory, { recursive: true });
    await writeFile(
      join(artifactOnlyDirectory, 'catalog.generated.json'),
      '{}\n',
    );

    await expect(
      verifyLocalWorkflowCatalogAssemblies(artifactOnlyRoot),
    ).rejects.toThrow('run "pnpm workflow-catalog generate"');
  });
});
