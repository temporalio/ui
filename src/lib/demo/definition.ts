import { existsSync, readdirSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

import { z } from 'zod';

import { type DemoStage, SCENARIOS_STAGE } from './stage';

/**
 * A catalog example a demo starts. The shape is plain on purpose: validating an
 * id against the catalog belongs to whatever starts it, not to the definition.
 */
export const exampleEntrySchema = z.object({
  id: z.string(),
  workflowId: z.string().optional(),
  /** Replaces the example's own default input when given. */
  input: z.array(z.unknown()).optional(),
  role: z.string().optional(),
  note: z.string().optional(),
});

export type ExampleEntry = z.infer<typeof exampleEntrySchema>;

/**
 * A stage is whatever the registry a runner is given names, so this is a plain
 * string rather than a fixed union. The runner validates a --skip or --only
 * against the registry it holds.
 */
export type Stage = string;

// Arrays included: some settings are lists, and the server takes them as JSON
// on the same flag, so they need no special handling beyond being allowed here.
const dynamicConfigValue = z.union([
  z.boolean(),
  z.number(),
  z.string(),
  z.array(z.string()),
]);

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
        /**
         * Go modules the built server must carry, as module path to minimum
         * version. Some features arrive in the server through a dependency
         * bump rather than a server commit, and serverCommit cannot express
         * that: the commit lives in another repository. A pseudo-version is
         * ordered by its embedded timestamp, so
         * `v0.0.0-20260824233950-312f95fb8b99` is satisfied by anything from
         * that moment on.
         */
        serverModules: z.record(z.string(), z.string()).default({}),
        /**
         * Executables the run needs on PATH. Checked before any stage starts,
         * so a missing `docker` or `ngrok` fails immediately with a name
         * rather than midway through a build.
         */
        commands: z.array(z.string()).default([]),
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

/**
 * Publishes the frontend on a public address. A Worker that Temporal launches
 * in a cloud provider has to dial the frontend back, and a dev server on
 * localhost is not reachable from there, so a scenario covering server-scaled
 * Workers needs an inbound path that outlives its own process.
 */
const tunnelSchema = z
  .object({
    enabled: z.boolean().default(false),
    provider: z.enum(['ngrok']).default('ngrok'),
    /** Defaults to the frontend port the server stage provisioned. */
    targetPort: z.number().int().optional(),
    readyTimeoutMs: z.number().int().default(60_000),
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
  tunnel: tunnelSchema,
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
export type TunnelDefinition = Definition['tunnel'];
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

/**
 * Where scenario directories live, relative to the cwd. Overridable because a
 * consumer of this harness keeps its scenarios on its own layout, and every
 * lookup below is relative to this one value. Environment rather than an
 * argument: it is a property of the repository, not of a call, and the harness
 * already layers machine-local settings this way (see loadLocalEnvironment).
 */
export const SCENARIOS_DIR =
  process.env.DEMO_SCENARIOS_DIR ?? join('utilities', 'demo', 'scenarios');

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
  stages: readonly DemoStage[],
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
          ...stages.filter((stage) => stage.enabled(data)).map((s) => s.name),
          ...(hasWork(data, cwd) ? [SCENARIOS_STAGE] : []),
        ],
        examples: data.examples.map((entry) => entry.id),
      };
    }),
  );
