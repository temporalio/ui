import { get, type Readable, writable } from 'svelte/store';

import type {
  CatalogAuthoringExample,
  CatalogAuthoringFile,
  CatalogSaveEvent,
  CatalogSaveProgressEvent,
  CatalogSaveRequest,
  CatalogSaveTerminalEvent,
} from './catalog-authoring-host';

export type CatalogAuthoringState = {
  baseRevision: string;
  dirty: boolean;
  exampleId: string;
  files: CatalogAuthoringFile[];
  lastSequence: number;
  operationId?: string;
  progress: CatalogSaveProgressEvent[];
  saving: boolean;
  selectedPath: string;
  terminal?: CatalogSaveTerminalEvent;
};

export type CatalogAuthoringStore = Readable<CatalogAuthoringState> & {
  addFile: (
    path: string,
  ) => { status: 'added' } | { status: 'refused'; reason: string };
  beginSave: (
    operationId: string,
  ) =>
    | { status: 'started'; request: CatalogSaveRequest }
    | { status: 'refused'; reason: 'save-in-progress' };
  acceptSaveEvent: (event: CatalogSaveEvent) => void;
  editFile: (path: string, content: string) => void;
  getSnapshot: () => CatalogAuthoringState;
  removeFile: (path: string) => void;
  restoreFile: (path: string) => void;
  selectFile: (path: string) => void;
};

const cloneFile = (file: CatalogAuthoringFile): CatalogAuthoringFile => ({
  ...file,
});

const filesMatch = (left: CatalogAuthoringFile, right: CatalogAuthoringFile) =>
  left.path === right.path &&
  left.content === right.content &&
  left.removed === right.removed;

const filesDiffer = (
  files: readonly CatalogAuthoringFile[],
  baseline: readonly CatalogAuthoringFile[],
) =>
  files.length !== baseline.length ||
  files.some((file, index) => {
    const loaded = baseline[index];
    return (
      !loaded ||
      file.path !== loaded.path ||
      file.content !== loaded.content ||
      file.removed !== loaded.removed
    );
  });

export const createCatalogAuthoringStore = (
  example: CatalogAuthoringExample,
): CatalogAuthoringStore => {
  let baselineFiles = example.sourceFiles.map(cloneFile);
  let submittedFiles: CatalogAuthoringFile[] | undefined;
  const state = writable<CatalogAuthoringState>({
    baseRevision: example.sourceSnapshot.baseRevision,
    dirty: false,
    exampleId: example.id,
    files: example.sourceFiles.map(cloneFile),
    lastSequence: 0,
    progress: [],
    saving: false,
    selectedPath: example.sourceFiles[0]?.path ?? '',
  });

  return {
    subscribe: state.subscribe,
    acceptSaveEvent: (event) =>
      state.update((current) => {
        if (
          event.operationId !== current.operationId ||
          event.sequence <= current.lastSequence
        ) {
          return current;
        }
        if (event.kind === 'terminal' && event.outcome.status === 'succeeded') {
          const submitted = submittedFiles ?? current.files;
          baselineFiles = submitted
            .filter(({ removed }) => !removed)
            .map(cloneFile);
          const files = current.files.flatMap((file) => {
            const submittedFile = submitted.find(
              ({ path }) => path === file.path,
            );
            if (submittedFile?.removed && filesMatch(file, submittedFile)) {
              return [];
            }
            return [cloneFile(file)];
          });
          submittedFiles = undefined;
          return {
            ...current,
            baseRevision: event.outcome.baseRevision,
            dirty: filesDiffer(files, baselineFiles),
            files,
            lastSequence: event.sequence,
            saving: false,
            selectedPath: files.some(
              ({ path }) => path === current.selectedPath,
            )
              ? current.selectedPath
              : (files[0]?.path ?? ''),
            terminal: event,
          };
        }
        if (event.kind === 'terminal') submittedFiles = undefined;
        return {
          ...current,
          lastSequence: event.sequence,
          progress:
            event.kind === 'check'
              ? [...current.progress, event]
              : current.progress,
          saving: event.kind === 'terminal' ? false : current.saving,
          terminal: event.kind === 'terminal' ? event : current.terminal,
        };
      }),
    addFile: (path) => {
      if (get(state).files.some((file) => file.path === path)) {
        return {
          status: 'refused',
          reason: `A file named "${path}" already exists.`,
        };
      }
      state.update((current) => ({
        ...current,
        dirty: true,
        files: [
          ...current.files,
          { content: '', editable: true, mode: 0o644, path },
        ],
        selectedPath: path,
      }));
      return { status: 'added' };
    },
    beginSave: (operationId) => {
      const current = get(state);
      if (current.saving) {
        return { status: 'refused', reason: 'save-in-progress' };
      }
      const request: CatalogSaveRequest = {
        operationId,
        exampleId: current.exampleId,
        baseRevision: current.baseRevision,
        files: current.files.map(({ content, path, removed }) => ({
          content,
          path,
          ...(removed ? { removed } : {}),
        })),
      };
      submittedFiles = current.files.map(cloneFile);
      state.update((value) => ({
        ...value,
        lastSequence: 0,
        operationId,
        progress: [],
        saving: true,
        terminal: undefined,
      }));
      return { status: 'started', request };
    },
    editFile: (path, content) =>
      state.update((current) => {
        const files = current.files.map((file) =>
          file.path === path ? { ...file, content } : file,
        );
        const dirty = filesDiffer(files, baselineFiles);
        return { ...current, dirty, files };
      }),
    getSnapshot: () => {
      const current = get(state);
      return { ...current, files: current.files.map(cloneFile) };
    },
    removeFile: (path) =>
      state.update((current) => ({
        ...current,
        dirty: true,
        files: current.files.map((file) =>
          file.path === path ? { ...file, removed: true } : file,
        ),
      })),
    restoreFile: (path) =>
      state.update((current) => {
        const files = current.files.map((file) => {
          if (file.path !== path) return file;
          const { removed: _, ...restored } = file;
          return restored;
        });
        return {
          ...current,
          dirty: filesDiffer(files, baselineFiles),
          files,
        };
      }),
    selectFile: (path) =>
      state.update((current) =>
        current.files.some((file) => file.path === path)
          ? { ...current, selectedPath: path }
          : current,
      ),
  };
};
