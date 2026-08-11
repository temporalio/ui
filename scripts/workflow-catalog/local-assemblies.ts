import { randomUUID } from 'node:crypto';
import { readdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import { format, resolveConfig } from 'prettier';

import type { WorkflowCatalogRegistrationSource } from '../../src/lib/workflow-catalog/worker/registration-source.js';
import type { WorkflowCatalogExampleDefinition } from '../../src/lib/workflow-catalog/worker/registry.js';

const generatedHeader = '// GENERATED FILE. DO NOT EDIT.\n';
const localExamplesPath = 'workflow-catalog.local/examples';
const compareCodePoints = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

type LocalExample = {
  id: string;
  sourceFiles: string[];
  workflowType?: string;
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

    if (!/export\s+const\s+workflowCatalogExample\b/.test(source)) {
      throw new Error(
        `${relative(rootDirectory, examplePath)} must export workflowCatalogExample`,
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
export const localWorkflowCatalogSourceFiles = (
  examples: readonly LocalExample[],
): string[] => [...new Set(examples.flatMap(({ sourceFiles }) => sourceFiles))];

export const renderLocalWorkflowCatalogAssemblies = async (
  rootDirectory: string,
) => {
  const examples = await readLocalExamples(rootDirectory);
  const registrationImports = examples
    .map(
      ({ id }, index) =>
        `import { workflowCatalogExample as example${index} } from './examples/${id}/example.js';`,
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
  const sourceFiles = localWorkflowCatalogSourceFiles(examples)
    .map((path) => `    '${path}',`)
    .join('\n');
  const registration = `${generatedHeader}${registrationImports}
import type { WorkflowCatalogRegistrationSource } from '../src/lib/workflow-catalog/worker/registration-source.js';
import * as workflows from './workflows.js';

export const workflowCatalogRegistrationSource: WorkflowCatalogRegistrationSource = {
  source: { id: 'local', label: 'Local' },
  sourceFiles: [
${sourceFiles}
  ],
  register: (registry) => {
    registry.registerTarget({
      id: 'local-workflows',
      namespace: 'default',
      taskQueue: 'ui-workflow-catalog-local',
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
      filepath: join(rootDirectory, 'workflow-catalog.local/registration.ts'),
      singleQuote: true,
      trailingComma: 'all',
    }),
    workflows: await format(`${generatedHeader}${workflowExports}\n`, {
      ...prettierConfig,
      filepath: join(rootDirectory, 'workflow-catalog.local/workflows.ts'),
      singleQuote: true,
      trailingComma: 'all',
    }),
  };
};

export const loadLocalWorkflowCatalogRegistrationSource = async (
  rootDirectory: string,
): Promise<WorkflowCatalogRegistrationSource | undefined> => {
  const examples = await readLocalExamples(rootDirectory);
  if (examples.length === 0) return;
  const definitions = await Promise.all(
    examples.map(async ({ id }) => {
      const module = (await import(
        `${pathToFileURL(join(rootDirectory, localExamplesPath, id, 'example.ts')).href}?workflow-catalog=${randomUUID()}`
      )) as { workflowCatalogExample?: unknown };
      if (!module.workflowCatalogExample) {
        throw new Error(
          `${localExamplesPath}/${id}/example.ts must export workflowCatalogExample`,
        );
      }
      return module.workflowCatalogExample as WorkflowCatalogExampleDefinition;
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
    sourceFiles: localWorkflowCatalogSourceFiles(examples),
    register: (registry) => {
      registry.registerTarget({
        id: 'local-workflows',
        namespace: 'default',
        taskQueue: 'ui-workflow-catalog-local',
        workflowsPath: pathToFileURL(
          join(rootDirectory, 'workflow-catalog.local/workflows.ts'),
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

export const writeLocalWorkflowCatalogAssemblies = async (
  rootDirectory: string,
) => {
  const rendered = await renderLocalWorkflowCatalogAssemblies(rootDirectory);
  const registrationPath = join(
    rootDirectory,
    'workflow-catalog.local/registration.ts',
  );
  const workflowsPath = join(
    rootDirectory,
    'workflow-catalog.local/workflows.ts',
  );

  if (rendered.examples.length === 0) {
    const currentRegistration = await readFile(registrationPath, 'utf8').catch(
      () => '',
    );

    if (currentRegistration.startsWith(generatedHeader)) {
      await Promise.all([
        rm(registrationPath, { force: true }),
        rm(workflowsPath, { force: true }),
        rm(
          join(rootDirectory, 'workflow-catalog.local/catalog.generated.json'),
          {
            force: true,
          },
        ),
      ]);
    }

    return;
  }

  await Promise.all([
    writeAtomically(registrationPath, rendered.registration),
    writeAtomically(workflowsPath, rendered.workflows),
  ]);
};

export const verifyLocalWorkflowCatalogAssemblies = async (
  rootDirectory: string,
) => {
  const rendered = await renderLocalWorkflowCatalogAssemblies(rootDirectory);
  if (rendered.examples.length === 0) {
    const localPaths = [
      'workflow-catalog.local/registration.ts',
      'workflow-catalog.local/workflows.ts',
      'workflow-catalog.local/catalog.generated.json',
    ];
    const localOutputs = await Promise.all(
      localPaths.map(async (path) => ({
        content: await readFile(join(rootDirectory, path), 'utf8').catch(
          (error) => {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
              return undefined;
            }
            throw error;
          },
        ),
        path,
      })),
    );

    const [registration, workflows, artifact] = localOutputs;
    const generatedAssemblyExists = [registration, workflows].some(
      ({ content }) => content?.startsWith(generatedHeader),
    );
    const orphanedArtifactExists =
      artifact?.content !== undefined && registration?.content === undefined;

    if (generatedAssemblyExists || orphanedArtifactExists) {
      throw new Error(
        'Generated local workflow catalog outputs are stale; run ' +
          '"pnpm workflow-catalog generate"',
      );
    }

    return;
  }
  const expected = [
    {
      content: rendered.registration,
      path: 'workflow-catalog.local/registration.ts',
    },
    {
      content: rendered.workflows,
      path: 'workflow-catalog.local/workflows.ts',
    },
  ];

  for (const { content, path } of expected) {
    const actual = await readFile(join(rootDirectory, path), 'utf8').catch(
      () => '',
    );
    if (actual !== content) {
      throw new Error(`${path} is stale; run "pnpm workflow-catalog generate"`);
    }
  }
};
