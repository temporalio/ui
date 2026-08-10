import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  scaffoldDirectoryWorkflowCatalog,
  scaffoldLocalWorkflowCatalog,
  scaffoldRegistrationModule,
  scaffoldWorkflowsModule,
  titleFor,
  validateExampleId,
  workflowNameFor,
} from './scaffold';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'workflow-catalog-new-'));
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

describe('workflow catalog scaffolding', () => {
  it('accepts dashed lowercase IDs and rejects everything else', () => {
    expect(() => validateExampleId('order-lifecycle')).not.toThrow();
    for (const invalid of [
      'Order',
      'order_lifecycle',
      '-order',
      'order-',
      'order--lifecycle',
      '1order',
      'o',
    ]) {
      expect(() => validateExampleId(invalid)).toThrow(
        'lowercase words separated by single dashes',
      );
    }
  });

  it('rejects IDs already taken by the shared catalog', () => {
    expect(() => validateExampleId('hello')).toThrow(
      'already exists in the shared catalog',
    );
    expect(() => validateExampleId('nexus-greeting')).toThrow(
      'already exists in the shared catalog',
    );
  });

  it('derives workflow names and titles from the example ID', () => {
    expect(workflowNameFor('order-lifecycle')).toBe('orderLifecycle');
    expect(workflowNameFor('ping')).toBe('ping');
    expect(titleFor('order-lifecycle')).toBe('Order lifecycle');
  });

  it('scaffolds a workspace that satisfies the local registration contract', async () => {
    const rootDirectory = await createTemporaryDirectory();

    const { registrationPath, workflowsPath } =
      await scaffoldLocalWorkflowCatalog({
        rootDirectory,
        exampleId: 'order-lifecycle',
      });

    expect(registrationPath).toBe(
      join(rootDirectory, 'workflow-catalog.local/registration.ts'),
    );
    expect(workflowsPath).toBe(
      join(rootDirectory, 'workflow-catalog.local/workflows.ts'),
    );

    const registration = scaffoldRegistrationModule('order-lifecycle');
    expect(registration).toContain("source: { id: 'local', label: 'Local' }");
    expect(registration).toContain("'workflow-catalog.local/registration.ts',");
    expect(registration).toContain("'workflow-catalog.local/workflows.ts',");
    expect(registration).toContain(
      "workflowsPath: new URL('./workflows.ts', import.meta.url).href",
    );
    expect(registration).toContain('workflowExports: { orderLifecycle }');
    expect(registration).toContain("id: 'order-lifecycle'");
    expect(registration).toContain("title: 'Order lifecycle'");
    expect(registration).toContain("workflowType: 'orderLifecycle'");

    const workflows = scaffoldWorkflowsModule('order-lifecycle');
    expect(workflows).toContain(
      'export async function orderLifecycle(message = ',
    );
    expect(workflows).toContain('proxyActivities');
  });

  it('refuses to overwrite an existing local workspace', async () => {
    const rootDirectory = await createTemporaryDirectory();
    await mkdir(join(rootDirectory, 'workflow-catalog.local'), {
      recursive: true,
    });
    await writeFile(
      join(rootDirectory, 'workflow-catalog.local/registration.ts'),
      'export {};\n',
    );

    await expect(
      scaffoldLocalWorkflowCatalog({
        rootDirectory,
        exampleId: 'order-lifecycle',
      }),
    ).rejects.toThrow('already exists; add the example to that file');
  });

  it('scaffolds an authored example directory and its local assemblies', async () => {
    const rootDirectory = await createTemporaryDirectory();

    await scaffoldDirectoryWorkflowCatalog({
      exampleId: 'order-lifecycle',
      rootDirectory,
    });

    await expect(
      readFile(
        join(
          rootDirectory,
          'workflow-catalog.local/examples/order-lifecycle/example.ts',
        ),
        'utf8',
      ),
    ).resolves.toContain('workflowCatalogExample');
    await expect(
      readFile(
        join(rootDirectory, 'workflow-catalog.local/registration.ts'),
        'utf8',
      ),
    ).resolves.toContain('./examples/order-lifecycle/example.js');
  });

  it('rejects a legacy flat overlay before creating an authored directory', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const localDirectory = join(rootDirectory, 'workflow-catalog.local');
    await mkdir(localDirectory, { recursive: true });
    await Promise.all([
      writeFile(join(localDirectory, 'registration.ts'), 'customized\n'),
      writeFile(join(localDirectory, 'workflows.ts'), 'customized\n'),
    ]);

    await expect(
      scaffoldDirectoryWorkflowCatalog({
        exampleId: 'order-lifecycle',
        rootDirectory,
      }),
    ).rejects.toThrow('migrate the legacy flat local overlay manually');
    await expect(
      access(join(localDirectory, 'examples/order-lifecycle')),
    ).rejects.toThrow();
  });
});
