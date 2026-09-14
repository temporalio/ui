import {
  access,
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  parseCatalogTypeScriptModuleSpecifiers,
  planDirectoryCatalogPromotion,
} from './directory-promotion';

const directories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'directory-catalog-'));
  directories.push(directory);
  return directory;
};

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('directory catalog promotion planning', () => {
  it('plans the authored directory move followed by generation and verification', async () => {
    const rootDirectory = await mkdtemp(join(tmpdir(), 'directory-catalog-'));
    directories.push(rootDirectory);
    const directory = join(
      rootDirectory,
      'catalog.local/examples/order-lifecycle',
    );
    await mkdir(directory, { recursive: true });
    await Promise.all([
      writeFile(
        join(directory, 'example.ts'),
        "export const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(directory, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
    ]);

    await expect(
      planDirectoryCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory,
      }),
    ).resolves.toEqual({
      operations: [
        {
          from: 'catalog.local/examples/order-lifecycle',
          kind: 'move-directory',
          to: 'src/lib/catalog/worker/examples/order-lifecycle',
        },
        { kind: 'generate' },
        { kind: 'verify' },
      ],
    });
  });

  it('collects static module specifiers and rejects computed loading', () => {
    expect(
      parseCatalogTypeScriptModuleSpecifiers({
        filePath: 'example.ts',
        source: "import './activity.js'; export { value } from './value.js';",
      }),
    ).toEqual(['./activity.js', './value.js']);
    expect(() =>
      parseCatalogTypeScriptModuleSpecifiers({
        filePath: 'example.ts',
        source: 'import(path);',
      }),
    ).toThrow('module loading must use a string literal');
  });

  it('rejects mismatched IDs, escaping imports, and links', async () => {
    const cases = [
      {
        example:
          "export const catalogExample = { id: 'different-id', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'does not match promotion ID',
      },
      {
        example:
          "import '../outside.js';\nexport const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'must stay within its example directory',
      },
      {
        example:
          "void import(/* load support */ '../outside.js');\nexport const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'must stay within its example directory',
      },
      {
        example:
          "void import(`../outside.js`);\nexport const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'module loading must use a string literal',
      },
      {
        example:
          "export const catalogExample = { id: 'order-lifecycle', targetId: 'local-workflows', sourceFiles: ['local.ts'], execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'must be environment-neutral',
      },
      {
        example:
          "export const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'missingWorkflow' } };\n",
        expected: 'does not export workflow "missingWorkflow"',
      },
    ];

    for (const testCase of cases) {
      const rootDirectory = await createTemporaryDirectory();
      const sourceDirectory = join(
        rootDirectory,
        'catalog.local/examples/order-lifecycle',
      );
      await mkdir(sourceDirectory, { recursive: true });
      await Promise.all([
        writeFile(join(sourceDirectory, 'example.ts'), testCase.example),
        writeFile(
          join(sourceDirectory, 'workflow.ts'),
          'export async function orderLifecycle() {}\n',
        ),
      ]);

      await expect(
        planDirectoryCatalogPromotion({
          exampleId: 'order-lifecycle',
          rootDirectory,
        }),
      ).rejects.toThrow(testCase.expected);
      await expect(access(sourceDirectory)).resolves.toBeUndefined();
    }

    const linkedRoot = await createTemporaryDirectory();
    const linkedSource = join(
      linkedRoot,
      'catalog.local/examples/order-lifecycle',
    );
    await mkdir(linkedSource, { recursive: true });
    await Promise.all([
      writeFile(
        join(linkedSource, 'example.ts'),
        "export const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(linkedSource, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
      symlink(join(linkedRoot, 'outside.ts'), join(linkedSource, 'linked.ts')),
    ]);

    await expect(
      planDirectoryCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory: linkedRoot,
      }),
    ).rejects.toThrow('regular files');
    await expect(access(linkedSource)).resolves.toBeUndefined();

    const linkedDirectoryRoot = await createTemporaryDirectory();
    const realDirectory = join(linkedDirectoryRoot, 'real-example');
    const linkedDirectory = join(
      linkedDirectoryRoot,
      'catalog.local/examples/order-lifecycle',
    );
    await Promise.all([
      mkdir(realDirectory, { recursive: true }),
      mkdir(join(linkedDirectoryRoot, 'catalog.local/examples'), {
        recursive: true,
      }),
    ]);
    await Promise.all([
      writeFile(
        join(realDirectory, 'example.ts'),
        "export const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(realDirectory, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
    ]);
    await symlink(realDirectory, linkedDirectory);

    await expect(
      planDirectoryCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory: linkedDirectoryRoot,
      }),
    ).rejects.toThrow('must be a real directory');

    const conflictingRoot = await createTemporaryDirectory();
    const conflictingSource = join(
      conflictingRoot,
      'catalog.local/examples/order-lifecycle',
    );
    const existingShared = join(
      conflictingRoot,
      'src/lib/catalog/worker/examples/existing',
    );
    await Promise.all([
      mkdir(conflictingSource, { recursive: true }),
      mkdir(existingShared, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(conflictingSource, 'example.ts'),
        "export const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(conflictingSource, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
      writeFile(
        join(existingShared, 'example.ts'),
        "export const catalogExample = { id: 'existing', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
    ]);

    await expect(
      planDirectoryCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory: conflictingRoot,
      }),
    ).rejects.toThrow('already declares workflow "orderLifecycle"');
    await expect(access(conflictingSource)).resolves.toBeUndefined();

    const danglingDestinationRoot = await createTemporaryDirectory();
    const danglingDestinationSource = join(
      danglingDestinationRoot,
      'catalog.local/examples/order-lifecycle',
    );
    const danglingDestination = join(
      danglingDestinationRoot,
      'src/lib/catalog/worker/examples/order-lifecycle',
    );
    await Promise.all([
      mkdir(danglingDestinationSource, { recursive: true }),
      mkdir(join(danglingDestination, '..'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(danglingDestinationSource, 'example.ts'),
        "export const catalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(danglingDestinationSource, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
      symlink(
        join(danglingDestinationRoot, 'missing-destination'),
        danglingDestination,
      ),
    ]);

    await expect(
      planDirectoryCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory: danglingDestinationRoot,
      }),
    ).rejects.toThrow('Promotion destination already exists');
  });
});
