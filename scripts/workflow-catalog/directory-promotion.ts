import {
  access,
  lstat,
  mkdir,
  open,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

import {
  createSourceFile,
  forEachChild,
  isCallExpression,
  isExportDeclaration,
  isExternalModuleReference,
  isImportDeclaration,
  isImportEqualsDeclaration,
  isStringLiteralLike,
  type Node,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
} from 'typescript';

import { validateExampleId } from './scaffold.js';

const localExamplesPath = 'workflow-catalog.local/examples';
const sharedExamplesPath = 'src/lib/workflow-catalog/worker/examples';
const generatedPaths = [
  'workflow-catalog.local/registration.ts',
  'workflow-catalog.local/workflows.ts',
  'workflow-catalog.local/catalog.generated.json',
  'src/lib/workflow-catalog/worker/examples/index.ts',
  'src/lib/workflow-catalog/worker/workflows.ts',
  'src/lib/workflow-catalog/browser/catalog.generated.json',
  'src/lib/workflow-catalog/browser/catalog.generated.ts',
] as const;

type FileSnapshot = {
  content?: Buffer;
  mode?: number;
  path: string;
};

const pathExists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

export const withWorkflowCatalogMutationLock = async <Result>({
  action,
  rootDirectory,
}: {
  action: () => Promise<Result>;
  rootDirectory: string;
}): Promise<Result> => {
  const lockPath = join(rootDirectory, '.workflow-catalog.lock');
  const lock = await open(lockPath, 'wx').catch((error) => {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new Error(
        'Another workflow catalog mutation is already in progress',
      );
    }
    throw error;
  });

  try {
    return await action();
  } finally {
    await lock.close();
    await unlink(lockPath).catch(() => undefined);
  }
};

const snapshotGeneratedFiles = async (
  rootDirectory: string,
): Promise<FileSnapshot[]> =>
  Promise.all(
    generatedPaths.map(async (path) => {
      const absolutePath = join(rootDirectory, path);

      if (!(await pathExists(absolutePath))) return { path };
      const [content, metadata] = await Promise.all([
        readFile(absolutePath),
        stat(absolutePath),
      ]);
      return { content, mode: metadata.mode, path };
    }),
  );

const restoreGeneratedFiles = async (
  rootDirectory: string,
  snapshots: FileSnapshot[],
) => {
  for (const snapshot of snapshots) {
    const path = join(rootDirectory, snapshot.path);

    if (!snapshot.content) {
      await rm(path, { force: true });
      continue;
    }

    const temporaryPath = `${path}.rollback`;
    await mkdir(dirname(path), { recursive: true });
    await writeFile(temporaryPath, snapshot.content, { mode: snapshot.mode });
    await rename(temporaryPath, path);
  }
};

const changedGeneratedPaths = async (
  rootDirectory: string,
  snapshots: FileSnapshot[],
) =>
  (
    await Promise.all(
      snapshots.map(async (snapshot) => {
        const currentContent = await readFile(
          join(rootDirectory, snapshot.path),
        ).catch((error) => {
          if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return undefined;
          }
          throw error;
        });
        const unchanged =
          snapshot.content === undefined
            ? currentContent === undefined
            : currentContent !== undefined &&
              snapshot.content.equals(currentContent);

        return unchanged ? undefined : snapshot.path;
      }),
    )
  ).filter((path): path is string => path !== undefined);

const validateAuthoredTree = async (
  rootDirectory: string,
  sourcePath: string,
  exampleId: string,
) => {
  const files: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        await visit(path);
        continue;
      }

      if (!entry.isFile()) {
        throw new Error(
          `Workflow catalog example sources must be regular files: ${relative(rootDirectory, path)}`,
        );
      }

      files.push(path);
    }
  };

  await visit(sourcePath);
  const examplePath = join(sourcePath, 'example.ts');
  const example = await readFile(examplePath, 'utf8');
  const declaredId = /\bid\s*:\s*['"]([^'"]+)['"]/.exec(example)?.[1];

  if (declaredId !== exampleId) {
    throw new Error(
      `${relative(rootDirectory, examplePath)} ID "${declaredId ?? ''}" does not match promotion ID "${exampleId}"`,
    );
  }

  if (!/export\s+const\s+workflowCatalogExample\b/.test(example)) {
    throw new Error(
      `${relative(rootDirectory, examplePath)} must export workflowCatalogExample`,
    );
  }

  if (/\b(?:sourceFiles|targetId)\s*:/.test(example)) {
    throw new Error(
      `${relative(rootDirectory, examplePath)} must be environment-neutral and omit targetId and sourceFiles`,
    );
  }

  const kind = /\bkind\s*:\s*['"]([^'"]+)['"]/.exec(example)?.[1];
  const workflowType =
    kind === 'workflow'
      ? /\bworkflowType\s*:\s*['"]([^'"]+)['"]/.exec(example)?.[1]
      : undefined;

  if (kind === 'workflow') {
    const workflowPath = join(sourcePath, 'workflow.ts');
    const workflow = await readFile(workflowPath, 'utf8');
    const exportedWorkflow = new RegExp(
      `\\bexport\\s+(?:(?:async\\s+)?function|const)\\s+${workflowType ?? ''}\\b`,
    );

    if (!workflowType || !exportedWorkflow.test(workflow)) {
      throw new Error(
        `${relative(rootDirectory, workflowPath)} does not export workflow "${workflowType ?? ''}"`,
      );
    }

    const sharedDirectory = join(rootDirectory, sharedExamplesPath);
    const sharedEntries = await readdir(sharedDirectory, {
      withFileTypes: true,
    }).catch(() => []);

    for (const entry of sharedEntries.filter((candidate) =>
      candidate.isDirectory(),
    )) {
      const sharedExample = await readFile(
        join(sharedDirectory, entry.name, 'example.ts'),
        'utf8',
      ).catch(() => '');
      const existingWorkflowType = /\bworkflowType\s*:\s*['"]([^'"]+)['"]/.exec(
        sharedExample,
      )?.[1];

      if (existingWorkflowType === workflowType) {
        throw new Error(
          `${relative(rootDirectory, examplePath)} workflow export conflict: ${relative(rootDirectory, join(sharedDirectory, entry.name, 'example.ts'))} already declares workflow "${workflowType}"`,
        );
      }
    }
  }

  const resolvedSourcePath = resolve(sourcePath);

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const sourceFile = createSourceFile(
      file,
      source,
      ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ScriptKind.TSX : ScriptKind.TS,
    );
    const moduleSpecifiers: string[] = [];
    const collectModuleSpecifiers = (node: Node) => {
      let specifier: Node | undefined;

      if (isImportDeclaration(node) || isExportDeclaration(node)) {
        specifier = node.moduleSpecifier;
      } else if (
        isImportEqualsDeclaration(node) &&
        isExternalModuleReference(node.moduleReference)
      ) {
        specifier = node.moduleReference.expression;
      } else if (
        isCallExpression(node) &&
        node.expression.kind === SyntaxKind.ImportKeyword
      ) {
        specifier = node.arguments[0];
      }

      if (specifier && isStringLiteralLike(specifier)) {
        moduleSpecifiers.push(specifier.text);
      }

      forEachChild(node, collectModuleSpecifiers);
    };
    collectModuleSpecifiers(sourceFile);

    for (const importPath of moduleSpecifiers) {
      if (!importPath.startsWith('.')) continue;
      const resolvedImport = resolve(dirname(file), importPath);

      if (
        resolvedImport !== resolvedSourcePath &&
        !resolvedImport.startsWith(`${resolvedSourcePath}${sep}`)
      ) {
        throw new Error(
          `${relative(rootDirectory, file)} relative imports must stay within its example directory`,
        );
      }
    }
  }
};

export const planDirectoryWorkflowCatalogPromotion = async ({
  rootDirectory,
  exampleId,
}: {
  rootDirectory: string;
  exampleId: string;
}) => {
  validateExampleId(exampleId, rootDirectory);

  const sourceDirectory = `${localExamplesPath}/${exampleId}`;
  const destinationDirectory = `${sharedExamplesPath}/${exampleId}`;
  const sourcePath = join(rootDirectory, sourceDirectory);
  const sourceMetadata = await lstat(sourcePath).catch(() => undefined);

  if (!sourceMetadata?.isDirectory() || sourceMetadata.isSymbolicLink()) {
    throw new Error(
      `${sourceDirectory} must be a real directory, not a link or special file`,
    );
  }

  if (
    !(await pathExists(join(sourcePath, 'example.ts'))) ||
    !(await pathExists(join(sourcePath, 'workflow.ts')))
  ) {
    throw new Error(
      `${sourceDirectory} must contain example.ts and workflow.ts; migrate the legacy flat local registration manually before promotion`,
    );
  }

  await validateAuthoredTree(rootDirectory, sourcePath, exampleId);

  const destinationMetadata = await lstat(
    join(rootDirectory, destinationDirectory),
  ).catch((error) => {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  });

  if (destinationMetadata) {
    throw new Error(
      `Promotion destination already exists: ${destinationDirectory}`,
    );
  }

  return {
    operations: [
      {
        from: sourceDirectory,
        kind: 'move-directory' as const,
        to: destinationDirectory,
      },
      { kind: 'generate' as const },
      { kind: 'verify' as const },
    ],
  };
};

export const executeDirectoryWorkflowCatalogPromotion = async ({
  generate,
  verify,
  ...options
}: {
  rootDirectory: string;
  exampleId: string;
  generate: () => Promise<void>;
  verify: () => Promise<void>;
}) => {
  const plan = await planDirectoryWorkflowCatalogPromotion(options);
  const move = plan.operations[0];

  if (!move || move.kind !== 'move-directory') {
    throw new Error('Promotion plan has no directory move');
  }

  const sourcePath = join(options.rootDirectory, move.from);
  const destinationPath = join(options.rootDirectory, move.to);
  return withWorkflowCatalogMutationLock({
    action: async () => {
      const snapshots = await snapshotGeneratedFiles(options.rootDirectory);
      await mkdir(dirname(destinationPath), { recursive: true });
      await rename(sourcePath, destinationPath);

      try {
        await generate();
        await verify();
      } catch (error) {
        const rollbackErrors: unknown[] = [];

        try {
          await restoreGeneratedFiles(options.rootDirectory, snapshots);
        } catch (rollbackError) {
          rollbackErrors.push(rollbackError);
        }

        try {
          await rename(destinationPath, sourcePath);
        } catch (rollbackError) {
          rollbackErrors.push(rollbackError);
        }

        if (rollbackErrors.length > 0) {
          throw new AggregateError(
            [error, ...rollbackErrors],
            'Workflow catalog promotion failed and rollback was incomplete',
          );
        }

        throw error;
      }

      return {
        changedPaths: [
          move.from,
          move.to,
          ...(await changedGeneratedPaths(options.rootDirectory, snapshots)),
        ],
      };
    },
    rootDirectory: options.rootDirectory,
  });
};
