import { describe, expect, it } from 'vitest';

import { createCatalogAuthoringStore } from './catalog-authoring-store';

const example = {
  id: 'payment-reminder',
  sourceFiles: [
    {
      content: 'export const workflow = true;\n',
      editable: true,
      mode: 0o644,
      path: 'workflow.ts',
    },
    {
      content: 'export const example = true;\n',
      editable: true,
      mode: 0o644,
      path: 'example.ts',
    },
    {
      content: '# Notes\n',
      editable: true,
      mode: 0o644,
      path: 'nested/notes.md',
    },
  ],
  sourceSnapshot: {
    baseRevision: 'revision-1',
    limits: {
      maxDepth: 8,
      maxFileBytes: 262144,
      maxFiles: 64,
      maxTotalBytes: 1048576,
    },
  },
} as const;

describe('catalog authoring store', () => {
  it('retains every returned file buffer while file selection changes', () => {
    const store = createCatalogAuthoringStore(example);

    store.editFile('workflow.ts', 'export const workflow = "changed";\n');
    store.selectFile('nested/notes.md');
    store.selectFile('workflow.ts');

    expect(store.getSnapshot()).toMatchObject({
      selectedPath: 'workflow.ts',
      files: [
        {
          path: 'workflow.ts',
          content: 'export const workflow = "changed";\n',
        },
        { path: 'example.ts', content: 'export const example = true;\n' },
        { path: 'nested/notes.md', content: '# Notes\n' },
      ],
    });
  });

  it('reports a browser-only edit as dirty until it matches the loaded file again', () => {
    const store = createCatalogAuthoringStore(example);

    store.editFile('workflow.ts', 'export const workflow = "changed";\n');
    expect(store.getSnapshot().dirty).toBe(true);

    store.editFile('workflow.ts', 'export const workflow = true;\n');
    expect(store.getSnapshot().dirty).toBe(false);
  });

  it('adds a supported file to the browser buffer with a server-defined default mode', () => {
    const store = createCatalogAuthoringStore(example);

    expect(store.addFile('notes.md')).toEqual({ status: 'added' });
    expect(store.getSnapshot()).toMatchObject({
      dirty: true,
      selectedPath: 'notes.md',
      files: expect.arrayContaining([
        {
          content: '',
          editable: true,
          mode: 0o644,
          path: 'notes.md',
        },
      ]),
    });
  });

  it('refuses a duplicate file with a plain reason and leaves the buffer unchanged', () => {
    const store = createCatalogAuthoringStore(example);

    expect(store.addFile('workflow.ts')).toEqual({
      status: 'refused',
      reason: 'A file named "workflow.ts" already exists.',
    });
    expect(store.getSnapshot()).toMatchObject({
      dirty: false,
      selectedPath: 'workflow.ts',
      files: example.sourceFiles,
    });
  });

  it('marks a loaded file for removal and restores it before Save', () => {
    const store = createCatalogAuthoringStore(example);

    store.removeFile('example.ts');
    expect(store.getSnapshot().dirty).toBe(true);
    expect(
      store.getSnapshot().files.find(({ path }) => path === 'example.ts'),
    ).toMatchObject({ path: 'example.ts', removed: true });

    store.restoreFile('example.ts');
    expect(store.getSnapshot()).toMatchObject({
      dirty: false,
      files: example.sourceFiles,
    });
  });

  it('keeps an independent edit dirty while another file is removed and restored', () => {
    const store = createCatalogAuthoringStore(example);
    store.editFile('workflow.ts', 'export const workflow = "changed";\n');
    store.removeFile('example.ts');

    store.restoreFile('example.ts');
    expect(store.getSnapshot().dirty).toBe(true);

    store.editFile('workflow.ts', 'export const workflow = true;\n');
    expect(store.getSnapshot().dirty).toBe(false);
  });

  it('starts one Save with the complete revision-bound fileset and no client modes', () => {
    const store = createCatalogAuthoringStore(example);
    store.editFile('workflow.ts', 'export const workflow = "changed";\n');
    store.removeFile('example.ts');

    expect(store.beginSave('save-1')).toEqual({
      status: 'started',
      request: {
        operationId: 'save-1',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-1',
        files: [
          {
            path: 'workflow.ts',
            content: 'export const workflow = "changed";\n',
          },
          {
            path: 'example.ts',
            content: 'export const example = true;\n',
            removed: true,
          },
          { path: 'nested/notes.md', content: '# Notes\n' },
        ],
      },
    });
    expect(store.beginSave('save-2')).toEqual({
      status: 'refused',
      reason: 'save-in-progress',
    });
  });

  it('retains ordered progress only from the current Save with increasing sequences', () => {
    const store = createCatalogAuthoringStore(example);
    store.beginSave('save-1');
    const check = (
      operationId: string,
      sequence: number,
      step: string,
      state: 'passed' | 'started' | 'not-reached',
    ) => ({
      kind: 'check' as const,
      operationId,
      sequence,
      step,
      severity: 'blocking' as const,
      state,
      reason: state === 'not-reached' ? 'An earlier check failed.' : 'Done.',
    });

    store.acceptSaveEvent(check('save-1', 1, 'write_files', 'passed'));
    store.acceptSaveEvent(check('older-save', 2, 'verify', 'started'));
    store.acceptSaveEvent(check('save-1', 2, 'verify', 'not-reached'));
    store.acceptSaveEvent(check('save-1', 2, 'verify', 'started'));

    expect(store.getSnapshot().progress).toEqual([
      check('save-1', 1, 'write_files', 'passed'),
      check('save-1', 2, 'verify', 'not-reached'),
    ]);
  });

  it('installs a durable Save as the new revision and clean edit baseline', () => {
    const store = createCatalogAuthoringStore(example);
    const savedContent = 'export const workflow = "saved";\n';
    store.editFile('workflow.ts', savedContent);
    store.removeFile('example.ts');
    store.beginSave('save-1');

    store.acceptSaveEvent({
      kind: 'terminal',
      operationId: 'save-1',
      sequence: 1,
      outcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: ['workflow.ts', 'example.ts'],
        generatedOutputs: [],
      },
      ownership: 'released',
      reload: 'publish',
    });

    expect(store.getSnapshot()).toMatchObject({
      baseRevision: 'revision-2',
      dirty: false,
      saving: false,
    });
    expect(store.getSnapshot().files.map(({ path }) => path)).toEqual([
      'workflow.ts',
      'nested/notes.md',
    ]);

    store.editFile('workflow.ts', 'export const workflow = "new edit";\n');
    expect(store.getSnapshot().dirty).toBe(true);
    store.editFile('workflow.ts', savedContent);
    expect(store.getSnapshot().dirty).toBe(false);
  });

  it('keeps edits made after Save submission dirty against the submitted baseline', () => {
    const store = createCatalogAuthoringStore(example);
    const submittedContent = 'export const workflow = "submitted";\n';
    const laterContent = 'export const workflow = "later browser edit";\n';
    store.editFile('workflow.ts', submittedContent);
    store.beginSave('save-1');
    store.editFile('workflow.ts', laterContent);

    store.acceptSaveEvent({
      kind: 'terminal',
      operationId: 'save-1',
      sequence: 1,
      outcome: {
        status: 'succeeded',
        commit: 'durable',
        exampleId: 'payment-reminder',
        baseRevision: 'revision-2',
        changedPaths: ['workflow.ts'],
        generatedOutputs: [],
      },
      ownership: 'released',
      reload: 'publish',
    });

    expect(store.getSnapshot()).toMatchObject({
      baseRevision: 'revision-2',
      dirty: true,
    });
    expect(
      store.getSnapshot().files.find(({ path }) => path === 'workflow.ts'),
    ).toMatchObject({ path: 'workflow.ts', content: laterContent });
    store.editFile('workflow.ts', submittedContent);
    expect(store.getSnapshot().dirty).toBe(false);
  });
});
