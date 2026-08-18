import { createHash, randomUUID } from 'node:crypto';
import {
  access,
  chmod,
  copyFile,
  cp,
  lstat,
  mkdir,
  open,
  readdir,
  readFile,
  realpath,
  rename,
  rm,
  rmdir,
  unlink,
  writeFile,
} from 'node:fs/promises';
import {
  dirname,
  isAbsolute,
  join,
  posix,
  relative,
  resolve,
  sep,
} from 'node:path';

export type CatalogAuthoringArtifact =
  | { content: string | Uint8Array; delete?: false; path: string }
  | { content?: never; delete: true; path: string };

export type CatalogAuthoringSource = {
  examplesPath: string;
  id: string;
  label: string;
  registrationOutputPath: string;
  registrationTypePath: string;
};

export type CatalogAuthoringTarget = {
  defaultNamespace: string;
  defaultTaskQueue: string;
  id: string;
  sourceId: string;
  workflowsModulePath: string;
};

export type CatalogAuthoringOutput = {
  consumers: readonly ('authoring' | 'browser' | 'worker')[];
  path: string;
};

export type CatalogAuthoringGraph = {
  boundaries: {
    browserPaths: readonly string[];
    packageJsonPath: string;
    workerPaths: readonly string[];
  };
  outputs: readonly CatalogAuthoringOutput[];
  sources: readonly CatalogAuthoringSource[];
  targets: readonly CatalogAuthoringTarget[];
};

export type CatalogComposedExample = {
  id: string;
  sourceFiles: readonly string[];
  sourceId: string;
  targetId: string;
  workflowType?: string;
};

export type CatalogAuthoringFile = {
  content: string;
  editable: boolean;
  mode: number;
  path: string;
  removed?: true;
};

export type CatalogAuthoringLimits = {
  maxDepth: number;
  maxFileBytes: number;
  maxFiles: number;
  maxTotalBytes: number;
};

export type CatalogLoadedExample = Omit<
  CatalogComposedExample,
  'sourceFiles'
> & {
  sourceFiles: readonly CatalogAuthoringFile[];
  sourceSnapshot: {
    baseRevision: string;
    limits: CatalogAuthoringLimits;
  };
};

export type CatalogSavedState =
  | { durability: 'durable'; status: 'saved' }
  | { status: 'dirty' | 'failed' | 'stale' };

export type CatalogMutationDirection = 'demote' | 'promote';

export type CatalogMutationCheckResult = {
  detail?: string;
  id: string;
  label: string;
  severity: 'advisory' | 'blocking';
  status: 'failed' | 'not-reached' | 'passed';
};

export type CatalogMutationMoveResult = {
  changedPaths: string[];
  moved: { from: string; to: string };
};

export type CatalogMutationOutcome<Result = CatalogMutationMoveResult> =
  | {
      checks?: CatalogMutationCheckResult[];
      commit: 'durable';
      direction: CatalogMutationDirection;
      result: Result;
      status: 'succeeded';
    }
  | {
      checks?: CatalogMutationCheckResult[];
      detail?: string;
      direction: CatalogMutationDirection;
      reason:
        | 'catalog-busy'
        | 'check-blocked'
        | 'destination-conflict'
        | 'check-failed'
        | 'generation-failed'
        | 'policy-rejected'
        | 'recovery-refused'
        | 'save-state-changed'
        | 'source-invalid'
        | 'stale-preview';
      status: 'refused';
    }
  | {
      direction: CatalogMutationDirection;
      filesystem: 'changed' | 'may-have-changed' | 'restored' | 'unknown';
      reason:
        | 'committed-finalization-failed'
        | 'execution-failed'
        | 'finalization-failed'
        | 'outcome-unknown'
        | 'recovery-incomplete';
      recovery: 'committed' | 'incomplete' | 'rolled-back' | 'unknown';
      recoveryEvidence?: { journal: string; transaction: string };
      status: 'failed';
    };

class CatalogMutationRefusalError extends Error {
  constructor(
    readonly reason: Extract<
      CatalogMutationOutcome,
      { status: 'refused' }
    >['reason'],
    message: string,
  ) {
    super(message);
  }
}

class CatalogCommittedFinalizationError extends Error {
  constructor(
    readonly recoveryEvidence: { journal: string; transaction: string },
    cause: unknown,
  ) {
    super('Committed catalog mutation cleanup failed', { cause });
  }
}

const isIndeterminateFilesystemError = (error: unknown): boolean => {
  if ((error as NodeJS.ErrnoException | undefined)?.code === 'EIO') return true;
  return (
    error instanceof AggregateError &&
    error.errors.some(isIndeterminateFilesystemError)
  );
};

export type CatalogMutationRevisionInput = {
  destination: {
    contentHash?: string;
    entries?: readonly {
      contentHash: string;
      mode: number;
      path: string;
      type: 'directory' | 'file';
    }[];
    mode?: number;
    path: string;
    state: 'absent' | 'directory' | 'file';
  };
  source: readonly {
    contentHash: string;
    mode: number;
    path: string;
    type: 'directory' | 'file';
  }[];
  sourceRoot: { identity: string; mode: number; path: string };
};

export const createCatalogMutationRevision = ({
  destination,
  source,
  sourceRoot,
}: CatalogMutationRevisionInput) => {
  const hash = createHash('sha256');
  const append = (value: string) => {
    hash.update(String(Buffer.byteLength(value)));
    hash.update(':');
    hash.update(value);
  };
  const appendEntries = (entries: CatalogMutationRevisionInput['source']) => {
    for (const entry of [...entries].sort((left, right) =>
      left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
    )) {
      append(entry.path);
      append(entry.type);
      append(entry.mode.toString(8));
      append(entry.contentHash);
    }
  };
  append('catalog-mutation-revision-v2');
  append(sourceRoot.path);
  append(sourceRoot.identity);
  append(sourceRoot.mode.toString(8));
  append(destination.path);
  append(destination.state);
  append(destination.mode?.toString(8) ?? '');
  append(destination.contentHash ?? '');
  appendEntries(destination.entries ?? []);
  appendEntries(source);
  return hash.digest('hex');
};

export type CatalogAssemblyExample = CatalogComposedExample & {
  definitionImportPath: string;
  workflowExport?: string;
  workflowImportPath?: string;
};

export type CatalogAuthoringAdapter = {
  finalizePromotion?: (context: {
    direction: 'promote';
    exampleId: string;
  }) => void | Promise<void>;
  promotionChecks?: readonly {
    id: string;
    label: string;
    run: (context: {
      direction: 'promote';
      exampleId: string;
    }) =>
      | { detail?: string; status: 'failed' | 'passed' }
      | Promise<{ detail?: string; status: 'failed' | 'passed' }>;
    severity: 'advisory' | 'blocking';
  }[];
  describePromotion?: (context: {
    exampleId: string;
    from: string;
    to: string;
  }) => {
    authoredSource: string;
    destination: { id: string; path: string };
    generatedOutputs: readonly {
      gitEffect: 'ignored-update' | 'tracked-update';
      path: string;
    }[];
    gitEffects: {
      destination: 'tracked-addition';
      source: 'ignored-removal';
    };
    source: { id: string; path: string };
  };
  generatedPaths: readonly string[];
  graph: CatalogAuthoringGraph;
  generate: () =>
    | readonly CatalogAuthoringArtifact[]
    | Promise<readonly CatalogAuthoringArtifact[]>;
  localExamplesPath: string;
  loadExamples: () =>
    | readonly CatalogComposedExample[]
    | Promise<readonly CatalogComposedExample[]>;
  lockStaleAfterMs?: number;
  parseModuleSpecifiers: (context: {
    filePath: string;
    source: string;
  }) => readonly string[] | Promise<readonly string[]>;
  rootDirectory: string;
  scaffold: (options: {
    exampleId: string;
  }) =>
    | readonly CatalogAuthoringArtifact[]
    | Promise<readonly CatalogAuthoringArtifact[]>;
  trackedExamplesPath: string;
  transactionFilesystem?: {
    rename?: (from: string, to: string) => Promise<void>;
    rm: (
      path: string,
      options: { force: boolean; recursive: boolean },
    ) => Promise<void>;
    unlink: (path: string) => Promise<void>;
  };
  validatePromotion?: (context: { exampleId: string }) => void | Promise<void>;
  verify?: (context: {
    exampleIds: { local: string[]; tracked: string[] };
  }) => void | Promise<void>;
  verifyGenerated?: () => void | Promise<void>;
};

export type CatalogEditorAdapter = CatalogAuthoringAdapter & {
  editor: {
    limits: CatalogAuthoringLimits;
    loadExamples: () =>
      | readonly CatalogLoadedExample[]
      | Promise<readonly CatalogLoadedExample[]>;
  };
};

type CatalogAuthoringPlan = {
  operations: (
    | { from: string; kind: 'move-directory'; to: string }
    | { kind: 'generate' | 'verify' }
  )[];
};

type CatalogPromotionDescription = ReturnType<
  NonNullable<CatalogAuthoringAdapter['describePromotion']>
>;

export type CatalogPromotionPreview =
  | {
      reason:
        | 'preview-not-supported'
        | 'save-failed'
        | 'saved-revision-stale'
        | 'unsaved-changes';
      status: 'unavailable';
    }
  | (CatalogPromotionDescription & {
      checks?: readonly {
        id: string;
        label: string;
        severity: 'advisory' | 'blocking';
        status: 'pending';
      }[];
      exampleId: string;
      revision: string;
      status: 'available';
    });

export type CatalogAuthoring = {
  confirmPromote: (options: {
    exampleId: string;
    revision: string;
    saveState: CatalogSavedState;
  }) => Promise<CatalogMutationOutcome>;
  demote: (exampleId: string) => Promise<CatalogMutationMoveResult>;
  generate: () => Promise<readonly CatalogAuthoringArtifact[]>;
  planDemote: (exampleId: string) => Promise<CatalogAuthoringPlan>;
  planPromote: (exampleId: string) => Promise<CatalogAuthoringPlan>;
  previewPromote: (options: {
    exampleId: string;
    saveState: CatalogSavedState;
  }) => Promise<CatalogPromotionPreview>;
  promote: (exampleId: string) => Promise<CatalogMutationMoveResult>;
  scaffold: (exampleId: string) => Promise<void>;
  verify: () => Promise<void>;
};

export type CatalogEditor = {
  addFile: (
    example: CatalogLoadedExample,
    file: Pick<CatalogAuthoringFile, 'content' | 'path'>,
  ) => CatalogLoadedExample;
  loadExamples: () => Promise<readonly CatalogLoadedExample[]>;
  removeFile: (
    example: CatalogLoadedExample,
    path: string,
  ) => CatalogLoadedExample;
  restoreFile: (
    example: CatalogLoadedExample,
    path: string,
  ) => CatalogLoadedExample;
};

type CatalogAuthoringFor<Adapter> = Adapter extends CatalogEditorAdapter
  ? CatalogAuthoring & CatalogEditor
  : CatalogAuthoring;

const pathExists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const artifactContent = (artifact: CatalogAuthoringArtifact) =>
  artifact.delete ? undefined : Buffer.from(artifact.content);

const exampleIdsAt = async (rootDirectory: string, path: string) =>
  (
    await readdir(join(rootDirectory, path), { withFileTypes: true }).catch(
      () => [],
    )
  )
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

type FileSnapshot = {
  backupPath?: string;
  existed: boolean;
  mode?: number;
  path: string;
};

type TransactionJournal = {
  id: string;
  move?: { from: string; marker?: string; to: string };
  snapshots: FileSnapshot[];
  state: 'committed' | 'pending';
  transactionPath: string;
};

const assertExplicitRelativePath = (path: string) => {
  if (
    path.length === 0 ||
    isAbsolute(path) ||
    path.includes('\\') ||
    /^[a-z][a-z+.-]*:/i.test(path) ||
    posix.normalize(path) !== path ||
    path === '..' ||
    path.startsWith('../')
  ) {
    throw new Error('Catalog paths must be explicit relative paths');
  }
};

const assertExampleId = (exampleId: string) => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(exampleId)) {
    throw new Error('Catalog example IDs must use lowercase kebab-case');
  }
};

export const defineCatalogArtifact = (
  path: string,
  content: string | Uint8Array,
): CatalogAuthoringArtifact => {
  assertExplicitRelativePath(path);
  return { content, path };
};

export const deleteCatalogArtifact = (
  path: string,
): CatalogAuthoringArtifact => {
  assertExplicitRelativePath(path);
  return { delete: true, path };
};

export const composeCatalogArtifacts = (
  ...groups: readonly (readonly CatalogAuthoringArtifact[])[]
) => {
  const artifacts = groups.flat();
  const paths = new Set<string>();
  for (const artifact of artifacts) {
    assertExplicitRelativePath(artifact.path);
    if (paths.has(artifact.path)) {
      throw new Error(`Duplicate catalog artifact: ${artifact.path}`);
    }
    paths.add(artifact.path);
  }
  return artifacts.sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
};

export const validateCatalogAuthoringGraph = (
  graph: CatalogAuthoringGraph,
  examples: readonly CatalogComposedExample[],
) => {
  const uniqueById = <Value extends { id: string }>(
    values: readonly Value[],
    kind: string,
  ) => {
    const byId = new Map<string, Value>();
    for (const value of values) {
      assertExampleId(value.id);
      if (byId.has(value.id)) {
        throw new Error(`Duplicate catalog ${kind} id: ${value.id}`);
      }
      byId.set(value.id, value);
    }
    return byId;
  };
  const sources = uniqueById(graph.sources, 'source');
  const targets = uniqueById(graph.targets, 'target');
  const outputPaths = new Set<string>();
  const outputsByPath = new Map<string, CatalogAuthoringOutput>();
  for (const output of graph.outputs) {
    assertExplicitRelativePath(output.path);
    if (outputPaths.has(output.path)) {
      throw new Error(`Duplicate catalog output path: ${output.path}`);
    }
    if (output.consumers.length === 0) {
      throw new Error(`Catalog output has no consumers: ${output.path}`);
    }
    outputPaths.add(output.path);
    outputsByPath.set(output.path, output);
  }
  for (const source of graph.sources) {
    assertExplicitRelativePath(source.examplesPath);
    assertExplicitRelativePath(source.registrationOutputPath);
    assertExplicitRelativePath(source.registrationTypePath);
    if (!source.label.trim()) {
      throw new Error(`Catalog source label is required: ${source.id}`);
    }
    if (!outputPaths.has(source.registrationOutputPath)) {
      throw new Error(
        `Catalog source output is undeclared: ${source.registrationOutputPath}`,
      );
    }
  }
  for (const target of graph.targets) {
    assertExplicitRelativePath(target.workflowsModulePath);
    if (!sources.has(target.sourceId)) {
      throw new Error(
        `Catalog target references an unknown source: ${target.sourceId}`,
      );
    }
    if (!target.defaultNamespace.trim() || !target.defaultTaskQueue.trim()) {
      throw new Error(
        `Catalog target must declare a default namespace and task queue: ${target.id}`,
      );
    }
    if (!outputPaths.has(target.workflowsModulePath)) {
      throw new Error(
        `Catalog workflows output is undeclared: ${target.workflowsModulePath}`,
      );
    }
  }
  for (const path of [
    graph.boundaries.packageJsonPath,
    ...graph.boundaries.browserPaths,
    ...graph.boundaries.workerPaths,
  ]) {
    assertExplicitRelativePath(path);
  }
  const browserPaths = new Set(graph.boundaries.browserPaths);
  for (const path of graph.boundaries.browserPaths) {
    const output = outputsByPath.get(path);
    if (output && !output.consumers.includes('browser')) {
      throw new Error(
        `Catalog browser boundary must declare a browser consumer: ${path}`,
      );
    }
  }
  for (const path of graph.boundaries.workerPaths) {
    if (browserPaths.has(path)) {
      throw new Error(
        `Catalog boundary cannot be both browser and worker: ${path}`,
      );
    }
    const output = outputsByPath.get(path);
    if (output && !output.consumers.includes('worker')) {
      throw new Error(
        `Catalog worker boundary must declare a worker consumer: ${path}`,
      );
    }
  }
  const seenExamples = new Set<string>();
  const workflowOwners = new Map<string, string>();
  for (const example of examples) {
    assertExampleId(example.id);
    if (seenExamples.has(example.id)) {
      throw new Error(`Duplicate catalog example id: ${example.id}`);
    }
    seenExamples.add(example.id);
    const source = sources.get(example.sourceId);
    const target = targets.get(example.targetId);
    if (!source || !target || target.sourceId !== source.id) {
      throw new Error(
        `Catalog example has an invalid source/target composition: ${example.id}`,
      );
    }
    for (const path of example.sourceFiles) assertExplicitRelativePath(path);
    if (example.workflowType) {
      const key = `${example.targetId}\0${example.workflowType}`;
      const existing = workflowOwners.get(key);
      if (existing) {
        throw new Error(
          `Workflow type "${example.workflowType}" is declared by both ${existing} and ${example.id}`,
        );
      }
      workflowOwners.set(key, example.id);
    }
  }
};

const moduleSpecifier = (fromPath: string, toPath: string) => {
  const relativePath = posix.relative(posix.dirname(fromPath), toPath);
  return `${relativePath.startsWith('.') ? '' : './'}${relativePath}`.replace(
    /\.(?:ts|tsx)$/,
    '.js',
  );
};

export const renderCatalogSourceAssembly = ({
  examples,
  source,
  target,
}: {
  examples: readonly CatalogAssemblyExample[];
  source: CatalogAuthoringSource;
  target: CatalogAuthoringTarget;
}) => {
  if (target.sourceId !== source.id) {
    throw new Error('Catalog source assembly target has the wrong source');
  }
  const ordered = [...examples].sort((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );
  for (const example of ordered) {
    if (example.sourceId !== source.id || example.targetId !== target.id) {
      throw new Error(
        `Catalog assembly example is assigned to another source or target: ${example.id}`,
      );
    }
    assertExplicitRelativePath(example.definitionImportPath);
    if (example.workflowImportPath) {
      assertExplicitRelativePath(example.workflowImportPath);
    }
  }
  const imports = ordered.map(
    (example, index) =>
      `import { catalogExample as example${index} } from '${moduleSpecifier(source.registrationOutputPath, example.definitionImportPath)}';`,
  );
  const registrations = ordered.map(
    (_example, index) =>
      `    registry.registerExample({ ...example${index}, targetId: '${target.id}' });`,
  );
  const sourceFiles = [
    ...new Set(ordered.flatMap((example) => example.sourceFiles)),
  ]
    .sort()
    .map((path) => `    '${path}',`);
  const registration = [
    '// GENERATED FILE. DO NOT EDIT.',
    ...imports,
    `import type { CatalogRegistrationSource } from '${moduleSpecifier(source.registrationOutputPath, source.registrationTypePath)}';`,
    `import * as workflows from '${moduleSpecifier(source.registrationOutputPath, target.workflowsModulePath)}';`,
    '',
    'export const catalogRegistrationSource: CatalogRegistrationSource = {',
    `  source: ${JSON.stringify({ id: source.id, label: source.label })},`,
    '  sourceFiles: [',
    ...sourceFiles,
    '  ],',
    '  register: (registry) => {',
    '    registry.registerTarget({',
    `      id: '${target.id}',`,
    `      namespace: '${target.defaultNamespace}',`,
    `      taskQueue: '${target.defaultTaskQueue}',`,
    `      workflowsPath: new URL('${moduleSpecifier(source.registrationOutputPath, target.workflowsModulePath).replace(/\.js$/, '.ts')}', import.meta.url).href,`,
    '      workflowExports: workflows,',
    '    });',
    ...registrations,
    '  },',
    '};',
    '',
  ].join('\n');
  const workflowExports = ordered
    .filter((example) => example.workflowExport && example.workflowImportPath)
    .map(
      (example) =>
        `export { ${example.workflowExport} } from '${moduleSpecifier(target.workflowsModulePath, example.workflowImportPath!)}';`,
    );
  return composeCatalogArtifacts([
    defineCatalogArtifact(source.registrationOutputPath, registration),
    defineCatalogArtifact(
      target.workflowsModulePath,
      ['// GENERATED FILE. DO NOT EDIT.', ...workflowExports, ''].join('\n'),
    ),
  ]);
};

export const createCatalogAuthoring = <Adapter extends CatalogAuthoringAdapter>(
  adapter: Adapter,
): CatalogAuthoringFor<Adapter> => {
  validateCatalogAuthoringGraph(adapter.graph, []);
  const declaredOutputs = new Set(
    adapter.graph.outputs.map((output) => output.path),
  );
  for (const path of [
    adapter.localExamplesPath,
    adapter.trackedExamplesPath,
    ...adapter.generatedPaths,
  ]) {
    assertExplicitRelativePath(path);
    if (adapter.generatedPaths.includes(path) && !declaredOutputs.has(path)) {
      throw new Error(`Catalog generated output is undeclared: ${path}`);
    }
  }

  const rootDirectory = realpath(adapter.rootDirectory);
  const safeAbsolutePath = async (path: string) => {
    assertExplicitRelativePath(path);
    const root = await rootDirectory;
    const segments = path.split('/');
    let current = root;
    for (const [index, segment] of segments.entries()) {
      const candidate = join(current, segment);
      const metadata = await lstat(candidate).catch((error) => {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
        throw error;
      });
      if (!metadata) return join(current, ...segments.slice(index));
      if (metadata.isSymbolicLink()) {
        throw new Error(
          `Catalog paths cannot traverse symbolic links: ${path}`,
        );
      }
      if (index < segments.length - 1 && !metadata.isDirectory()) {
        throw new Error(`Catalog path ancestor must be a directory: ${path}`);
      }
      current = candidate;
    }
    return current;
  };
  const ensureSafeDirectory = async (path: string) => {
    assertExplicitRelativePath(path);
    const root = await rootDirectory;
    let current = root;
    for (const segment of path.split('/')) {
      current = join(current, segment);
      await mkdir(current).catch((error) => {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      });
      const metadata = await lstat(current);
      if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
        throw new Error(
          `Catalog paths cannot traverse symbolic links or special files: ${path}`,
        );
      }
    }
    return current;
  };
  const ensureSafeParent = async (path: string) => {
    const parent = posix.dirname(path);
    if (parent === '.') return rootDirectory;
    return ensureSafeDirectory(parent);
  };
  const writeArtifacts = async (
    artifacts: readonly CatalogAuthoringArtifact[],
    transactionPath: string,
  ) => {
    const stagedDirectory = `${transactionPath}/staged`;
    await ensureSafeDirectory(stagedDirectory);
    const staged = await Promise.all(
      artifacts.map(async (artifact, index) => {
        if (artifact.delete) return { artifact };
        const stagedPath = `${stagedDirectory}/${index}`;
        const content = artifactContent(artifact);
        if (!content) throw new Error('Catalog artifact has no content');
        await writeFile(await safeAbsolutePath(stagedPath), content, {
          flag: 'wx',
        });
        return { artifact, stagedPath };
      }),
    );
    for (const { artifact, stagedPath } of staged) {
      if (artifact.delete) {
        await unlink(await safeAbsolutePath(artifact.path)).catch((error) => {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        });
        await removeEmptyParents(artifact.path);
        continue;
      }
      if (!stagedPath) throw new Error('Catalog artifact was not staged');
      await ensureSafeParent(artifact.path);
      await rename(
        await safeAbsolutePath(stagedPath),
        await safeAbsolutePath(artifact.path),
      );
    }
  };
  const renderGeneratedArtifacts = async () => {
    const artifacts = await adapter.generate();
    const allowedPaths = new Set(adapter.generatedPaths);
    for (const artifact of artifacts) {
      assertExplicitRelativePath(artifact.path);
      if (!allowedPaths.has(artifact.path)) {
        throw new Error(
          `Adapter returned an undeclared catalog output: ${artifact.path}`,
        );
      }
    }
    return artifacts;
  };
  const snapshotFiles = async (
    paths: readonly string[],
    transactionPath: string,
  ) => {
    const backupDirectory = `${transactionPath}/backups`;
    await ensureSafeDirectory(backupDirectory);
    return Promise.all(
      [...new Set(paths)].map(async (path, index): Promise<FileSnapshot> => {
        const absolutePath = await safeAbsolutePath(path);
        const metadata = await lstat(absolutePath).catch((error) => {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
          throw error;
        });
        if (!metadata) return { existed: false, path };
        if (!metadata.isFile() || metadata.isSymbolicLink()) {
          throw new Error(
            `Catalog transaction path must be a regular file: ${path}`,
          );
        }
        const backupPath = `${backupDirectory}/${index}`;
        await copyFile(absolutePath, await safeAbsolutePath(backupPath));
        return { backupPath, existed: true, mode: metadata.mode, path };
      }),
    );
  };
  const removeEmptyParents = async (path: string) => {
    const root = await rootDirectory;
    let directory = dirname(await safeAbsolutePath(path));
    while (directory !== root && directory.startsWith(`${root}${sep}`)) {
      const removed = await rmdir(directory)
        .then(() => true)
        .catch(() => false);
      if (!removed) return;
      directory = dirname(directory);
    }
  };
  const restoreFiles = async (snapshots: readonly FileSnapshot[]) => {
    for (const snapshot of snapshots) {
      const absolutePath = await safeAbsolutePath(snapshot.path);
      if (!snapshot.existed) {
        await unlink(absolutePath).catch((error) => {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        });
        await removeEmptyParents(snapshot.path);
        continue;
      }
      if (!snapshot.backupPath) {
        throw new Error(`Missing transaction backup for ${snapshot.path}`);
      }
      const temporaryPath = `${absolutePath}.${randomUUID()}.rollback`;
      await ensureSafeParent(snapshot.path);
      await copyFile(
        await safeAbsolutePath(snapshot.backupPath),
        temporaryPath,
      );
      if (snapshot.mode !== undefined)
        await chmod(temporaryPath, snapshot.mode);
      await rename(temporaryPath, absolutePath);
    }
  };
  const journalRelativePath = '.catalog.journal.json';
  const transactionFilesystem = adapter.transactionFilesystem ?? {
    rename,
    rm,
    unlink,
  };
  const recoveryRename = transactionFilesystem.rename ?? rename;
  const cleanupRecoveryEvidence = async (transactionPath: string) => {
    await transactionFilesystem.rm(await safeAbsolutePath(transactionPath), {
      force: true,
      recursive: true,
    });
    await transactionFilesystem.unlink(
      await safeAbsolutePath(journalRelativePath),
    );
  };
  const writeJournal = async (journal: TransactionJournal) => {
    const temporaryPath = `.catalog.journal.${journal.id}.tmp`;
    await writeFile(
      await safeAbsolutePath(temporaryPath),
      `${JSON.stringify(journal, null, 2)}\n`,
      { flag: 'wx' },
    );
    await rename(
      await safeAbsolutePath(temporaryPath),
      await safeAbsolutePath(journalRelativePath),
    );
  };
  const markJournalCommitted = async (journal: TransactionJournal) => {
    const temporaryPath = `.catalog.journal.${journal.id}.committed.tmp`;
    await writeFile(
      await safeAbsolutePath(temporaryPath),
      `${JSON.stringify({ ...journal, state: 'committed' }, null, 2)}\n`,
      { flag: 'wx' },
    );
    await rename(
      await safeAbsolutePath(temporaryPath),
      await safeAbsolutePath(journalRelativePath),
    );
  };
  const readJournal = async (): Promise<TransactionJournal | undefined> => {
    const path = await safeAbsolutePath(journalRelativePath);
    const metadata = await lstat(path).catch((error) => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    });
    if (!metadata) return;
    if (!metadata.isFile() || metadata.isSymbolicLink()) {
      throw new Error('Catalog transaction journal must be a regular file');
    }
    const journal = JSON.parse(await readFile(path, 'utf8')) as Omit<
      TransactionJournal,
      'state'
    > & {
      state?: TransactionJournal['state'];
    };
    if (
      !journal ||
      typeof journal.id !== 'string' ||
      journal.transactionPath !== `.catalog.transaction-${journal.id}` ||
      !Array.isArray(journal.snapshots) ||
      (journal.state !== undefined &&
        !['committed', 'pending'].includes(journal.state))
    ) {
      throw new Error('Catalog transaction journal is invalid');
    }
    try {
      assertExplicitRelativePath(journal.transactionPath);
      for (const snapshot of journal.snapshots) {
        if (
          !snapshot ||
          typeof snapshot !== 'object' ||
          typeof snapshot.existed !== 'boolean' ||
          typeof snapshot.path !== 'string' ||
          (snapshot.mode !== undefined && typeof snapshot.mode !== 'number') ||
          (snapshot.backupPath !== undefined &&
            typeof snapshot.backupPath !== 'string')
        ) {
          throw new Error('invalid snapshot');
        }
        assertExplicitRelativePath(snapshot.path);
        if (
          snapshot.backupPath &&
          !snapshot.backupPath.startsWith(`${journal.transactionPath}/backups/`)
        ) {
          throw new Error('invalid backup');
        }
      }
      if (journal.move) {
        if (
          typeof journal.move !== 'object' ||
          typeof journal.move.from !== 'string' ||
          typeof journal.move.to !== 'string' ||
          journal.move.marker !== `.catalog-move-owner-${journal.id}`
        ) {
          throw new Error('invalid move');
        }
        assertExplicitRelativePath(journal.move.from);
        assertExplicitRelativePath(journal.move.to);
      }
    } catch {
      throw new Error('Catalog transaction journal is invalid');
    }
    return { ...journal, state: journal.state ?? 'pending' };
  };
  const recoverJournal = async () => {
    const journal = await readJournal();
    if (!journal) return;
    if (journal.state === 'committed') {
      await cleanupRecoveryEvidence(journal.transactionPath);
      return;
    }
    const rollbackErrors: unknown[] = [];
    try {
      await restoreFiles(journal.snapshots);
    } catch (error) {
      rollbackErrors.push(error);
    }
    if (journal.move) {
      const sourcePath = await safeAbsolutePath(journal.move.from);
      const destinationPath = await safeAbsolutePath(journal.move.to);
      const [sourceExists, destinationExists] = await Promise.all([
        pathExists(sourcePath),
        pathExists(destinationPath),
      ]);
      const markerPath = journal.move.marker
        ? join(destinationPath, journal.move.marker)
        : undefined;
      const ownsDestination = markerPath
        ? await readFile(markerPath, 'utf8')
            .then((owner) => owner.trim() === journal.id)
            .catch(() => false)
        : false;
      if (sourceExists && destinationExists && ownsDestination) {
        try {
          await rm(destinationPath, { force: true, recursive: true });
        } catch (error) {
          rollbackErrors.push(error);
        }
      } else if (sourceExists && destinationExists) {
        rollbackErrors.push(
          new Error(
            'Catalog move recovery cannot establish destination ownership',
          ),
        );
      } else if (!sourceExists && destinationExists) {
        try {
          await ensureSafeParent(journal.move.from);
          await recoveryRename(destinationPath, sourcePath);
          if (journal.move.marker) {
            await unlink(join(sourcePath, journal.move.marker)).catch(
              () => undefined,
            );
          }
        } catch (error) {
          rollbackErrors.push(error);
        }
      }
    }
    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        rollbackErrors,
        'Catalog crash recovery was incomplete',
      );
    }
    await cleanupRecoveryEvidence(journal.transactionPath);
  };
  const withJournaledFiles = async <Result>(
    paths: readonly string[],
    action: (transactionPath: string, transactionId: string) => Promise<Result>,
    move?: { from: string; to: string },
  ) => {
    const id = randomUUID();
    const transactionPath = `.catalog.transaction-${id}`;
    await ensureSafeDirectory(transactionPath);
    const snapshots = await snapshotFiles(paths, transactionPath);
    const journal: TransactionJournal = {
      id,
      move: move ? { ...move, marker: `.catalog-move-owner-${id}` } : undefined,
      snapshots,
      state: 'pending',
      transactionPath,
    };
    await writeJournal(journal);
    let result: Result;
    try {
      result = await action(transactionPath, id);
      await markJournalCommitted(journal);
    } catch (error) {
      try {
        await restoreFiles(snapshots);
        if (move) {
          const sourcePath = await safeAbsolutePath(move.from);
          const destinationPath = await safeAbsolutePath(move.to);
          if (
            !(await pathExists(sourcePath)) &&
            (await pathExists(destinationPath))
          ) {
            await ensureSafeParent(move.from);
            await recoveryRename(destinationPath, sourcePath);
            if (journal.move?.marker) {
              await unlink(join(sourcePath, journal.move.marker)).catch(
                () => undefined,
              );
            }
          }
        }
        await cleanupRecoveryEvidence(transactionPath);
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          'Catalog transaction failed and rollback was incomplete',
        );
      }
      throw error;
    }
    try {
      await cleanupRecoveryEvidence(transactionPath);
    } catch (error) {
      throw new CatalogCommittedFinalizationError(
        { journal: journalRelativePath, transaction: transactionPath },
        error,
      );
    }
    return result;
  };
  const generateUnlocked = async (transactionPath: string) => {
    const artifacts = await renderGeneratedArtifacts();
    await writeArtifacts(artifacts, transactionPath);
    return artifacts;
  };
  const verifyUnlocked = async () => {
    if (adapter.verifyGenerated) {
      await adapter.verifyGenerated();
    } else {
      const artifacts = await renderGeneratedArtifacts();

      for (const artifact of artifacts) {
        const actual = await readFile(
          await safeAbsolutePath(artifact.path),
        ).catch((error) => {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
          throw error;
        });
        const expected = artifactContent(artifact);
        if (
          (artifact.delete && actual !== undefined) ||
          (!artifact.delete &&
            (actual === undefined || !expected || !actual.equals(expected)))
        ) {
          throw new Error(
            `Catalog artifact "${artifact.path}" has generated output drift`,
          );
        }
      }
    }

    await adapter.verify?.({
      exampleIds: {
        local: await exampleIdsAt(
          await rootDirectory,
          adapter.localExamplesPath,
        ),
        tracked: await exampleIdsAt(
          await rootDirectory,
          adapter.trackedExamplesPath,
        ),
      },
    });
    validateCatalogAuthoringGraph(adapter.graph, await adapter.loadExamples());
  };
  const withLock = async <Result>(action: () => Promise<Result>) => {
    const lockRelativePath = '.catalog.lock';
    const recoveryLockRelativePath = '.catalog.lock.recovery';
    const lockPath = await safeAbsolutePath(lockRelativePath);
    const token = randomUUID();
    const acquireLock = async () => {
      try {
        return await open(lockPath, 'wx');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      }

      const recoveryPath = await safeAbsolutePath(recoveryLockRelativePath);
      const recoveryToken = randomUUID();
      const acquireRecoveryLock = async () => {
        const candidateRelativePath = `${recoveryLockRelativePath}.candidate-${recoveryToken}`;
        const candidatePath = await safeAbsolutePath(candidateRelativePath);
        const ownerFileName = 'owner.json';
        await mkdir(candidatePath);
        await writeFile(
          join(candidatePath, ownerFileName),
          `${JSON.stringify({
            createdAt: Date.now(),
            pid: process.pid,
            token: recoveryToken,
          })}\n`,
          { flag: 'wx' },
        );
        try {
          for (;;) {
            try {
              await rename(candidatePath, recoveryPath);
              return {
                metadata: await lstat(recoveryPath),
                ownerPath: join(recoveryPath, ownerFileName),
              };
            } catch (error) {
              if (
                !['EEXIST', 'ENOTEMPTY'].includes(
                  (error as NodeJS.ErrnoException).code ?? '',
                )
              ) {
                throw error;
              }
            }
            const metadata = await lstat(recoveryPath).catch((error) => {
              if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
              throw error;
            });
            if (!metadata) continue;
            if (!metadata.isDirectory() || metadata.isSymbolicLink()) {
              throw new Error('Catalog recovery lock must be a real directory');
            }
            const record = await readFile(
              join(recoveryPath, ownerFileName),
              'utf8',
            )
              .then((content) => JSON.parse(content) as unknown)
              .catch(() => undefined);
            const createdAt =
              typeof record === 'object' &&
              record !== null &&
              'createdAt' in record &&
              typeof record.createdAt === 'number'
                ? record.createdAt
                : metadata.mtimeMs;
            const pid =
              typeof record === 'object' &&
              record !== null &&
              'pid' in record &&
              typeof record.pid === 'number'
                ? record.pid
                : undefined;
            const observedToken =
              typeof record === 'object' &&
              record !== null &&
              'token' in record &&
              typeof record.token === 'string' &&
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                record.token,
              )
                ? record.token
                : undefined;
            if (!observedToken) {
              throw new Error('Catalog recovery lock metadata is invalid');
            }
            let processIsRunning = false;
            if (pid !== undefined) {
              try {
                process.kill(pid, 0);
                processIsRunning = true;
              } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
                  processIsRunning = true;
                }
              }
            }
            if (
              Date.now() - createdAt <= (adapter.lockStaleAfterMs ?? 300_000) ||
              processIsRunning
            ) {
              throw new Error(
                'Another catalog mutation is already in progress',
              );
            }
            const staleRecoveryPath = await safeAbsolutePath(
              `${recoveryLockRelativePath}.stale-${metadata.dev}-${metadata.ino}-${observedToken}`,
            );
            try {
              await rename(recoveryPath, staleRecoveryPath);
            } catch (error) {
              if (
                ['EEXIST', 'ENOENT', 'ENOTEMPTY'].includes(
                  (error as NodeJS.ErrnoException).code ?? '',
                )
              ) {
                continue;
              }
              throw error;
            }
          }
        } catch (error) {
          await rm(candidatePath, { force: true, recursive: true }).catch(
            () => undefined,
          );
          throw error;
        }
      };
      const recoveryLock = await acquireRecoveryLock();
      try {
        const metadata = await lstat(lockPath);
        if (!metadata.isFile() || metadata.isSymbolicLink()) {
          throw new Error('Catalog mutation lock must be a regular file');
        }
        const lockRecord = await readFile(lockPath, 'utf8')
          .then((content) => JSON.parse(content) as unknown)
          .catch(() => undefined);
        const createdAt =
          typeof lockRecord === 'object' &&
          lockRecord !== null &&
          'createdAt' in lockRecord &&
          typeof lockRecord.createdAt === 'number'
            ? lockRecord.createdAt
            : metadata.mtimeMs;
        const pid =
          typeof lockRecord === 'object' &&
          lockRecord !== null &&
          'pid' in lockRecord &&
          typeof lockRecord.pid === 'number'
            ? lockRecord.pid
            : undefined;
        let processIsRunning = false;
        if (pid !== undefined) {
          try {
            process.kill(pid, 0);
            processIsRunning = true;
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
              processIsRunning = true;
            }
          }
        }
        const stale =
          Date.now() - createdAt > (adapter.lockStaleAfterMs ?? 300_000) &&
          !processIsRunning;
        if (!stale) {
          throw new Error('Another catalog mutation is already in progress');
        }
        const stalePath = `.catalog.lock.stale-${randomUUID()}`;
        await rename(lockPath, await safeAbsolutePath(stalePath));
        const lock = await open(lockPath, 'wx');
        await unlink(await safeAbsolutePath(stalePath));
        return lock;
      } finally {
        const currentMetadata = await lstat(recoveryPath).catch(
          () => undefined,
        );
        if (
          currentMetadata &&
          recoveryLock.metadata.dev === currentMetadata.dev &&
          recoveryLock.metadata.ino === currentMetadata.ino
        ) {
          const record = await readFile(recoveryLock.ownerPath, 'utf8')
            .then((content) => JSON.parse(content) as { token?: unknown })
            .catch(() => undefined);
          if (record?.token === recoveryToken) {
            await unlink(recoveryLock.ownerPath).catch(() => undefined);
            await rmdir(recoveryPath).catch(() => undefined);
          }
        }
      }
    };
    const lock = await acquireLock();
    await lock.writeFile(
      `${JSON.stringify({ createdAt: Date.now(), pid: process.pid, token })}\n`,
    );
    try {
      await recoverJournal();
      return await action();
    } finally {
      const [ownedMetadata, currentMetadata] = await Promise.all([
        lock.stat(),
        lstat(lockPath).catch(() => undefined),
      ]);
      await lock.close();
      if (
        currentMetadata &&
        ownedMetadata.dev === currentMetadata.dev &&
        ownedMetadata.ino === currentMetadata.ino
      ) {
        try {
          const record = JSON.parse(await readFile(lockPath, 'utf8')) as {
            token?: unknown;
          };
          if (record.token === token) await unlink(lockPath);
        } catch {
          // A replaced or malformed lock is not owned by this process.
        }
      }
    }
  };
  const planDirectoryMove = async ({
    destinationKind,
    exampleId,
    fromRoot,
    sourceKind,
    toRoot,
  }: {
    destinationKind: string;
    exampleId: string;
    fromRoot: string;
    sourceKind: string;
    toRoot: string;
  }) => {
    assertExampleId(exampleId);
    const from = `${fromRoot}/${exampleId}`;
    const to = `${toRoot}/${exampleId}`;
    const sourceMetadata = await lstat(await safeAbsolutePath(from)).catch(
      (error) => {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
        throw error;
      },
    );
    if (!sourceMetadata) {
      throw new Error(`${sourceKind} catalog example does not exist: ${from}`);
    }
    if (!sourceMetadata.isDirectory() || sourceMetadata.isSymbolicLink()) {
      throw new Error(
        `${from} must be a real directory, not a link or special file`,
      );
    }
    if (await pathExists(await safeAbsolutePath(to))) {
      throw new Error(`${destinationKind} destination already exists: ${to}`);
    }
    return { from, sourcePath: await safeAbsolutePath(from), to };
  };
  const validateSelfContainedExample = async ({
    absoluteImportError,
    relativeImportError,
    sourcePath,
  }: {
    absoluteImportError: (filePath: string) => string;
    relativeImportError: (filePath: string) => string;
    sourcePath: string;
  }) => {
    const root = await rootDirectory;
    const validateDirectory = async (directory: string): Promise<string[]> => {
      const entries = await readdir(directory, { withFileTypes: true });
      const files: string[] = [];
      for (const entry of entries) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          files.push(...(await validateDirectory(path)));
          continue;
        }
        if (!entry.isFile()) {
          throw new Error(
            `Catalog example sources must be regular files: ${relative(root, path)}`,
          );
        }
        files.push(path);
      }
      return files;
    };
    const authoredFiles = await validateDirectory(sourcePath);
    const resolvedSourcePath = resolve(sourcePath);
    for (const file of authoredFiles) {
      const source = await readFile(file, 'utf8');
      const moduleSpecifiers = await adapter.parseModuleSpecifiers({
        filePath: relative(root, file),
        source,
      });
      for (const importPath of moduleSpecifiers) {
        const filePath = relative(root, file);
        if (isAbsolute(importPath) || /^file:/i.test(importPath)) {
          throw new Error(absoluteImportError(filePath));
        }
        if (!importPath.startsWith('.')) continue;
        const resolvedImport = resolve(dirname(file), importPath);
        if (
          resolvedImport !== resolvedSourcePath &&
          !resolvedImport.startsWith(`${resolvedSourcePath}${sep}`)
        ) {
          throw new Error(relativeImportError(filePath));
        }
      }
    }
  };
  const planPromote = async (exampleId: string) => {
    let move: Awaited<ReturnType<typeof planDirectoryMove>>;
    try {
      move = await planDirectoryMove({
        destinationKind: 'Promotion',
        exampleId,
        fromRoot: adapter.localExamplesPath,
        sourceKind: 'Local',
        toRoot: adapter.trackedExamplesPath,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.startsWith('Promotion destination already exists:')) {
        throw error;
      }
      throw new CatalogMutationRefusalError(
        'source-invalid',
        message || 'Source validation failed',
      );
    }
    const { from, sourcePath, to } = move;
    try {
      await validateSelfContainedExample({
        absoluteImportError: (filePath) =>
          `${filePath} imports cannot use absolute paths or file URLs`,
        relativeImportError: (filePath) =>
          `${filePath} relative imports must stay within its example directory`,
        sourcePath,
      });
    } catch (error) {
      throw new CatalogMutationRefusalError(
        'source-invalid',
        error instanceof Error ? error.message : 'Source validation failed',
      );
    }
    try {
      await adapter.validatePromotion?.({ exampleId });
    } catch (error) {
      throw new CatalogMutationRefusalError(
        'policy-rejected',
        error instanceof Error
          ? error.message
          : 'Repository policy rejected it',
      );
    }
    return {
      operations: [
        { from, kind: 'move-directory' as const, to },
        { kind: 'generate' as const },
        { kind: 'verify' as const },
      ],
    };
  };
  const planDemote = async (exampleId: string) => {
    const { from, sourcePath, to } = await planDirectoryMove({
      destinationKind: 'Demotion',
      exampleId,
      fromRoot: adapter.trackedExamplesPath,
      sourceKind: 'Tracked',
      toRoot: adapter.localExamplesPath,
    });
    await validateSelfContainedExample({
      absoluteImportError: (filePath) =>
        `Catalog example "${exampleId}" cannot be demoted automatically because ${filePath} imports outside its example directory`,
      relativeImportError: (filePath) =>
        `Catalog example "${exampleId}" cannot be demoted automatically because ${filePath} imports outside its example directory`,
      sourcePath,
    });
    return {
      operations: [
        { from, kind: 'move-directory' as const, to },
        { kind: 'generate' as const },
        { kind: 'verify' as const },
      ],
    };
  };
  const promotionRevision = async (move: { from: string; to: string }) => {
    const sourceRoot = await safeAbsolutePath(move.from);
    const collectTree = async (
      directory: string,
      relativeDirectory = '',
    ): Promise<CatalogMutationRevisionInput['source'][number][]> => {
      const entries = await readdir(directory, { withFileTypes: true });
      const records: CatalogMutationRevisionInput['source'][number][] = [];
      for (const entry of entries.sort((left, right) =>
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
      )) {
        const path = join(directory, entry.name);
        const relativePath = relativeDirectory
          ? `${relativeDirectory}/${entry.name}`
          : entry.name;
        const metadata = await lstat(path);
        if (metadata.isSymbolicLink()) {
          throw new Error(
            `Catalog example sources must be regular files: ${relativePath}`,
          );
        }
        if (metadata.isDirectory()) {
          records.push({
            contentHash: '',
            mode: metadata.mode & 0o7777,
            path: relativePath,
            type: 'directory',
          });
          records.push(...(await collectTree(path, relativePath)));
          continue;
        }
        if (!metadata.isFile()) {
          throw new Error(
            `Catalog example sources must be regular files: ${relativePath}`,
          );
        }
        records.push({
          contentHash: createHash('sha256')
            .update(await readFile(path))
            .digest('hex'),
          mode: metadata.mode & 0o7777,
          path: relativePath,
          type: 'file',
        });
      }
      return records;
    };
    const sourceRootMetadata = await lstat(sourceRoot);
    const destinationPath = await safeAbsolutePath(move.to);
    const destinationMetadata = await lstat(destinationPath).catch((error) => {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    });
    return createCatalogMutationRevision({
      destination: {
        ...(destinationMetadata
          ? {
              mode: destinationMetadata.mode & 0o7777,
              ...(destinationMetadata.isDirectory()
                ? { entries: await collectTree(destinationPath) }
                : destinationMetadata.isFile()
                  ? {
                      contentHash: createHash('sha256')
                        .update(await readFile(destinationPath))
                        .digest('hex'),
                    }
                  : {}),
            }
          : {}),
        path: destinationPath,
        state: destinationMetadata
          ? destinationMetadata.isDirectory()
            ? 'directory'
            : 'file'
          : 'absent',
      },
      source: await collectTree(sourceRoot),
      sourceRoot: {
        identity: `${sourceRootMetadata.dev}:${sourceRootMetadata.ino}`,
        mode: sourceRootMetadata.mode & 0o7777,
        path: sourceRoot,
      },
    });
  };
  const executePlannedMove = async (
    plan: Awaited<ReturnType<typeof planDemote>>,
    operation: string,
  ) => {
    const move = plan.operations[0];
    if (!move || move.kind !== 'move-directory') {
      throw new Error(`${operation} plan has no directory move`);
    }
    return withJournaledFiles(
      adapter.generatedPaths,
      async (transactionPath, transactionId) => {
        const sourcePath = await safeAbsolutePath(move.from);
        const destinationPath = await safeAbsolutePath(move.to);
        await ensureSafeParent(move.to);
        if (operation === 'Promotion') {
          const marker = `.catalog-move-owner-${transactionId}`;
          try {
            await mkdir(destinationPath);
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
              throw new Error(
                `Promotion destination already exists: ${move.to}`,
              );
            }
            throw error;
          }
          let sourceMoved = false;
          try {
            await writeFile(join(destinationPath, marker), transactionId, {
              flag: 'wx',
            });
            const sourceMetadata = await lstat(sourcePath);
            for (const entry of await readdir(sourcePath)) {
              await cp(join(sourcePath, entry), join(destinationPath, entry), {
                errorOnExist: true,
                force: false,
                preserveTimestamps: true,
                recursive: true,
              });
            }
            await chmod(destinationPath, sourceMetadata.mode & 0o7777);
            const stagedSource = await safeAbsolutePath(
              `${transactionPath}/promoted-source`,
            );
            await rename(sourcePath, stagedSource);
            sourceMoved = true;
            await rm(stagedSource, { force: true, recursive: true });
            await unlink(join(destinationPath, marker));
          } catch (error) {
            if (!sourceMoved) {
              await rm(destinationPath, { force: true, recursive: true });
            }
            throw error;
          }
        } else {
          await rename(sourcePath, destinationPath);
        }
        await generateUnlocked(transactionPath);
        await verifyUnlocked();
        return {
          changedPaths: [move.from, move.to, ...adapter.generatedPaths],
          moved: { from: move.from, to: move.to },
        };
      },
      move,
    );
  };

  const previewPromote = async ({
    exampleId,
    saveState,
  }: {
    exampleId: string;
    saveState: CatalogSavedState;
  }) => {
    assertExampleId(exampleId);
    if (saveState.status !== 'saved') {
      const reasons = {
        dirty: 'unsaved-changes',
        failed: 'save-failed',
        stale: 'saved-revision-stale',
      } as const;
      return {
        reason: reasons[saveState.status],
        status: 'unavailable' as const,
      };
    }
    if (!adapter.describePromotion) {
      return {
        reason: 'preview-not-supported' as const,
        status: 'unavailable' as const,
      };
    }
    const plan = await planPromote(exampleId);
    const move = plan.operations[0];
    if (!move || move.kind !== 'move-directory') {
      throw new Error('Promotion plan has no directory move');
    }
    return {
      ...adapter.describePromotion({
        exampleId,
        from: move.from,
        to: move.to,
      }),
      exampleId,
      ...(adapter.promotionChecks?.length
        ? {
            checks: adapter.promotionChecks.map(({ id, label, severity }) => ({
              id,
              label,
              severity,
              status: 'pending' as const,
            })),
          }
        : {}),
      revision: await promotionRevision(move),
      status: 'available' as const,
    };
  };

  const editor =
    'editor' in adapter ? (adapter as CatalogEditorAdapter).editor : undefined;
  const editorLimits = editor ? Object.freeze({ ...editor.limits }) : undefined;
  const assertRetainedAggregateLimits = (
    files: readonly CatalogAuthoringFile[],
  ) => {
    if (!editorLimits) return;
    const retainedFiles = files.filter(({ removed }) => !removed);
    if (retainedFiles.length > editorLimits.maxFiles) {
      throw new Error(
        `Catalog editable fileset exceeds maximum file count of ${editorLimits.maxFiles}`,
      );
    }
    const totalBytes = retainedFiles.reduce(
      (total, file) => total + Buffer.byteLength(file.content),
      0,
    );
    if (totalBytes > editorLimits.maxTotalBytes) {
      throw new Error(
        `Catalog editable fileset exceeds maximum total size of ${editorLimits.maxTotalBytes} bytes`,
      );
    }
  };
  const editorAuthoring: CatalogEditor | undefined = editor
    ? {
        addFile: (
          example: CatalogLoadedExample,
          file: Pick<CatalogAuthoringFile, 'content' | 'path'>,
        ): CatalogLoadedExample => {
          assertExplicitRelativePath(file.path);
          if (posix.basename(file.path).includes('.generated.')) {
            throw new Error(
              `Catalog editable fileset cannot include a generated file: ${file.path}`,
            );
          }
          if (file.content.includes('\0')) {
            throw new Error(
              `Catalog editable fileset cannot include binary content: ${file.path}`,
            );
          }
          const limits = editorLimits!;
          if (file.path.split('/').length > limits.maxDepth) {
            throw new Error(
              `Catalog editable fileset exceeds maximum depth of ${limits.maxDepth}: ${file.path}`,
            );
          }
          const fileBytes = Buffer.byteLength(file.content);
          if (fileBytes > limits.maxFileBytes) {
            throw new Error(
              `Catalog editable fileset exceeds maximum file size of ${limits.maxFileBytes} bytes: ${file.path}`,
            );
          }
          if (example.sourceFiles.some(({ path }) => path === file.path)) {
            throw new Error(`Catalog file already exists: ${file.path}`);
          }
          const addedFile = { ...file, editable: true, mode: 0o644 };
          assertRetainedAggregateLimits([...example.sourceFiles, addedFile]);
          return {
            ...example,
            sourceFiles: [...example.sourceFiles, addedFile].sort(
              (left, right) =>
                left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
            ),
          };
        },
        loadExamples: () =>
          withLock(() => Promise.resolve(editor.loadExamples())),
        removeFile: (
          example: CatalogLoadedExample,
          path: string,
        ): CatalogLoadedExample => ({
          ...example,
          sourceFiles: example.sourceFiles.map((file) =>
            file.path === path ? { ...file, removed: true } : file,
          ),
        }),
        restoreFile: (
          example: CatalogLoadedExample,
          path: string,
        ): CatalogLoadedExample => {
          const sourceFiles = example.sourceFiles.map((file) => {
            if (file.path !== path) return file;
            const { removed: _, ...restored } = file;
            return restored;
          });
          assertRetainedAggregateLimits(sourceFiles);
          return { ...example, sourceFiles };
        },
      }
    : undefined;
  const authoring: CatalogAuthoring = {
    demote: async (exampleId: string) => {
      assertExampleId(exampleId);
      return withLock(() =>
        planDemote(exampleId).then((plan) =>
          executePlannedMove(plan, 'Demotion'),
        ),
      );
    },
    scaffold: async (exampleId: string) => {
      assertExampleId(exampleId);
      return withLock(async () => {
        const examplePath = `${adapter.localExamplesPath}/${exampleId}`;
        if (await pathExists(await safeAbsolutePath(examplePath))) {
          throw new Error(`Local catalog example already exists: ${exampleId}`);
        }
        const artifacts = await adapter.scaffold({ exampleId });
        const scaffoldPrefix = `${examplePath}/`;
        for (const artifact of artifacts) {
          assertExplicitRelativePath(artifact.path);
          if (!artifact.path.startsWith(scaffoldPrefix)) {
            throw new Error(
              'Scaffold outputs must stay within the requested example directory',
            );
          }
        }
        await withJournaledFiles(
          [
            ...artifacts.map((artifact) => artifact.path),
            ...adapter.generatedPaths,
          ],
          async (transactionPath) => {
            await writeArtifacts(artifacts, transactionPath);
            await generateUnlocked(transactionPath);
            await verifyUnlocked();
          },
        );
      });
    },
    generate: () =>
      withLock(() =>
        withJournaledFiles(adapter.generatedPaths, generateUnlocked),
      ),
    verify: () => withLock(verifyUnlocked),
    planDemote,
    planPromote,
    previewPromote,
    promote: async (exampleId: string) => {
      assertExampleId(exampleId);
      return withLock(() =>
        planPromote(exampleId).then((plan) =>
          executePlannedMove(plan, 'Promotion'),
        ),
      );
    },
    confirmPromote: async ({
      exampleId,
      revision,
      saveState,
    }: {
      exampleId: string;
      revision: string;
      saveState: CatalogSavedState;
    }): Promise<CatalogMutationOutcome> => {
      assertExampleId(exampleId);
      if (saveState.status !== 'saved' || saveState.durability !== 'durable') {
        return {
          direction: 'promote' as const,
          reason: 'save-state-changed' as const,
          status: 'refused' as const,
        };
      }
      let confirmation:
        | {
            checks: CatalogMutationCheckResult[];
            kind: 'blocked';
          }
        | {
            checks: CatalogMutationCheckResult[];
            kind: 'finalization-failed';
          }
        | {
            checks: CatalogMutationCheckResult[];
            kind: 'moved';
            result: Awaited<ReturnType<typeof executePlannedMove>>;
          }
        | undefined;
      let mutationStarted = false;
      try {
        confirmation = await withLock(async () => {
          const plan = await planPromote(exampleId);
          const move = plan.operations[0];
          if (!move || move.kind !== 'move-directory') {
            throw new Error('Promotion plan has no directory move');
          }
          if ((await promotionRevision(move)) !== revision) {
            return undefined;
          }
          const checks: NonNullable<typeof confirmation>['checks'] = [];
          const declaredChecks = adapter.promotionChecks ?? [];
          for (const [index, check] of declaredChecks.entries()) {
            let outcome: Awaited<ReturnType<typeof check.run>>;
            try {
              outcome = await check.run({
                direction: 'promote',
                exampleId,
              });
            } catch (error) {
              throw new CatalogMutationRefusalError(
                'check-failed',
                `${check.id}: ${error instanceof Error ? error.message : 'check failed'}`,
              );
            }
            checks.push({
              ...outcome,
              id: check.id,
              label: check.label,
              severity: check.severity,
            });
            if (outcome.status === 'failed' && check.severity === 'blocking') {
              checks.push(
                ...declaredChecks
                  .slice(index + 1)
                  .map(({ id, label, severity }) => ({
                    id,
                    label,
                    severity,
                    status: 'not-reached' as const,
                  })),
              );
              return { checks, kind: 'blocked' as const };
            }
          }
          try {
            await renderGeneratedArtifacts();
          } catch (error) {
            throw new CatalogMutationRefusalError(
              'generation-failed',
              error instanceof Error ? error.message : 'Generation failed',
            );
          }
          const currentPlan = await planPromote(exampleId);
          const currentMove = currentPlan.operations[0];
          if (!currentMove || currentMove.kind !== 'move-directory') {
            throw new Error('Promotion plan has no directory move');
          }
          if (await pathExists(await safeAbsolutePath(currentMove.to))) {
            throw new Error(
              `Promotion destination already exists: ${currentMove.to}`,
            );
          }
          if ((await promotionRevision(currentMove)) !== revision) {
            return undefined;
          }
          mutationStarted = true;
          const result = await executePlannedMove(currentPlan, 'Promotion');
          try {
            await adapter.finalizePromotion?.({
              direction: 'promote',
              exampleId,
            });
          } catch {
            return { checks, kind: 'finalization-failed' as const };
          }
          return { checks, kind: 'moved' as const, result };
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (error instanceof CatalogCommittedFinalizationError) {
          return {
            direction: 'promote' as const,
            filesystem: 'changed' as const,
            reason: 'committed-finalization-failed' as const,
            recovery: 'committed' as const,
            recoveryEvidence: error.recoveryEvidence,
            status: 'failed' as const,
          };
        }
        if (error instanceof CatalogMutationRefusalError) {
          return {
            detail: message.replaceAll(await rootDirectory, '<repository>'),
            direction: 'promote' as const,
            reason: error.reason,
            status: 'refused' as const,
          };
        }
        const fileError = error as NodeJS.ErrnoException & { dest?: string };
        const reason = message.startsWith(
          'Promotion destination already exists:',
        )
          ? 'destination-conflict'
          : message === 'Another catalog mutation is already in progress'
            ? 'catalog-busy'
            : message.includes('recovery lock') ||
                (fileError.code === 'ENOTDIR' &&
                  `${fileError.path ?? ''}${fileError.dest ?? ''}`.includes(
                    '.catalog.lock.recovery',
                  ))
              ? 'recovery-refused'
              : undefined;
        if (reason) {
          return {
            direction: 'promote' as const,
            reason,
            status: 'refused' as const,
          };
        }
        if (message === 'Catalog crash recovery was incomplete') {
          return {
            direction: 'promote' as const,
            filesystem: 'may-have-changed' as const,
            reason: 'recovery-incomplete' as const,
            recovery: 'incomplete' as const,
            status: 'failed' as const,
          };
        }
        if (mutationStarted) {
          if (isIndeterminateFilesystemError(error)) {
            return {
              direction: 'promote' as const,
              filesystem: 'unknown' as const,
              reason: 'outcome-unknown' as const,
              recovery: 'unknown' as const,
              status: 'failed' as const,
            };
          }
          const recoveryIncomplete = message.includes(
            'rollback was incomplete',
          );
          return {
            direction: 'promote' as const,
            filesystem: recoveryIncomplete ? 'may-have-changed' : 'restored',
            reason: recoveryIncomplete
              ? ('recovery-incomplete' as const)
              : ('execution-failed' as const),
            recovery: recoveryIncomplete
              ? ('incomplete' as const)
              : ('rolled-back' as const),
            status: 'failed' as const,
          };
        }
        return {
          direction: 'promote' as const,
          filesystem: 'unknown' as const,
          reason: 'outcome-unknown' as const,
          recovery: 'unknown' as const,
          status: 'failed' as const,
        };
      }
      if (!confirmation) {
        return {
          direction: 'promote' as const,
          reason: 'stale-preview' as const,
          status: 'refused' as const,
        };
      }
      if (confirmation.kind === 'blocked') {
        return {
          checks: confirmation.checks,
          direction: 'promote' as const,
          reason: 'check-blocked' as const,
          status: 'refused' as const,
        };
      }
      if (confirmation.kind === 'finalization-failed') {
        return {
          direction: 'promote' as const,
          filesystem: 'changed' as const,
          reason: 'finalization-failed' as const,
          recovery: 'committed' as const,
          status: 'failed' as const,
        };
      }
      return {
        ...(confirmation.checks.length ? { checks: confirmation.checks } : {}),
        direction: 'promote' as const,
        commit: 'durable' as const,
        result: confirmation.result,
        status: 'succeeded' as const,
      };
    },
  };
  return (
    editorAuthoring ? { ...authoring, ...editorAuthoring } : authoring
  ) as CatalogAuthoringFor<Adapter>;
};

export const catalogHelp = `Usage: catalog <command>

Commands:
  catalog help                   Show this help text.
  catalog scaffold <example-id>  Create a local catalog example.
  catalog generate               Generate catalog artifacts.
  catalog verify                 Verify catalog artifacts and boundaries.
  catalog promote <example-id> [--dry-run]
                                           Promote or preview a directory-backed local example.
  catalog demote <example-id> [--dry-run]
                                           Move or preview a tracked example into the local, Git-ignored catalog.
  catalog dev                    Start the catalog UI and worker.
  catalog worker                 Start the catalog worker.`;

const formatCatalogMoveSuccess = ({
  exampleId,
  headline,
  moved,
  notices = [],
  nextStep,
}: {
  exampleId: string;
  headline: (exampleId: string) => string;
  moved: { from: string; to: string };
  notices?: readonly string[];
  nextStep: string;
}) =>
  [
    headline(exampleId),
    'Moved:',
    `  ${moved.from} → ${moved.to}`,
    'Regenerated catalog artifacts.',
    ...notices,
    `Next: ${nextStep}.`,
  ].join('\n');

export const runCatalogCli = async ({
  authoring,
  argv,
  io,
  dev,
  worker,
}: {
  authoring: Pick<
    ReturnType<typeof createCatalogAuthoring>,
    | 'demote'
    | 'generate'
    | 'planDemote'
    | 'planPromote'
    | 'promote'
    | 'scaffold'
    | 'verify'
  >;
  argv: readonly string[];
  io: {
    writeError: (message: string) => void;
    writeOutput: (message: string) => void;
  };
  dev?: () => unknown | Promise<unknown>;
  worker?: () => unknown | Promise<unknown>;
}) => {
  if (argv.length === 0 || argv.includes('--help')) {
    io.writeOutput(catalogHelp);
    return;
  }
  const command = argv[0] as string;
  const fail = (message: string): never => {
    io.writeError(`${message}\n\n${catalogHelp}`);
    throw new Error(message);
  };

  if (command === 'help' && argv.length === 1) {
    io.writeOutput(catalogHelp);
    return;
  }
  if (command === 'scaffold' && argv.length === 2) {
    await authoring.scaffold(argv[1]);
    io.writeOutput(
      `Created local catalog example "${argv[1]}". Edit its files, then run "pnpm catalog dev".`,
    );
    return;
  }
  if (command === 'generate' && argv.length === 1) {
    await authoring.generate();
    io.writeOutput('Catalog artifacts generated.');
    return;
  }
  if (command === 'verify' && argv.length === 1) {
    await authoring.verify();
    io.writeOutput('Catalog artifacts verified.');
    return;
  }
  if (command === 'demote' && (argv.length === 2 || argv.length === 3)) {
    if (argv.length === 3 && argv[2] !== '--dry-run') {
      fail('Usage: catalog demote <example-id> [--dry-run]');
    }
    if (argv[2] === '--dry-run') {
      io.writeOutput(
        JSON.stringify(await authoring.planDemote(argv[1]), null, 2),
      );
      return;
    }
    const result = await authoring.demote(argv[1]);
    io.writeOutput(
      formatCatalogMoveSuccess({
        exampleId: argv[1],
        headline: (exampleId) => `Demoted "${exampleId}" to the local catalog.`,
        moved: result.moved,
        notices: ['The local example is ignored by Git.'],
        nextStep:
          'review the tracked changes with git status, then commit the tracked removal only if the shared example was already committed',
      }),
    );
    return;
  }
  if (command === 'promote' && (argv.length === 2 || argv.length === 3)) {
    if (argv.length === 3 && argv[2] !== '--dry-run') {
      fail('Usage: catalog promote <example-id> [--dry-run]');
    }
    if (argv[2] === '--dry-run') {
      io.writeOutput(
        JSON.stringify(await authoring.planPromote(argv[1]), null, 2),
      );
      return;
    }
    const result = await authoring.promote(argv[1]);
    io.writeOutput(
      formatCatalogMoveSuccess({
        exampleId: argv[1],
        headline: (exampleId) =>
          `Promoted "${exampleId}" to the shared catalog.`,
        moved: result.moved,
        nextStep:
          'review the tracked changes with git status, then commit them when ready',
      }),
    );
    return;
  }
  if (command === 'dev' && argv.length === 1 && dev) {
    await dev();
    return;
  }
  if (command === 'worker' && argv.length === 1 && worker) {
    await worker();
    return;
  }
  if (
    [
      'demote',
      'dev',
      'generate',
      'help',
      'scaffold',
      'verify',
      'worker',
    ].includes(command)
  ) {
    fail(`Invalid arguments for catalog command "${command}"`);
  }
  fail(`Unknown catalog command "${command}"`);
};

export type CatalogLocalArtifactVitePluginOptions = {
  artifactPath: string;
  regenerate?: (rootDirectory: string) => void | Promise<void>;
  sourcePaths?: readonly string[];
  sourceRootPaths?: readonly string[];
  validateDescriptor?: (descriptor: unknown) => boolean;
  virtualModuleId?: string;
};

export const loadCatalogLocalArtifactDescriptors = async ({
  artifactPath,
  rootDirectory,
  validateDescriptor = () => true,
}: Pick<
  CatalogLocalArtifactVitePluginOptions,
  'artifactPath' | 'validateDescriptor'
> & { rootDirectory: string }) => {
  assertExplicitRelativePath(artifactPath);
  const content = await readFile(
    join(rootDirectory, artifactPath),
    'utf8',
  ).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  });
  if (content === undefined) return [];
  const artifact = JSON.parse(content) as { descriptors?: unknown };
  if (!Array.isArray(artifact.descriptors)) {
    throw new Error(
      `Catalog artifact "${artifactPath}" must contain a descriptors array`,
    );
  }
  if (!artifact.descriptors.every(validateDescriptor)) {
    throw new Error(
      `Catalog artifact "${artifactPath}" contains an invalid local descriptor`,
    );
  }
  return artifact.descriptors;
};

export const createCatalogLocalArtifactVitePlugin = ({
  artifactPath,
  regenerate,
  sourcePaths = [],
  sourceRootPaths = [],
  validateDescriptor = () => true,
  virtualModuleId = 'virtual:catalog-local',
}: CatalogLocalArtifactVitePluginOptions) => {
  for (const path of [artifactPath, ...sourcePaths, ...sourceRootPaths]) {
    assertExplicitRelativePath(path);
  }
  const resolvedModuleId = `\0${virtualModuleId}`;
  let rootDirectory = process.cwd();

  return {
    name: 'vite-plugin-catalog-local',
    configResolved(config: { root: string }) {
      rootDirectory = config.root;
    },
    configureServer(server: {
      watcher: {
        add: (path: string) => void;
        on: (event: string, handler: (path: string) => void) => void;
      };
      moduleGraph: {
        getModuleById: (id: string) => unknown;
        invalidateModule: (module: never) => void;
      };
      ws: { send: (payload: { type: 'full-reload' }) => void };
    }) {
      const resolvedArtifactPath = join(rootDirectory, artifactPath);
      const resolvedSourcePaths = sourcePaths.map((path) =>
        join(rootDirectory, path),
      );
      const resolvedSourceRootPaths = sourceRootPaths.map((path) =>
        join(rootDirectory, path),
      );
      for (const path of [
        resolvedArtifactPath,
        ...resolvedSourcePaths,
        ...resolvedSourceRootPaths,
      ]) {
        server.watcher.add(path);
      }
      let regenerating = false;
      let regenerationQueued = false;
      const regenerateArtifact = async () => {
        if (!regenerate) return;
        if (regenerating) {
          regenerationQueued = true;
          return;
        }
        regenerating = true;
        try {
          await regenerate(rootDirectory);
        } catch (error) {
          console.error(
            `Catalog generation failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        } finally {
          regenerating = false;
          if (regenerationQueued) {
            regenerationQueued = false;
            void regenerateArtifact();
          }
        }
      };
      const reload = (changedPath: string) => {
        if (
          resolvedSourcePaths.includes(changedPath) ||
          resolvedSourceRootPaths.some(
            (rootPath) =>
              changedPath === rootPath ||
              changedPath.startsWith(`${rootPath}${sep}`),
          )
        ) {
          void regenerateArtifact();
          return;
        }
        if (changedPath !== resolvedArtifactPath) return;
        const module = server.moduleGraph.getModuleById(resolvedModuleId);
        if (module) server.moduleGraph.invalidateModule(module as never);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', reload);
      server.watcher.on('change', reload);
      server.watcher.on('unlink', reload);
    },
    resolveId(id: string) {
      if (id === virtualModuleId) return resolvedModuleId;
    },
    async load(id: string) {
      if (id !== resolvedModuleId) return;
      const descriptors = await loadCatalogLocalArtifactDescriptors({
        artifactPath,
        rootDirectory,
        validateDescriptor,
      });
      return `export const localCatalog = ${JSON.stringify(descriptors)};`;
    },
  };
};
