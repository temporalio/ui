import { existsSync, readdirSync } from 'fs';
import { pathToFileURL } from 'url';

import { chalk } from 'zx';

import {
  type Definition,
  hasOwnScenario,
  loadDefinition,
  ownScenarioPath,
  type Stage,
} from './definition';
import { WORK_DIR } from './paths';
import { runPreflight } from './preflight';
import { listenersOn, stopPid, type Supervised } from './process';
import type { Scenario, StartedWorkflow } from './scenario';
import { type DemoStage, SCENARIOS_STAGE, type StageContext } from './stage';
import { clearState, isRunning, readState, writeState } from './state';
import {
  printSummary,
  type StageOutcome,
  type SummaryInput,
  writeSummary,
} from './summary';

/** Thrown after the failure has already been reported through `io`. */
export class ReportedRunFailure extends Error {
  constructor() {
    super('The run failed.');
    this.name = 'ReportedRunFailure';
  }
}

/** Loads the behaviour a scenario ships beside its definition. */
const loadOwnScenario = async (name: string): Promise<Scenario> => {
  const path = ownScenarioPath(name);
  const module = (await import(pathToFileURL(path).href)) as {
    scenario?: Scenario;
  };

  if (!module.scenario) {
    throw new Error(`${path} must export a "scenario".`);
  }

  return module.scenario;
};

/** How long a scenario gets to shut its workers down before the ports go. */
const TEARDOWN_GRACE_MS = 3_000;

export type DemoIo = {
  writeOutput: (message: string) => void;
  writeError: (message: string) => void;
};

/**
 * What a repository contributes to a run: the stages it can start, and a way
 * to start the catalog examples a definition names, when it has a catalog.
 * The core knows neither, so both arrive here.
 */
export type DemoRunner = {
  stages: readonly DemoStage[];
  runExamples?: (
    context: Parameters<Scenario['run']>[0],
    entries: Definition['examples'],
  ) => Promise<Awaited<ReturnType<Scenario['run']>>>;
};

export type StartOptions = {
  skip: Stage[];
  only: Stage[];
  /** Tear the run down before returning, rather than leaving it up. */
  once: boolean;
};

const stageState = (
  stage: Stage,
  enabledInDefinition: boolean,
  options: StartOptions,
) => {
  if (options.only.length && !options.only.includes(stage)) {
    return { run: false, reason: `--only ${options.only.join(', ')}` };
  }

  if (options.skip.includes(stage)) return { run: false, reason: '--skip' };

  if (!enabledInDefinition) {
    return { run: false, reason: 'disabled in the definition' };
  }

  return { run: true, reason: undefined };
};

export const startFeatureDemo = async (
  target: string,
  options: StartOptions,
  io: DemoIo,
  runner: DemoRunner,
) => {
  const { path: definitionPath, definition } = await loadDefinition(target);
  const log = (message: string) =>
    io.writeOutput(`${chalk.dim('·')} ${message}`);

  // A recorded run of this scenario is stale by definition: starting again means
  // wanting a fresh one. Anything unrecorded on a port is somebody else's and is
  // reused by the stages instead.
  const replaced = await stopFeatureDemo(definition.name, io, { quiet: true });

  if (replaced) {
    log(
      `Stopped the previous run of this scenario (${replaced} process(es)), so this one is fresh.`,
    );
  }

  const outcomes: StageOutcome[] = [];
  const processes: Supervised[] = [];
  /** Ports this run started, as opposed to ports it reused. */
  const ownedPorts: number[] = [];
  const teardown: (() => Promise<void>)[] = [];
  const workflows: StartedWorkflow[] = [];
  const observations: string[] = [];

  let address = `127.0.0.1:${definition.server.port}`;
  let bundledUiUrl: string | undefined;
  let webUrl: string | undefined;
  let publicAddress: string | undefined;

  // A worker with a long activity in flight can take minutes to drain, so a
  // scenario gets a moment and then the run continues regardless.
  const stageContext = (): StageContext => ({
    definition,
    runName: definition.name,
    log,
    address,
    publicAddress,
    bundledUiUrl,
    webUrl,
  });

  const stopScenarios = async () => {
    await Promise.race([
      Promise.all(teardown.map((shutdown) => shutdown().catch(() => {}))),
      new Promise((resolve) => {
        setTimeout(resolve, TEARDOWN_GRACE_MS).unref();
      }),
    ]);
  };

  const stopEverything = async () => {
    await stopScenarios();

    for (const child of processes) await child.stop().catch(() => {});

    await clearState(definition.name);
  };

  try {
    await runStages();
  } catch (error) {
    io.writeError(
      `\n${chalk.bgRed.white(' FAILED ')} ${error instanceof Error ? error.message : String(error)}`,
    );
    await stopEverything();
    throw new ReportedRunFailure();
  }

  const summary: SummaryInput = {
    definition,
    definitionPath,
    stages: outcomes,
    workflows,
    observations,
    webUrl,
    bundledUiUrl,
    address,
  };

  printSummary(summary, io.writeOutput);

  const summaryPath = await writeSummary(summary);

  io.writeOutput(`\n${chalk.dim(`Summary written to ${summaryPath}`)}`);

  if (processes.length) {
    await writeState({
      name: definition.name,
      startedAt: new Date().toISOString(),
      address,
      webUrl,
      ports: ownedPorts,
      processes: processes.map(({ label, pid }) => ({ label, pid })),
    });
  }

  if (options.once) {
    await stopEverything();
    return;
  }

  // The processes are detached and outlive this command, so it exits rather than
  // holding a terminal to own something it does not.
  await stopScenarios();

  if (processes.length) {
    io.writeOutput(
      chalk.bold(
        `\nStill running. Stop it with "pnpm demo stop ${definition.name}".`,
      ),
    );
  }

  async function runStages() {
    await runPreflight(definition, log);

    // A scenario's own prerequisites, while failing is still cheap.
    if (hasOwnScenario(definition.name)) {
      const own = await loadOwnScenario(definition.name);

      if (own.preflight) await own.preflight(definition.scenario);
    }

    for (const stage of runner.stages) {
      const context = stageContext();
      const state = stageState(stage.name, stage.enabled(definition), options);

      if (!state.run) {
        outcomes.push({
          stage: stage.name,
          ran: false,
          reason: state.reason,
          details: stage.idle?.(context) ?? [],
        });
        continue;
      }

      const output = await stage.run(context);

      // A stage reports what it leaves behind rather than assigning to these,
      // so a stage from another repository cannot reach into the run.
      address = output.address ?? address;
      publicAddress = output.publicAddress ?? publicAddress;
      bundledUiUrl = output.bundledUiUrl ?? bundledUiUrl;
      webUrl = output.webUrl ?? webUrl;

      if (output.processes) processes.push(...output.processes);
      if (output.ownedPorts) ownedPorts.push(...output.ownedPorts);

      outcomes.push({
        stage: stage.name,
        ran: true,
        details: output.details,
      });
    }

    const scenarios = stageState(
      SCENARIOS_STAGE,
      definition.examples.length > 0 || hasOwnScenario(definition.name),
      options,
    );

    if (!scenarios.run) {
      outcomes.push({
        stage: SCENARIOS_STAGE,
        ran: false,
        reason: scenarios.reason,
        details: [],
      });

      return;
    }

    const details: string[] = [];

    const record = (result: Awaited<ReturnType<Scenario['run']>>) => {
      if (result.shutdown) teardown.push(result.shutdown);

      workflows.push(...result.workflows);
      observations.push(...result.observations);
    };

    const context = {
      address,
      publicAddress,
      // The UI the ui stage started when it ran, which is the one built from
      // this checkout. The server's bundled UI is the fallback, and is
      // whatever the server binary shipped with.
      uiUrl: webUrl ?? bundledUiUrl,
      namespace: definition.server.namespace,
      log,
    };

    if (definition.examples.length && runner.runExamples) {
      log(`Starting ${definition.examples.length} catalog example(s)`);

      const result = await runner.runExamples(context, definition.examples);

      record(result);
      details.push(`Catalog examples: started ${result.workflows.length}`);
    }

    if (hasOwnScenario(definition.name)) {
      const scenario = await loadOwnScenario(definition.name);

      log(`Running the behaviour of the "${definition.name}" scenario`);

      const result = await scenario.run(context, definition.scenario);

      record(result);
      details.push(
        `Own scenario: started ${result.workflows.length} workflow(s)`,
      );
    }

    outcomes.push({ stage: SCENARIOS_STAGE, ran: true, details });
  }
};

const recordedRunNames = (): string[] => {
  if (!existsSync(WORK_DIR)) return [];

  return readdirSync(WORK_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
};

export const stopFeatureDemo = async (
  name: string | undefined,
  io: DemoIo,
  { quiet = false }: { quiet?: boolean } = {},
): Promise<number> => {
  const names = name ? [name] : recordedRunNames();
  let stopped = 0;
  const say = (message: string) => {
    if (!quiet) io.writeOutput(message);
  };

  for (const candidate of names) {
    const state = await readState(candidate);

    if (!state) continue;

    for (const child of state.processes) {
      if (!isRunning(child.pid)) continue;

      await stopPid(child.pid);
      say(`Stopped ${child.label} (pid ${child.pid}).`);
      stopped += 1;
    }

    // A child that outlived its record still holds its port, and a pid list
    // cannot see that. The ports this run started are swept as a backstop. A
    // child that holds no port, such as the catalog worker, is reachable only
    // through its recorded pid: a sweep by process name would also catch a
    // worker somebody started themselves.
    for (const port of state.ports ?? []) {
      for (const pid of await listenersOn(port)) {
        await stopPid(pid);
        say(`Stopped whatever still held port ${port} (pid ${pid}).`);
        stopped += 1;
      }
    }

    await clearState(candidate);
  }

  if (!stopped) {
    say(
      name
        ? `Nothing recorded as running for "${name}".`
        : 'Nothing recorded as running.',
    );
  }

  return stopped;
};
