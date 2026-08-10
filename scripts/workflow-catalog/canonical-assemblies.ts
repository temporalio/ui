import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

import { format, resolveConfig } from 'prettier';

const examplesPath = 'src/lib/workflow-catalog/worker/examples';
const indexPath = `${examplesPath}/index.ts`;
const workflowsPath = 'src/lib/workflow-catalog/worker/workflows.ts';
const generatedHeader = '// GENERATED FILE. DO NOT EDIT.\n';
const identifierPattern = /^[A-Za-z_$][\w$]*$/;
const compareCodePoints = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

type CanonicalExample = {
  id: string;
  kind: string;
  sourceFiles: string[];
  workflowType?: string;
};

type CatalogAssembly = {
  content: string;
  path: string;
};

const writeAtomically = async (path: string, content: string) => {
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, content);
  await rename(temporaryPath, path);
};

const regularFilesRecursively = async (
  rootDirectory: string,
  directory: string,
): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries.sort((left, right) =>
    compareCodePoints(left.name, right.name),
  )) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await regularFilesRecursively(rootDirectory, path)));
      continue;
    }

    if (!entry.isFile()) {
      throw new Error(
        `Workflow catalog example sources must be regular files: ${relative(rootDirectory, path)}`,
      );
    }

    files.push(relative(rootDirectory, path).split(sep).join('/'));
  }

  return files;
};

const readCanonicalExamples = async (
  rootDirectory: string,
): Promise<CanonicalExample[]> => {
  const directory = join(rootDirectory, examplesPath);
  const entries = await readdir(directory, { withFileTypes: true });
  const exampleDirectories = entries
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => compareCodePoints(left.name, right.name));
  const examples: CanonicalExample[] = [];

  for (const entry of exampleDirectories) {
    const exampleDirectory = join(directory, entry.name);
    const examplePath = join(exampleDirectory, 'example.ts');
    const source = await readFile(examplePath, 'utf8');

    if (!/export\s+const\s+workflowCatalogExample\b/.test(source)) {
      throw new Error(
        `${relative(rootDirectory, examplePath)} must export workflowCatalogExample`,
      );
    }

    const kind = /\bkind\s*:\s*['"]([^'"]+)['"]/.exec(source)?.[1];
    if (!kind) {
      throw new Error(
        `${relative(rootDirectory, examplePath)} must declare an execution kind`,
      );
    }

    const workflowType =
      kind === 'workflow'
        ? /\bworkflowType\s*:\s*['"]([^'"]+)['"]/.exec(source)?.[1]
        : undefined;

    if (kind === 'workflow') {
      if (!workflowType || !identifierPattern.test(workflowType)) {
        throw new Error(
          `${relative(rootDirectory, examplePath)} must declare a valid workflowType`,
        );
      }

      const workflowPath = join(exampleDirectory, 'workflow.ts');
      const workflow = await readFile(workflowPath, 'utf8');
      const exportedWorkflow = new RegExp(
        `\\bexport\\s+(?:(?:async\\s+)?function|const)\\s+${workflowType}\\b`,
      );

      if (!exportedWorkflow.test(workflow)) {
        throw new Error(
          `${relative(rootDirectory, workflowPath)} does not export workflow "${workflowType}"`,
        );
      }
    }

    examples.push({
      id: entry.name,
      kind,
      sourceFiles: await regularFilesRecursively(
        rootDirectory,
        exampleDirectory,
      ),
      workflowType,
    });
  }

  return examples;
};

export const renderCanonicalWorkflowCatalogAssemblies = async (
  rootDirectory: string,
): Promise<CatalogAssembly[]> => {
  const examples = await readCanonicalExamples(rootDirectory);
  const imports = examples
    .map(
      ({ id }, index) =>
        `import { workflowCatalogExample as example${index} } from './${id}/example.js';`,
    )
    .join('\n');
  const definitions = examples
    .map((_, index) => `  example${index},`)
    .join('\n');
  const sourceFiles = examples
    .flatMap(({ sourceFiles: files }) => files)
    .map((path) => `  '${path}',`)
    .join('\n');
  const workflowExports = examples
    .filter(
      (example): example is CanonicalExample & { workflowType: string } =>
        example.kind === 'workflow' && Boolean(example.workflowType),
    )
    .map(
      ({ id, workflowType }) =>
        `export { ${workflowType} } from './examples/${id}/workflow.js';`,
    )
    .join('\n');
  const index = `${generatedHeader}import type {
  WorkflowCatalogExampleDefinition,
  WorkflowCatalogExampleRegistration,
  WorkflowImplementation,
} from '../registry.js';
${imports}

const sharedWorkflowDefinitions = [
${definitions}
] satisfies readonly WorkflowCatalogExampleDefinition[];

export const sharedWorkflowExamples: readonly WorkflowCatalogExampleRegistration[] =
  sharedWorkflowDefinitions.map((example) => ({
    ...example,
    targetId: 'shared-workflows',
  }));

const seenExampleIds = new Set<string>();
for (const example of sharedWorkflowExamples) {
  if (seenExampleIds.has(example.id)) {
    throw new Error(\`Duplicate workflow catalog example id "\${example.id}"\`);
  }
  seenExampleIds.add(example.id);
}

export const sharedWorkflowExports: Readonly<
  Record<string, WorkflowImplementation>
> = (() => {
  const workflowExports: Record<string, WorkflowImplementation> = {};

  for (const example of sharedWorkflowExamples) {
    if (example.execution.kind !== 'workflow') continue;
    const existing = workflowExports[example.execution.workflowType];

    if (existing && existing !== example.execution.workflow) {
      throw new Error(
        \`Workflow type "\${example.execution.workflowType}" maps to different workflow implementations\`,
      );
    }

    workflowExports[example.execution.workflowType] = example.execution.workflow;
  }

  return workflowExports;
})();

export const sharedWorkflowSourceFiles = [
  '${indexPath}',
  '${examplesPath}/shared-activities.ts',
${sourceFiles}
] as const;

export { sharedWorkflowCorpusInventory } from './inventory.js';
`;
  const prettierConfig =
    (await resolveConfig(join(rootDirectory, 'package.json'))) ?? {};

  return [
    {
      content: await format(index, {
        ...prettierConfig,
        filepath: join(rootDirectory, indexPath),
        singleQuote: true,
        trailingComma: 'all',
      }),
      path: indexPath,
    },
    {
      content: await format(`${generatedHeader}${workflowExports}\n`, {
        ...prettierConfig,
        filepath: join(rootDirectory, workflowsPath),
        singleQuote: true,
        trailingComma: 'all',
      }),
      path: workflowsPath,
    },
  ];
};

export const writeCanonicalWorkflowCatalogAssemblies = async (
  rootDirectory: string,
) => {
  const assemblies =
    await renderCanonicalWorkflowCatalogAssemblies(rootDirectory);
  await Promise.all(
    assemblies.map(({ content, path }) =>
      writeAtomically(join(rootDirectory, path), content),
    ),
  );
};

export const verifyCanonicalWorkflowCatalogAssemblies = async (
  rootDirectory: string,
) => {
  const assemblies =
    await renderCanonicalWorkflowCatalogAssemblies(rootDirectory);

  for (const { content, path } of assemblies) {
    const actual = await readFile(join(rootDirectory, path), 'utf8').catch(
      () => '',
    );

    if (actual !== content) {
      throw new Error(`${path} is stale; run "pnpm workflow-catalog generate"`);
    }
  }
};
