import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { format, resolveConfig } from 'prettier';

import type { CatalogRegistrationSource } from '../../src/lib/catalog/worker/registration-source.js';
import type { CatalogExampleDefinition } from '../../src/lib/catalog/worker/registry.js';

const generatedHeader = '// GENERATED FILE. DO NOT EDIT.\n';
const localExamplesPath = 'catalog.local/examples';
const compareCodePoints = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

type LocalExample = {
  id: string;
  sourceFiles: string[];
  workflowType?: string;
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

const readLocalExamples = async (
  rootDirectory: string,
): Promise<LocalExample[]> => {
  const examplesDirectory = join(rootDirectory, localExamplesPath);
  const entries = await readdir(examplesDirectory, {
    withFileTypes: true,
  }).catch(() => []);
  const examples: LocalExample[] = [];

  for (const entry of entries
    .filter((candidate) => candidate.isDirectory())
    .sort((left, right) => compareCodePoints(left.name, right.name))) {
    const directory = join(examplesDirectory, entry.name);
    const examplePath = join(directory, 'example.ts');
    const source = await readFile(examplePath, 'utf8');

    if (!/export\s+const\s+catalogExample\b/.test(source)) {
      throw new Error(
        `${relative(rootDirectory, examplePath)} must export catalogExample`,
      );
    }

    const kind = /\bkind\s*:\s*['"]([^'"]+)['"]/.exec(source)?.[1];
    const workflowType =
      kind === 'workflow'
        ? /\bworkflowType\s*:\s*['"]([^'"]+)['"]/.exec(source)?.[1]
        : undefined;

    if (kind === 'workflow' && !workflowType) {
      throw new Error(
        `${relative(rootDirectory, examplePath)} must declare a valid workflowType`,
      );
    }

    examples.push({
      id: entry.name,
      sourceFiles: await regularFilesRecursively(rootDirectory, directory),
      workflowType,
    });
  }

  return examples;
};

/**
 * Authored files only. The generated assemblies (registration.ts and
 * workflows.ts) are outputs, not sources; declaring them here would require
 * them to exist before the first example could be generated.
 */
export const localCatalogSourceFiles = (
  examples: readonly LocalExample[],
): string[] => [...new Set(examples.flatMap(({ sourceFiles }) => sourceFiles))];

export const renderLocalCatalogAssemblies = async (rootDirectory: string) => {
  const examples = await readLocalExamples(rootDirectory);
  const registrationImports = examples
    .map(
      ({ id }, index) =>
        `import { catalogExample as example${index} } from './examples/${id}/example.js';`,
    )
    .join('\n');
  const workflowExports = examples
    .filter((example): example is LocalExample & { workflowType: string } =>
      Boolean(example.workflowType),
    )
    .map(
      ({ id, workflowType }) =>
        `export { ${workflowType} } from './examples/${id}/workflow.js';`,
    )
    .join('\n');
  const registrations = examples
    .map(
      (_, index) =>
        `    registry.registerExample({ ...example${index}, targetId: 'local-workflows' });`,
    )
    .join('\n');
  const sourceFiles = localCatalogSourceFiles(examples)
    .map((path) => `    '${path}',`)
    .join('\n');
  const registration = `${generatedHeader}${registrationImports}
import * as workflows from './workflows.js';
import type { CatalogRegistrationSource } from '../src/lib/catalog/worker/registration-source.js';

export const catalogRegistrationSource: CatalogRegistrationSource = {
  source: { id: 'local', label: 'Local' },
  sourceFiles: [
${sourceFiles}
  ],
  register: (registry) => {
    registry.registerTarget({
      id: 'local-workflows',
      namespace: 'default',
      taskQueue: 'ui-catalog-local',
      workflowsPath: new URL('./workflows.ts', import.meta.url).href,
      workflowExports: { ...workflows },
    });
${registrations}
  },
};
`;
  const prettierConfig =
    (await resolveConfig(join(rootDirectory, 'package.json'))) ?? {};

  return {
    examples,
    registration: await format(registration, {
      ...prettierConfig,
      filepath: join(rootDirectory, 'catalog.local/registration.ts'),
      singleQuote: true,
      trailingComma: 'all',
    }),
    workflows: await format(`${generatedHeader}${workflowExports}\n`, {
      ...prettierConfig,
      filepath: join(rootDirectory, 'catalog.local/workflows.ts'),
      singleQuote: true,
      trailingComma: 'all',
    }),
  };
};

export const loadLocalCatalogRegistrationSource = async (
  rootDirectory: string,
): Promise<CatalogRegistrationSource | undefined> => {
  const examples = await readLocalExamples(rootDirectory);
  if (examples.length === 0) return;
  const definitions = await Promise.all(
    examples.map(async ({ id }) => {
      const module = (await import(
        `${pathToFileURL(join(rootDirectory, localExamplesPath, id, 'example.ts')).href}?catalog=${randomUUID()}`
      )) as { catalogExample?: unknown };
      if (!module.catalogExample) {
        throw new Error(
          `${localExamplesPath}/${id}/example.ts must export catalogExample`,
        );
      }
      return module.catalogExample as CatalogExampleDefinition;
    }),
  );
  const workflowExports = Object.fromEntries(
    definitions.flatMap((definition) =>
      definition.execution.kind === 'workflow'
        ? [[definition.execution.workflowType, definition.execution.workflow]]
        : [],
    ),
  );
  return {
    source: { id: 'local', label: 'Local' },
    sourceFiles: localCatalogSourceFiles(examples),
    register: (registry) => {
      registry.registerTarget({
        id: 'local-workflows',
        namespace: 'default',
        taskQueue: 'ui-catalog-local',
        workflowsPath: pathToFileURL(
          join(rootDirectory, 'catalog.local/workflows.ts'),
        ).href,
        workflowExports,
      });
      for (const definition of definitions) {
        registry.registerExample({
          ...definition,
          targetId: 'local-workflows',
        });
      }
    },
  };
};
