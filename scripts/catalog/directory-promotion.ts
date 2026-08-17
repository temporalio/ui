import { access, lstat, readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

import {
  createSourceFile,
  forEachChild,
  isCallExpression,
  isExportDeclaration,
  isExternalModuleReference,
  isIdentifier,
  isImportDeclaration,
  isImportEqualsDeclaration,
  isStringLiteral,
  type Node,
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
} from 'typescript';

import { validateExampleId } from './scaffold.js';

const localExamplesPath = 'catalog.local/examples';
const sharedExamplesPath = 'src/lib/catalog/worker/examples';
const pathExists = async (path: string) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

export const parseCatalogTypeScriptModuleSpecifiers = ({
  filePath,
  source,
}: {
  filePath: string;
  source: string;
}) => {
  const sourceFile = createSourceFile(
    filePath,
    source,
    ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ScriptKind.TSX : ScriptKind.TS,
  );
  const moduleSpecifiers: string[] = [];
  const collectModuleSpecifiers = (node: Node) => {
    let specifier: Node | undefined;
    let moduleLoadingCall = false;
    if (isImportDeclaration(node) || isExportDeclaration(node)) {
      specifier = node.moduleSpecifier;
    } else if (
      isImportEqualsDeclaration(node) &&
      isExternalModuleReference(node.moduleReference)
    ) {
      specifier = node.moduleReference.expression;
    } else if (isCallExpression(node)) {
      moduleLoadingCall =
        node.expression.kind === SyntaxKind.ImportKeyword ||
        (isIdentifier(node.expression) && node.expression.text === 'require');
      if (moduleLoadingCall) specifier = node.arguments[0];
    }
    if (moduleLoadingCall && (!specifier || !isStringLiteral(specifier))) {
      throw new Error(`${filePath} module loading must use a string literal`);
    }
    if (specifier && isStringLiteral(specifier)) {
      moduleSpecifiers.push(specifier.text);
    }
    forEachChild(node, collectModuleSpecifiers);
  };
  collectModuleSpecifiers(sourceFile);
  return moduleSpecifiers;
};

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
          `Catalog example sources must be regular files: ${relative(rootDirectory, path)}`,
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

  if (!/export\s+const\s+catalogExample\b/.test(example)) {
    throw new Error(
      `${relative(rootDirectory, examplePath)} must export catalogExample`,
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
    const moduleSpecifiers = parseCatalogTypeScriptModuleSpecifiers({
      filePath: file,
      source,
    });

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

export const planDirectoryCatalogPromotion = async ({
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
      `${sourceDirectory} must contain example.ts and workflow.ts`,
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
