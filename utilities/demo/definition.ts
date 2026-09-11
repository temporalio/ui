import { existsSync, readdirSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

import { z } from 'zod';

import { requireWorkflowExample } from './catalog';
import { exampleEntrySchema } from './examples';

export const STAGES = ['server', 'worker', 'ui', 'scenarios'] as const;

export type Stage = (typeof STAGES)[number];

const dynamicConfigValue = z.union([z.boolean(), z.number(), z.string()]);

const serverSchema = z
  .object({
    enabled: z.boolean().default(true),
    source: z.enum(['auto', 'cli', 'workspace', 'binary']).default('auto'),
    version: z.string().default('latest'),
    path: z.string().optional(),
    /**
     * Where the Temporal checkouts live. These belong to the machine, not to
     * the feature, so they normally come from TEMPORAL_CLI_REPO and
     * TEMPORAL_SERVER_REPO rather than from a definition.
     */
    cliRepo: z.string().optional(),
    serverRepo: z.string().optional(),
    serverRef: z.string().optional(),
    requires: z
      .object({
        serverCommit: z.string().optional(),
        /**
         * Refs to build the dev server from. Both default to main, because the
         * two repositories share one dependency graph in the workspace and a
         * pair from different times does not compile. serverCommit is a floor,
         * not a build target: the fetched server is checked to contain it.
         */
        serverRef: z.string().default('main'),
        cliRef: z.string().default('main'),
        minServerVersion: z.string().optional(),
      })
      .prefault({}),
    port: z.number().int().default(7233),
    uiPort: z.number().int().default(8233),
    httpPort: z.number().int().optional(),
    logLevel: z
      .enum(['debug', 'info', 'warn', 'error', 'never'])
      .default('warn'),
    dbFilename: z.string().optional(),
    namespace: z.string().default('default'),
    dynamicConfig: z.record(z.string(), dynamicConfigValue).default({}),
    searchAttributes: z.record(z.string(), z.string()).default({}),
  })
  .prefault({});

const workerSchema = z
  .object({
    enabled: z.boolean().default(true),
    /** Limit the catalog worker to one registered target. */
    targetId: z.string().optional(),
    readyTimeoutMs: z.number().int().default(120_000),
  })
  .prefault({});

const uiSchema = z
  .object({
    enabled: z.boolean().default(true),
    uiServer: z.boolean().default(true),
    web: z.boolean().default(true),
    apiPort: z.number().int().default(8081),
    webPort: z.number().int().default(3000),
    rebuildUiServer: z.boolean().default(false),
  })
  .prefault({});

export const definitionSchema = z.object({
  name: z.string(),
  title: z.string(),
  feature: z.string().optional(),
  summary: z.string().optional(),
  server: serverSchema,
  worker: workerSchema,
  ui: uiSchema,
  /** Catalog examples this demo starts. */
  examples: z.array(exampleEntrySchema).default([]),
  /** Options for this demo's own scenario.ts, when it has one. */
  scenario: z.record(z.string(), z.unknown()).default({}),
  preview: z.object({ notes: z.array(z.string()).default([]) }).prefault({}),
});

export type Definition = z.infer<typeof definitionSchema>;

/**
 * What a scenario's definition.ts writes. Everything with a default is
 * optional, and the compiler checks the rest, so a definition needs no schema
 * of its own and a mistyped key does not reach a run.
 */
export type DefinitionInput = z.input<typeof definitionSchema>;

/** Declares a scenario. Applies the defaults and reports a bad shape at once. */
export const defineScenario = (input: DefinitionInput): Definition => {
  const parsed = definitionSchema.safeParse(input);

  if (!parsed.success) {
    throw new Error(
      `"${input.name ?? 'unnamed'}" is not a valid scenario definition:\n${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
};
export type ServerDefinition = Definition['server'];
export type WorkerDefinition = Definition['worker'];
export type UiDefinition = Definition['ui'];
export type ExampleDefinition = Definition['examples'][number];

export const expandPath = (value: string): string =>
  value.startsWith('~') ? join(homedir(), value.slice(1)) : value;

/** A scenario's own behaviour file, beside its definition, if it has one. */
export const ownScenarioPath = (name: string, cwd = process.cwd()) =>
  join(scenarioDirectory(name, cwd), 'scenario.ts');

export const hasOwnScenario = (name: string, cwd = process.cwd()) =>
  existsSync(ownScenarioPath(name, cwd));

const hasWork = (data: Definition, cwd: string) =>
  data.examples.length > 0 || hasOwnScenario(data.name, cwd);

export const SCENARIOS_DIR = join('utilities', 'demo', 'scenarios');

/** A scenario is a directory holding its definition and its own behaviour. */
export const scenarioDirectory = (name: string, cwd = process.cwd()) =>
  resolve(cwd, SCENARIOS_DIR, name);

export const definitionPath = (name: string, cwd = process.cwd()) =>
  join(scenarioDirectory(name, cwd), 'definition.ts');

const importDefinition = async (path: string): Promise<Definition> => {
  const module = (await import(pathToFileURL(path).href)) as {
    definition?: Definition;
  };

  if (!module.definition) {
    throw new Error(`${path} must export a "definition".`);
  }

  return module.definition;
};

/**
 * A definition is a module, so the compiler checks its shape and the options it
 * passes to its scenario. Nothing here validates what the compiler already has.
 */
export const loadDefinition = async (name: string, cwd = process.cwd()) => {
  const path = definitionPath(name, cwd);

  if (!existsSync(path)) {
    throw new Error(
      [
        `No scenario named "${name}".`,
        `Expected ${path}. Run "pnpm demo list" to see the names.`,
      ].join('\n'),
    );
  }

  return { path, definition: await importDefinition(path) };
};

export type DefinitionSummary = {
  name: string;
  title: string;
  path: string;
  stages: string[];
  examples: string[];
  ownScenario: boolean;
};

const scenarioNames = (cwd: string): string[] => {
  const directory = resolve(cwd, SCENARIOS_DIR);

  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(definitionPath(name, cwd)))
    .sort();
};

export const listDefinitions = async (
  cwd = process.cwd(),
): Promise<DefinitionSummary[]> =>
  Promise.all(
    scenarioNames(cwd).map(async (name) => {
      const path = definitionPath(name, cwd);
      const data = await importDefinition(path);

      return {
        name: data.name,
        title: data.title,
        ownScenario: hasOwnScenario(data.name, cwd),
        path,
        stages: [
          ...(data.server.enabled ? ['server'] : []),
          ...(data.worker.enabled ? ['worker'] : []),
          ...(data.ui.enabled ? ['ui'] : []),
          ...(hasWork(data, cwd) ? ['scenarios'] : []),
        ],
        examples: data.examples.map((entry) => entry.id),
      };
    }),
  );

const exampleEntries = (exampleIds: readonly string[], cwd: string) =>
  exampleIds.map((id) => {
    // Resolved now so a mistyped id fails while scaffolding, not at run time.
    const example = requireWorkflowExample(id, cwd);

    return {
      id: example.id,
      workflowId: `catalog-${example.id}`,
      role: example.title,
      note: example.description,
    };
  });

const exampleSource = (examples: ReturnType<typeof exampleEntries>) =>
  examples.length
    ? examples
        .map(
          (example) => `    {
      id: ${JSON.stringify(example.id)},
      workflowId: ${JSON.stringify(example.workflowId)},
      role: ${JSON.stringify(example.role)},
      note: ${JSON.stringify(example.note)},
    },`,
        )
        .join('\n')
    : `    // Run "pnpm catalog list" for the ids.
    { id: 'hello', role: 'TODO: what this one shows' },`;

const template = (
  name: string,
  examples: ReturnType<typeof exampleEntries>,
) => `import { defineScenario } from '../../definition';

export const definition = defineScenario({
  name: '${name}',
  title: 'TODO: what a reviewer sees when ${name} works',
  summary: 'TODO: what changes, and what it looked like before.',
  server: {
    source: 'auto',
    // A feature no release carries yet needs the commit that added it:
    // requires: { serverCommit: '...' },
    dynamicConfig: {},
    searchAttributes: {
      CustomKeywordField: 'Keyword',
      CustomIntField: 'Int',
    },
  },
  examples: [
${exampleSource(examples)}
  ],
  preview: {
    notes: ['TODO: the first thing a reviewer must check.'],
  },
});
`;

export const scaffoldDefinition = async (
  name: string,
  exampleIds: readonly string[] = [],
  cwd = process.cwd(),
): Promise<string> => {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error(
      `A scenario name must be kebab-case, for example system-nexus-signal-with-start (got "${name}").`,
    );
  }

  const path = definitionPath(name, cwd);

  if (existsSync(path)) {
    throw new Error(`${SCENARIOS_DIR}/${name}/definition.ts already exists.`);
  }

  const examples = exampleEntries(exampleIds, cwd);

  await mkdir(scenarioDirectory(name, cwd), { recursive: true });
  await writeFile(path, template(name, examples));

  return path;
};
