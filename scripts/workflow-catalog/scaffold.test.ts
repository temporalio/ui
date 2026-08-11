import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  scaffoldDirectoryWorkflowCatalog,
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

  it('shows authors the optional setup instructions field without rendering an empty card', async () => {
    const rootDirectory = await createTemporaryDirectory();

    await scaffoldDirectoryWorkflowCatalog({
      exampleId: 'order-lifecycle',
      rootDirectory,
    });

    const example = await readFile(
      join(
        rootDirectory,
        'workflow-catalog.local/examples/order-lifecycle/example.ts',
      ),
      'utf8',
    );

    expect(example).toContain('setupMarkdown');
    expect(example).toMatch(/\/\/\s*setupMarkdown:/);
    expect(example).not.toMatch(/^\s{2}setupMarkdown:/m);
  });
});
