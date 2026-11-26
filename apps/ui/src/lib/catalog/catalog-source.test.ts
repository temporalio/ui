import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import {
  type CatalogAuthoringSource,
  type CatalogAuthoringWorkspace,
  discoverCatalogSource,
  loadCatalogSource,
  renderCatalogSourceAssembly,
} from './authoring';
import type { CatalogRegistrationSource } from './worker/registration-source';
import { createCatalogRegistry, generateCatalog } from './worker/registry';
import { createInRepoTemporaryDirectory } from '../../../scripts/catalog/test-temp-root';

const registrationModule = resolve(
  'src/lib/catalog/worker/registration-source.ts',
);
const files = {
  example: 'example.ts',
  workflow: 'workflow.ts',
  workspace: 'workspace.ts',
};

const workbenchSource: CatalogAuthoringSource = {
  examplesPath: 'workbench',
  id: 'workbench',
  label: 'Workbench',
  registrationOutputPath: 'workbench-registration.ts',
  registrationModulePath: 'registration-source.ts',
  files,
};
const workbenchWorkspace: CatalogAuthoringWorkspace = {
  defaultNamespace: 'default',
  defaultTaskQueue: 'workbench',
  id: 'workbench',
  sourceId: 'workbench',
  workflowsModulePath: 'workbench-workflows.ts',
};
const demoSource: CatalogAuthoringSource = {
  ...workbenchSource,
  examplesPath: 'demos',
  id: 'demos',
  label: 'Demos',
  registrationOutputPath: 'demos-registration.ts',
};
const demoWorkspace: CatalogAuthoringWorkspace = {
  defaultNamespace: 'default',
  defaultTaskQueue: 'playground',
  grouping: 'per-folder',
  id: 'playground',
  sourceId: 'demos',
  workflowsModulePath: 'demos-workflows.ts',
};

const workflowExample = (id: string, workflowType: string) =>
  [
    `import { ${workflowType} } from './workflow.js';`,
    '',
    'export const catalogExample = {',
    `  id: '${id}',`,
    `  title: '${id}',`,
    `  description: 'Runs ${id}.',`,
    '  capabilityTags: [],',
    '  expectedEvidence: [],',
    "  input: { defaultValue: [], schema: { type: 'array' } },",
    "  startOptions: { defaultValue: {}, schema: { type: 'object' } },",
    '  execution: {',
    "    kind: 'workflow' as const,",
    `    workflowType: '${workflowType}',`,
    `    workflow: ${workflowType},`,
    '    activities: {},',
    '  },',
    '};',
    '',
  ].join('\n');

const activityExample = (id: string) =>
  [
    'export const catalogExample = {',
    `  id: '${id}',`,
    `  title: '${id}',`,
    `  description: 'Runs ${id}.',`,
    '  capabilityTags: [],',
    '  expectedEvidence: [],',
    "  input: { defaultValue: {}, schema: { type: 'object' } },",
    "  startOptions: { defaultValue: {}, schema: { type: 'object' } },",
    '  execution: {',
    "    kind: 'standalone-activity' as const,",
    "    activityType: 'greet',",
    "    activity: async () => 'hello',",
    '    timeouts: {},',
    '    policies: {},',
    '  },',
    '};',
    '',
  ].join('\n');

const workflowModule = (workflowType: string) =>
  `export async function ${workflowType}(): Promise<string> {\n  return '${workflowType}';\n}\n`;

const workspaceModule = (fields: string) =>
  `export const catalogWorkspace = { ${fields} };\n`;

const projectFiles: Record<string, string> = {
  'registration-source.ts': `export * from '${pathToFileURL(registrationModule).href}';\n`,
  'workbench/workspace.ts': workspaceModule("title: 'Workbench'"),
  'workbench/hello/example.ts': workflowExample('hello', 'helloWorkflow'),
  'workbench/hello/workflow.ts': workflowModule('helloWorkflow'),
  'workbench/greeting/example.ts': activityExample('greeting'),
  'demos/money-transfer/example.ts': workflowExample(
    'money-transfer',
    'demoWorkflow',
  ),
  'demos/money-transfer/workflow.ts': workflowModule('demoWorkflow'),
  'demos/money-transfer/workspace.ts': workspaceModule(
    "title: 'Money transfer', controls: ['crash']",
  ),
  'demos/order-saga/example.ts': workflowExample('order-saga', 'demoWorkflow'),
  'demos/order-saga/workflow.ts': workflowModule('demoWorkflow'),
};

let rootDirectory: string;

const writeProject = async (overrides: Record<string, string | null> = {}) => {
  rootDirectory = await createInRepoTemporaryDirectory('catalog-source-');
  for (const [path, content] of Object.entries({
    ...projectFiles,
    ...overrides,
  })) {
    if (content === null) continue;
    await mkdir(dirname(join(rootDirectory, path)), { recursive: true });
    await writeFile(join(rootDirectory, path), content);
  }
};

const sources = [
  [workbenchSource, workbenchWorkspace],
  [demoSource, demoWorkspace],
] as const;

const loadSources = () =>
  Promise.all(
    sources.map(async ([source, workspace]) =>
      loadCatalogSource({
        discovered: await discoverCatalogSource({ rootDirectory, source }),
        rootDirectory,
        source,
        workspace,
      }),
    ),
  );

const renderAndImportSources = () =>
  Promise.all(
    sources.map(async ([source, workspace]) => {
      const artifacts = renderCatalogSourceAssembly({
        discovered: await discoverCatalogSource({ rootDirectory, source }),
        source,
        workspace,
      });
      for (const artifact of artifacts) {
        if (artifact.delete) continue;
        await writeFile(join(rootDirectory, artifact.path), artifact.content);
      }
      const module = (await import(
        pathToFileURL(join(rootDirectory, source.registrationOutputPath)).href
      )) as { catalogRegistrationSource: CatalogRegistrationSource };
      return module.catalogRegistrationSource;
    }),
  );

const summarize = (
  registrationSources: readonly CatalogRegistrationSource[],
) => {
  const registry = createCatalogRegistry();
  for (const registrationSource of registrationSources) {
    registrationSource.register(registry);
  }
  const { browserWorkspaces, workerBindings } = generateCatalog(registry);

  return {
    browserWorkspaces,
    workspaces: workerBindings.map(({ workspace, examples }) => ({
      id: workspace.id,
      taskQueue: workspace.taskQueue,
      workflowsModule: workspace.workflowsPath
        .slice(
          workspace.workflowsPath.indexOf(`${basename(rootDirectory)}/`) +
            basename(rootDirectory).length +
            1,
        )
        .replace(/\.(?:js|ts)$/, ''),
      workflowTypes: Object.keys(workspace.workflowExports),
      examples: examples.map(({ id }) => id),
    })),
  };
};

afterEach(async () => {
  await rm(rootDirectory, { force: true, recursive: true });
});

describe('catalog sources', () => {
  it('discovers only the declared files in each folder', async () => {
    await writeProject();

    const discovered = await discoverCatalogSource({
      rootDirectory,
      source: workbenchSource,
    });

    expect(discovered.workspacePath).toBe('workbench/workspace.ts');
    expect(discovered.folders).toEqual([
      {
        id: 'greeting',
        examplePath: 'workbench/greeting/example.ts',
        workflowPath: undefined,
        workspacePath: undefined,
        sourceFiles: ['workbench/greeting/example.ts'],
      },
      {
        id: 'hello',
        examplePath: 'workbench/hello/example.ts',
        workflowPath: 'workbench/hello/workflow.ts',
        workspacePath: undefined,
        sourceFiles: [
          'workbench/hello/example.ts',
          'workbench/hello/workflow.ts',
        ],
      },
    ]);
  });

  it('runs a shared source on one workspace and a per-folder source on one workspace per folder', async () => {
    await writeProject();

    expect(summarize(await loadSources())).toEqual({
      browserWorkspaces: [
        { id: 'workbench', title: 'Workbench' },
        {
          id: 'playground-money-transfer',
          title: 'Money transfer',
          controls: ['crash'],
        },
        { id: 'playground-order-saga' },
      ],
      workspaces: [
        {
          id: 'workbench',
          taskQueue: 'workbench',
          workflowsModule: 'workbench-workflows',
          workflowTypes: ['helloWorkflow'],
          examples: ['greeting', 'hello'],
        },
        {
          id: 'playground-money-transfer',
          taskQueue: 'playground-money-transfer',
          workflowsModule: 'demos/money-transfer/workflow',
          workflowTypes: ['demoWorkflow'],
          examples: ['money-transfer'],
        },
        {
          id: 'playground-order-saga',
          taskQueue: 'playground-order-saga',
          workflowsModule: 'demos/order-saga/workflow',
          workflowTypes: ['demoWorkflow'],
          examples: ['order-saga'],
        },
      ],
    });
  });

  it('registers the same workspaces from the generated modules as from the loader', async () => {
    await writeProject();

    const loaded = summarize(await loadSources());
    const generated = summarize(await renderAndImportSources());

    expect(generated).toEqual(loaded);
  });

  it('adds a workspace when a folder is added, with no other change', async () => {
    await writeProject({
      'demos/expense-approval/example.ts': workflowExample(
        'expense-approval',
        'demoWorkflow',
      ),
      'demos/expense-approval/workflow.ts': workflowModule('demoWorkflow'),
    });

    expect(
      summarize(await loadSources()).workspaces.map(({ id }) => id),
    ).toEqual([
      'workbench',
      'playground-expense-approval',
      'playground-money-transfer',
      'playground-order-saga',
    ]);
  });

  it('renders a shared workflows module that re-exports each folder', async () => {
    await writeProject();

    const [registration, workflows] = renderCatalogSourceAssembly({
      discovered: await discoverCatalogSource({
        rootDirectory,
        source: workbenchSource,
      }),
      source: workbenchSource,
      workspace: workbenchWorkspace,
    });

    expect(String(workflows.content)).toBe(
      "// GENERATED FILE. DO NOT EDIT.\nexport * from './workbench/hello/workflow.js';\n",
    );
    expect(String(registration.content)).toContain(
      "import { type CatalogRegistrationSource, registerCatalogSource } from './registration-source.js';",
    );
  });

  it('writes .ts import specifiers when asked', async () => {
    await writeProject();

    const [registration] = renderCatalogSourceAssembly({
      discovered: await discoverCatalogSource({
        rootDirectory,
        source: demoSource,
      }),
      importExtension: '.ts',
      source: demoSource,
      workspace: demoWorkspace,
    });

    expect(String(registration.content)).toContain(
      "import * as workflows0 from './demos/money-transfer/workflow.ts';",
    );
    expect(String(registration.content)).not.toContain(".js'");
  });

  it('rejects a folder without its example file', async () => {
    await writeProject({ 'demos/order-saga/example.ts': null });

    await expect(
      discoverCatalogSource({ rootDirectory, source: demoSource }),
    ).rejects.toThrow(
      'Catalog example folder is missing demos/order-saga/example.ts',
    );
  });

  it('rejects folder metadata in a shared source', async () => {
    await writeProject({
      'workbench/hello/workspace.ts': workspaceModule("title: 'Hello'"),
    });

    const loaded = await loadSources();

    expect(() => summarize(loaded)).toThrow(
      'Catalog folder "hello" describes a workspace, but workspace "workbench" is shared',
    );
  });

  it('rejects source metadata in a per-folder source', async () => {
    await writeProject({
      'demos/workspace.ts': workspaceModule("title: 'Demos'"),
    });

    const loaded = await loadSources();

    expect(() => summarize(loaded)).toThrow(
      'Catalog workspace "playground" groups per folder, so each folder describes its own workspace',
    );
  });

  it('rejects two folders that export the same workflow name into a shared workspace', async () => {
    await writeProject({
      'workbench/hello-again/example.ts': workflowExample(
        'hello-again',
        'helloWorkflow',
      ),
      'workbench/hello-again/workflow.ts': workflowModule('helloWorkflow'),
    });

    const loaded = await loadSources();

    expect(() => summarize(loaded)).toThrow(
      'Catalog workflow export "helloWorkflow" is defined by more than one folder in workspace "workbench"',
    );
  });
});
