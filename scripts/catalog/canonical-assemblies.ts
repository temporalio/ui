import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { format, resolveConfig } from 'prettier';
import {
  createSourceFile,
  type Expression,
  isAsExpression,
  isIdentifier,
  isObjectLiteralExpression,
  isParenthesizedExpression,
  isPropertyAssignment,
  isSatisfiesExpression,
  isShorthandPropertyAssignment,
  isStringLiteral,
  isVariableStatement,
  NodeFlags,
  ScriptKind,
  ScriptTarget,
} from 'typescript';

import type { CatalogRegistrationSource } from '../../src/lib/catalog/worker/registration-source.js';
import {
  type CatalogExampleDefinition,
  resolveCatalogWorkflowExecution,
} from '../../src/lib/catalog/worker/registry.js';

const examplesPath = 'src/lib/catalog/worker/examples';
const indexPath = `${examplesPath}/index.ts`;
const workflowsPath = 'src/lib/catalog/worker/workflows.ts';
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

const unwrapExpression = (expression: Expression): Expression => {
  if (
    isAsExpression(expression) ||
    isSatisfiesExpression(expression) ||
    isParenthesizedExpression(expression)
  )
    return unwrapExpression(expression.expression);
  return expression;
};

const resolveExpression = (
  expression: Expression | undefined,
  constants: ReadonlyMap<string, Expression>,
  ancestors = new Set<string>(),
): Expression | undefined => {
  if (!expression) return;
  const value = unwrapExpression(expression);
  if (!isIdentifier(value)) return value;
  if (ancestors.has(value.text)) return;
  ancestors.add(value.text);
  return resolveExpression(constants.get(value.text), constants, ancestors);
};

const objectField = (
  expression: Expression | undefined,
  name: string,
  constants: ReadonlyMap<string, Expression>,
): Expression | undefined => {
  const object = resolveExpression(expression, constants);
  if (!object || !isObjectLiteralExpression(object)) return;
  for (const property of [...object.properties].reverse()) {
    if (
      (isPropertyAssignment(property) ||
        isShorthandPropertyAssignment(property)) &&
      (isIdentifier(property.name) || isStringLiteral(property.name)) &&
      property.name.text === name
    ) {
      return resolveExpression(
        isPropertyAssignment(property) ? property.initializer : property.name,
        constants,
      );
    }
  }
};

export const resolveCatalogSourceExecution = (
  source: string,
  filePath: string,
) => {
  const sourceFile = createSourceFile(
    filePath,
    source,
    ScriptTarget.Latest,
    true,
    ScriptKind.TS,
  );
  const constants = new Map<string, Expression>();
  for (const statement of sourceFile.statements) {
    if (
      !isVariableStatement(statement) ||
      !(statement.declarationList.flags & NodeFlags.Const)
    )
      continue;
    for (const declaration of statement.declarationList.declarations) {
      if (isIdentifier(declaration.name) && declaration.initializer) {
        constants.set(declaration.name.text, declaration.initializer);
      }
    }
  }
  const definition = constants.get('catalogExample');
  const execution = objectField(definition, 'execution', constants);
  const kindField = objectField(execution, 'kind', constants);
  const kind =
    kindField && isStringLiteral(kindField) ? kindField.text : undefined;
  if (!kind) throw new Error(`${filePath} must declare an execution kind`);
  let workflow = execution;
  if (kind === 'schedule') {
    workflow = objectField(execution, 'action', constants);
    const actionKind = objectField(workflow, 'kind', constants);
    if (
      !actionKind ||
      !isStringLiteral(actionKind) ||
      actionKind.text !== 'workflow'
    ) {
      throw new Error(`${filePath} must declare a workflow schedule action`);
    }
  }
  if (kind !== 'workflow' && kind !== 'schedule') return { kind };
  const workflowTypeField = objectField(workflow, 'workflowType', constants);
  const workflowType =
    workflowTypeField && isStringLiteral(workflowTypeField)
      ? workflowTypeField.text
      : undefined;
  if (!workflowType || !identifierPattern.test(workflowType)) {
    throw new Error(`${filePath} must declare a valid workflowType`);
  }
  return { kind, workflowType };
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
        `Catalog example sources must be regular files: ${relative(rootDirectory, path)}`,
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

    if (!/export\s+const\s+catalogExample\b/.test(source)) {
      throw new Error(
        `${relative(rootDirectory, examplePath)} must export catalogExample`,
      );
    }

    const { kind, workflowType } = resolveCatalogSourceExecution(
      source,
      relative(rootDirectory, examplePath),
    );

    if (workflowType) {
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

export const renderCanonicalCatalogAssemblies = async (
  rootDirectory: string,
): Promise<CatalogAssembly[]> => {
  const examples = await readCanonicalExamples(rootDirectory);
  const imports = examples
    .map(
      ({ id }, index) =>
        `import { catalogExample as example${index} } from './${id}/example.js';`,
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
    .filter((example): example is CanonicalExample & { workflowType: string } =>
      Boolean(example.workflowType),
    )
    .map(
      ({ id, workflowType }) =>
        `export { ${workflowType} } from './examples/${id}/workflow.js';`,
    )
    .join('\n');
  const index = `${generatedHeader}import {
  type CatalogExampleDefinition,
  type CatalogExampleRegistration,
  resolveCatalogWorkflowExecution,
  type WorkflowImplementation,
} from '../registry.js';
${imports}

const sharedWorkflowDefinitions = [
${definitions}
] satisfies readonly CatalogExampleDefinition[];

export const sharedWorkflowExamples: readonly CatalogExampleRegistration[] =
  sharedWorkflowDefinitions.map((example) => ({
    ...example,
    targetId: 'shared-workflows',
  }));

const seenExampleIds = new Set<string>();
for (const example of sharedWorkflowExamples) {
  if (seenExampleIds.has(example.id)) {
    throw new Error(\`Duplicate catalog example id "\${example.id}"\`);
  }
  seenExampleIds.add(example.id);
}

export const sharedWorkflowExports: Readonly<
  Record<string, WorkflowImplementation>
> = (() => {
  const workflowExports: Record<string, WorkflowImplementation> = {};

  for (const example of sharedWorkflowExamples) {
    const workflow = resolveCatalogWorkflowExecution(example.execution);
    if (!workflow) continue;
    const existing = workflowExports[workflow.workflowType];

    if (existing && existing !== workflow.workflow) {
      throw new Error(
        \`Workflow type "\${workflow.workflowType}" maps to different workflow implementations\`,
      );
    }

    workflowExports[workflow.workflowType] = workflow.workflow;
  }

  return workflowExports;
})();

export const sharedWorkflowSourceFiles = [
  '${indexPath}',
  '${examplesPath}/shared-activities.ts',
${sourceFiles}
] as const;

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

export const loadCanonicalCatalogRegistrationSource = async (
  rootDirectory: string,
): Promise<CatalogRegistrationSource> => {
  const examples = await readCanonicalExamples(rootDirectory);
  const definitions = await Promise.all(
    examples.map(async ({ id }) => {
      const module = (await import(
        `${pathToFileURL(join(rootDirectory, examplesPath, id, 'example.ts')).href}?catalog=${randomUUID()}`
      )) as { catalogExample?: unknown };
      if (!module.catalogExample) {
        throw new Error(
          `${examplesPath}/${id}/example.ts must export catalogExample`,
        );
      }
      return module.catalogExample as CatalogExampleDefinition;
    }),
  );
  const workflowExports = Object.fromEntries(
    definitions.flatMap((definition) => {
      const workflow = resolveCatalogWorkflowExecution(definition.execution);
      return workflow ? [[workflow.workflowType, workflow.workflow]] : [];
    }),
  );
  return {
    source: { id: 'oss', label: 'OSS' },
    sourceFiles: [
      'src/lib/catalog/worker/shared-registrations.ts',
      workflowsPath,
      `${examplesPath}/inventory.ts`,
      indexPath,
      `${examplesPath}/shared-activities.ts`,
      ...new Set(examples.flatMap(({ sourceFiles }) => sourceFiles)),
    ],
    register: (registry) => {
      registry.registerTarget({
        id: 'shared-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog',
        workflowsPath: pathToFileURL(join(rootDirectory, workflowsPath)).href,
        workflowExports,
      });
      for (const definition of definitions) {
        registry.registerExample({
          ...definition,
          targetId: 'shared-workflows',
        });
      }
    },
  };
};
