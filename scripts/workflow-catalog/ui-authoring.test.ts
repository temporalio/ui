import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import { createUiWorkflowCatalogAuthoring } from './ui-authoring';

const temporaryDirectories: string[] = [];
const execFileAsync = promisify(execFile);

const createIsolatedCatalogRoot = async () => {
  const rootDirectory = await mkdtemp(
    join(process.cwd(), '.workflow-catalog-ui-authoring-'),
  );
  temporaryDirectories.push(rootDirectory);
  await Promise.all([
    cp(
      'src/lib/workflow-catalog',
      join(rootDirectory, 'src/lib/workflow-catalog'),
      { recursive: true },
    ),
    cp('package.json', join(rootDirectory, 'package.json')),
  ]);
  return rootDirectory;
};

const createIsolatedCatalogCliRoot = async () => {
  const rootDirectory = await mkdtemp(
    join(process.cwd(), '.workflow-catalog-ui-authoring-cli-'),
  );
  temporaryDirectories.push(rootDirectory);
  await Promise.all([
    cp(
      'scripts/workflow-catalog',
      join(rootDirectory, 'scripts/workflow-catalog'),
      { recursive: true },
    ),
    cp(
      'scripts/get-project-root.ts',
      join(rootDirectory, 'scripts/get-project-root.ts'),
    ),
    cp(
      'src/lib/workflow-catalog',
      join(rootDirectory, 'src/lib/workflow-catalog'),
      { recursive: true },
    ),
    cp('package.json', join(rootDirectory, 'package.json')),
  ]);
  return rootDirectory;
};

const runIsolatedCatalogCli = async (
  rootDirectory: string,
  ...arguments_: string[]
) =>
  execFileAsync(
    'pnpm',
    [
      'exec',
      'esno',
      join(rootDirectory, 'scripts/workflow-catalog/workflow-catalog-cli.ts'),
      ...arguments_,
    ],
    { cwd: rootDirectory },
  );

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('UI workflow catalog authoring adapter', () => {
  it('regenerates and verifies the canonical UI catalog', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiWorkflowCatalogAuthoring(rootDirectory);

    await authoring.generate();
    await expect(authoring.verify()).resolves.toBeUndefined();
  });

  it('scaffolds, promotes, and immediately verifies in an isolated catalog', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiWorkflowCatalogAuthoring(rootDirectory);

    await authoring.scaffold('promotion-regression');
    await expect(
      authoring.promote('promotion-regression'),
    ).resolves.toBeDefined();
    await expect(authoring.verify()).resolves.toBeUndefined();

    const indexPath = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples/index.ts',
    );
    await writeFile(indexPath, `${await readFile(indexPath, 'utf8')}\n`);
    await expect(authoring.verify()).rejects.toThrow(
      'has generated output drift',
    );
  });

  it('scaffolds, promotes, and demotes across fresh CLI processes', async () => {
    const rootDirectory = await createIsolatedCatalogCliRoot();

    await runIsolatedCatalogCli(rootDirectory, 'scaffold', 'round-trip');
    await runIsolatedCatalogCli(rootDirectory, 'promote', 'round-trip');
    await runIsolatedCatalogCli(rootDirectory, 'demote', 'round-trip');
    await runIsolatedCatalogCli(rootDirectory, 'verify');

    await expect(
      readFile(
        join(
          rootDirectory,
          'workflow-catalog.local/examples/round-trip/example.ts',
        ),
        'utf8',
      ),
    ).resolves.toContain("id: 'round-trip'");
    await expect(
      readFile(
        join(
          rootDirectory,
          'src/lib/workflow-catalog/worker/examples/round-trip/example.ts',
        ),
        'utf8',
      ),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(
        join(
          rootDirectory,
          'src/lib/workflow-catalog/browser/catalog.generated.json',
        ),
        'utf8',
      ),
    ).resolves.not.toContain('"id": "round-trip"');
    await expect(
      readFile(
        join(rootDirectory, 'workflow-catalog.local/catalog.generated.json'),
        'utf8',
      ),
    ).resolves.toContain('"id": "round-trip"');
    await expect(
      readFile(join(rootDirectory, '.workflow-catalog.lock'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(join(rootDirectory, '.workflow-catalog.journal.json'), 'utf8'),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  }, 30_000);

  it('demotes a canonical example into the ignored local catalog and immediately verifies', async () => {
    const rootDirectory = await createIsolatedCatalogRoot();
    const authoring = createUiWorkflowCatalogAuthoring(rootDirectory);
    const exampleDirectory = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples/demotion-regression',
    );
    await mkdir(exampleDirectory, { recursive: true });
    await writeFile(
      join(exampleDirectory, 'workflow.ts'),
      "export const demotionRegression = () => 'demoted';\n",
    );
    await writeFile(
      join(exampleDirectory, 'example.ts'),
      `import { demotionRegression } from './workflow.js';

export const workflowCatalogExample = {
  id: 'demotion-regression',
  title: 'Demotion regression',
  description: 'Exercises the demotion transaction.',
  capabilityTags: ['terminal-outcome'],
  expectedEvidence: ['A completed workflow result.'],
  input: { defaultValue: [], schema: { type: 'array' } },
  startOptions: { defaultValue: {}, schema: { type: 'object' } },
  execution: {
    kind: 'workflow' as const,
    workflowType: 'demotionRegression',
    workflow: demotionRegression,
    activities: {},
  },
};
`,
    );

    await expect(
      authoring.demote('demotion-regression'),
    ).resolves.toBeDefined();
    await expect(authoring.verify()).resolves.toBeUndefined();

    await expect(
      readFile(
        join(
          rootDirectory,
          'workflow-catalog.local/examples/demotion-regression/example.ts',
        ),
        'utf8',
      ),
    ).resolves.toContain("id: 'demotion-regression'");
    await expect(
      readFile(
        join(
          rootDirectory,
          'src/lib/workflow-catalog/worker/examples/demotion-regression/example.ts',
        ),
        'utf8',
      ),
    ).rejects.toMatchObject({ code: 'ENOENT' });
    await expect(
      readFile(
        join(rootDirectory, 'workflow-catalog.local/registration.ts'),
        'utf8',
      ),
    ).resolves.toContain("from './examples/demotion-regression/example.js'");
    await expect(
      readFile(
        join(
          rootDirectory,
          'src/lib/workflow-catalog/browser/catalog.generated.json',
        ),
        'utf8',
      ),
    ).resolves.not.toContain('"id": "demotion-regression"');
  });
});
