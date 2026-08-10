import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  executeDirectoryWorkflowCatalogPromotion,
  planDirectoryWorkflowCatalogPromotion,
} from './directory-promotion';

const temporaryDirectories: string[] = [];

const createTemporaryDirectory = async () => {
  const directory = await mkdtemp(
    join(tmpdir(), 'workflow-catalog-directory-'),
  );
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

describe('directory workflow catalog promotion', () => {
  it('plans the exact directory move and regeneration without creating staging files', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourceDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    await mkdir(sourceDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(sourceDirectory, 'example.ts'),
        "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(sourceDirectory, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
    ]);

    await expect(
      planDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory,
      }),
    ).resolves.toEqual({
      operations: [
        {
          from: 'workflow-catalog.local/examples/order-lifecycle',
          kind: 'move-directory',
          to: 'src/lib/workflow-catalog/worker/examples/order-lifecycle',
        },
        { kind: 'generate' },
        { kind: 'verify' },
      ],
    });
  });

  it('rolls back the directory move when post-move verification fails', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourceDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    await mkdir(sourceDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(sourceDirectory, 'example.ts'),
        "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(sourceDirectory, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
    ]);
    const calls: string[] = [];

    await expect(
      executeDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        generate: async () => calls.push('generate'),
        rootDirectory,
        verify: async () => {
          calls.push('verify');
          throw new Error('verify failed');
        },
      }),
    ).rejects.toThrow('verify failed');

    await expect(
      Promise.all([
        readFile(join(sourceDirectory, 'example.ts'), 'utf8'),
        readFile(
          join(
            rootDirectory,
            'src/lib/workflow-catalog/worker/examples/order-lifecycle/example.ts',
          ),
          'utf8',
        ),
      ]),
    ).rejects.toThrow();
    expect(calls).toEqual(['generate', 'verify']);
  });

  it('moves authored sources byte-for-byte, generates, verifies, and reports changed paths', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourceDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    await mkdir(sourceDirectory, { recursive: true });
    const exampleSource =
      "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n";
    const workflowSource =
      'export async function orderLifecycle() { return "ok"; }\n';
    await Promise.all([
      writeFile(join(sourceDirectory, 'example.ts'), exampleSource),
      writeFile(join(sourceDirectory, 'workflow.ts'), workflowSource),
    ]);
    const calls: string[] = [];
    const generatedIndexPath = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples/index.ts',
    );
    const generatedCatalogPath = join(
      rootDirectory,
      'src/lib/workflow-catalog/browser/catalog.generated.json',
    );

    await expect(
      executeDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        generate: async () => {
          calls.push('generate');
          await mkdir(join(rootDirectory, 'src/lib/workflow-catalog/browser'), {
            recursive: true,
          });
          await Promise.all([
            writeFile(generatedIndexPath, 'generated index\n'),
            writeFile(generatedCatalogPath, 'generated catalog\n'),
          ]);
        },
        rootDirectory,
        verify: async () => calls.push('verify'),
      }),
    ).resolves.toEqual({
      changedPaths: [
        'workflow-catalog.local/examples/order-lifecycle',
        'src/lib/workflow-catalog/worker/examples/order-lifecycle',
        'src/lib/workflow-catalog/worker/examples/index.ts',
        'src/lib/workflow-catalog/browser/catalog.generated.json',
      ],
    });

    const destinationDirectory = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples/order-lifecycle',
    );
    await expect(
      Promise.all([
        readFile(join(destinationDirectory, 'example.ts'), 'utf8'),
        readFile(join(destinationDirectory, 'workflow.ts'), 'utf8'),
      ]),
    ).resolves.toEqual([exampleSource, workflowSource]);
    await expect(access(sourceDirectory)).rejects.toThrow();
    await expect(
      access(join(rootDirectory, '.workflow-catalog.lock')),
    ).rejects.toThrow();
    expect(calls).toEqual(['generate', 'verify']);
  });

  it('restores generated artifacts and authored sources when a later stage fails', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourceDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    const sharedDirectory = join(
      rootDirectory,
      'src/lib/workflow-catalog/worker/examples',
    );
    const browserDirectory = join(
      rootDirectory,
      'src/lib/workflow-catalog/browser',
    );
    await Promise.all([
      mkdir(sourceDirectory, { recursive: true }),
      mkdir(sharedDirectory, { recursive: true }),
      mkdir(browserDirectory, { recursive: true }),
    ]);
    const exampleSource =
      "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n";
    const indexPath = join(sharedDirectory, 'index.ts');
    const artifactPath = join(browserDirectory, 'catalog.generated.json');
    await Promise.all([
      writeFile(join(sourceDirectory, 'example.ts'), exampleSource),
      writeFile(
        join(sourceDirectory, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
      writeFile(indexPath, 'original index\n'),
      writeFile(artifactPath, 'original artifact\n'),
    ]);

    await expect(
      executeDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        generate: async () => {
          await Promise.all([
            writeFile(indexPath, 'generated index\n'),
            writeFile(artifactPath, 'generated artifact\n'),
          ]);
        },
        rootDirectory,
        verify: async () => {
          throw new Error('verify failed');
        },
      }),
    ).rejects.toThrow('verify failed');

    await expect(
      Promise.all([
        readFile(join(sourceDirectory, 'example.ts'), 'utf8'),
        readFile(indexPath, 'utf8'),
        readFile(artifactPath, 'utf8'),
      ]),
    ).resolves.toEqual([
      exampleSource,
      'original index\n',
      'original artifact\n',
    ]);
  });

  it('rejects mismatched IDs, escaping imports, and links before mutation', async () => {
    const cases = [
      {
        example:
          "export const workflowCatalogExample = { id: 'different-id', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'does not match promotion ID',
      },
      {
        example:
          "import '../outside.js';\nexport const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'must stay within its example directory',
      },
      {
        example:
          "void import(/* load support */ '../outside.js');\nexport const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'must stay within its example directory',
      },
      {
        example:
          "void import(`../outside.js`);\nexport const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'must stay within its example directory',
      },
      {
        example:
          "export const workflowCatalogExample = { id: 'order-lifecycle', targetId: 'local-workflows', sourceFiles: ['local.ts'], execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
        expected: 'must be environment-neutral',
      },
      {
        example:
          "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'missingWorkflow' } };\n",
        expected: 'does not export workflow "missingWorkflow"',
      },
    ];

    for (const testCase of cases) {
      const rootDirectory = await createTemporaryDirectory();
      const sourceDirectory = join(
        rootDirectory,
        'workflow-catalog.local/examples/order-lifecycle',
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
        planDirectoryWorkflowCatalogPromotion({
          exampleId: 'order-lifecycle',
          rootDirectory,
        }),
      ).rejects.toThrow(testCase.expected);
      await expect(access(sourceDirectory)).resolves.toBeUndefined();
    }

    const linkedRoot = await createTemporaryDirectory();
    const linkedSource = join(
      linkedRoot,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    await mkdir(linkedSource, { recursive: true });
    await Promise.all([
      writeFile(
        join(linkedSource, 'example.ts'),
        "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(linkedSource, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
      symlink(join(linkedRoot, 'outside.ts'), join(linkedSource, 'linked.ts')),
    ]);

    await expect(
      planDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory: linkedRoot,
      }),
    ).rejects.toThrow('regular files');
    await expect(access(linkedSource)).resolves.toBeUndefined();

    const linkedDirectoryRoot = await createTemporaryDirectory();
    const realDirectory = join(linkedDirectoryRoot, 'real-example');
    const linkedDirectory = join(
      linkedDirectoryRoot,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    await mkdir(realDirectory, { recursive: true });
    await mkdir(join(linkedDirectoryRoot, 'workflow-catalog.local/examples'), {
      recursive: true,
    });
    await Promise.all([
      writeFile(
        join(realDirectory, 'example.ts'),
        "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(realDirectory, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
    ]);
    await symlink(realDirectory, linkedDirectory);

    await expect(
      planDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory: linkedDirectoryRoot,
      }),
    ).rejects.toThrow('must be a real directory');

    const conflictingRoot = await createTemporaryDirectory();
    const conflictingSource = join(
      conflictingRoot,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    const existingShared = join(
      conflictingRoot,
      'src/lib/workflow-catalog/worker/examples/existing',
    );
    await Promise.all([
      mkdir(conflictingSource, { recursive: true }),
      mkdir(existingShared, { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(conflictingSource, 'example.ts'),
        "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(conflictingSource, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
      writeFile(
        join(existingShared, 'example.ts'),
        "export const workflowCatalogExample = { id: 'existing', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
    ]);

    await expect(
      planDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory: conflictingRoot,
      }),
    ).rejects.toThrow('already declares workflow "orderLifecycle"');
    await expect(access(conflictingSource)).resolves.toBeUndefined();

    const danglingDestinationRoot = await createTemporaryDirectory();
    const danglingDestinationSource = join(
      danglingDestinationRoot,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    const danglingDestination = join(
      danglingDestinationRoot,
      'src/lib/workflow-catalog/worker/examples/order-lifecycle',
    );
    await Promise.all([
      mkdir(danglingDestinationSource, { recursive: true }),
      mkdir(join(danglingDestination, '..'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(
        join(danglingDestinationSource, 'example.ts'),
        "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
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
      planDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        rootDirectory: danglingDestinationRoot,
      }),
    ).rejects.toThrow('Promotion destination already exists');
  });

  it('refuses a concurrent mutation without moving or generating', async () => {
    const rootDirectory = await createTemporaryDirectory();
    const sourceDirectory = join(
      rootDirectory,
      'workflow-catalog.local/examples/order-lifecycle',
    );
    await mkdir(sourceDirectory, { recursive: true });
    await Promise.all([
      writeFile(
        join(sourceDirectory, 'example.ts'),
        "export const workflowCatalogExample = { id: 'order-lifecycle', execution: { kind: 'workflow', workflowType: 'orderLifecycle' } };\n",
      ),
      writeFile(
        join(sourceDirectory, 'workflow.ts'),
        'export async function orderLifecycle() {}\n',
      ),
      writeFile(join(rootDirectory, '.workflow-catalog.lock'), 'busy\n'),
    ]);
    let generated = false;

    await expect(
      executeDirectoryWorkflowCatalogPromotion({
        exampleId: 'order-lifecycle',
        generate: async () => {
          generated = true;
        },
        rootDirectory,
        verify: async () => undefined,
      }),
    ).rejects.toThrow('already in progress');
    expect(generated).toBe(false);
    await expect(access(sourceDirectory)).resolves.toBeUndefined();
  });
});
