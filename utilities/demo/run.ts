import { existsSync, readdirSync } from 'fs';
import { pathToFileURL } from 'url';

import { chalk } from 'zx';

import {
  hasOwnScenario,
  loadDefinition,
  ownScenarioPath,
  type Stage,
} from './definition';
import { startCatalogExamples } from './examples';
import { WORK_DIR } from './paths';
import { stopPid, type Supervised } from './process';
import type { Scenario, StartedWorkflow } from './scenario';
import { startServer } from './stages/server';
import { startUi } from './stages/ui';
import { startCatalogWorker } from './stages/worker';
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

export type StartOptions = {
  skip: Stage[];
  only: Stage[];
  keepAlive: boolean;
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

const holdUntilInterrupted = async (io: DemoIo, stop: () => Promise<void>) => {
  io.writeOutput(
    chalk.bold('\nHolding everything open. Press Ctrl-C to shut it all down.'),
  );

  await new Promise<void>((resolve) => {
    let stopping = false;
    // Signal handlers alone do not keep the event loop alive, and the child
    // processes are unref'd, so Node would report an unsettled top-level await.
    const keepAlive = setInterval(() => {}, 60_000);

    const finish = () => {
      // A second Ctrl-C means the person is done waiting.
      if (stopping) {
        io.writeOutput(chalk.yellow('\nLeaving the rest to "pnpm demo stop".'));
        process.exit(130);
      }

      stopping = true;
      io.writeOutput(chalk.dim('\nShutting down…'));
      void stop().then(() => {
        clearInterval(keepAlive);
        resolve();
      });
    };

    process.on('SIGINT', finish);
    process.on('SIGTERM', finish);
  });
};

export const startFeatureDemo = async (
  target: string,
  options: StartOptions,
  io: DemoIo,
) => {
  const { path: definitionPath, definition } = await loadDefinition(target);
  const log = (message: string) =>
    io.writeOutput(`${chalk.dim('·')} ${message}`);

  const outcomes: StageOutcome[] = [];
  const processes: Supervised[] = [];
  const teardown: (() => Promise<void>)[] = [];
  const workflows: StartedWorkflow[] = [];
  const observations: string[] = [];

  let address = `127.0.0.1:${definition.server.port}`;
  let bundledUiUrl: string | undefined;
  let webUrl: string | undefined;

  const stopEverything = async () => {
    // A worker with a long activity in flight can take minutes to drain, and
    // Ctrl-C must not leave the ports bound that long. Scenarios get a moment
    // to finish, then the processes holding the ports go regardless.
    await Promise.race([
      Promise.all(teardown.map((shutdown) => shutdown().catch(() => {}))),
      new Promise((resolve) => {
        setTimeout(resolve, TEARDOWN_GRACE_MS).unref();
      }),
    ]);

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
      supervisorPid: options.keepAlive ? process.pid : undefined,
      processes: processes.map(({ label, pid }) => ({ label, pid })),
    });
  }

  if (!options.keepAlive || (!processes.length && !teardown.length)) {
    await stopEverything();
    return;
  }

  await holdUntilInterrupted(io, stopEverything);

  async function runStages() {
    const server = stageState('server', definition.server.enabled, options);

    if (server.run) {
      const provisioned = await startServer(
        definition.server,
        log,
        definition.name,
      );

      address = provisioned.address;
      bundledUiUrl = provisioned.bundledUiUrl;
      if (provisioned.process) processes.push(provisioned.process);

      outcomes.push({
        stage: 'server',
        ran: true,
        details: [
          `Listening on ${provisioned.address}, namespace "${provisioned.namespace}"`,
          ...(provisioned.reusedExisting
            ? []
            : [
                `Temporal CLI ${provisioned.cliVersion}, Server ${provisioned.serverVersion}`,
                ...provisioned.provenance,
                ...Object.entries(definition.server.dynamicConfig).map(
                  ([key, value]) =>
                    `Dynamic config: ${key}=${JSON.stringify(value)}`,
                ),
              ]),
          `Bundled Web UI: ${provisioned.bundledUiUrl}`,
        ],
      });
    } else {
      outcomes.push({
        stage: 'server',
        ran: false,
        reason: server.reason,
        details: [`Expecting a server on ${address}`],
      });
    }

    const worker = stageState('worker', definition.worker.enabled, options);

    if (worker.run) {
      const running = await startCatalogWorker(
        definition.worker,
        address,
        definition.server.namespace,
        log,
        definition.name,
      );

      if (running.process) processes.push(running.process);

      outcomes.push({
        stage: 'worker',
        ran: true,
        details: [
          `The catalog worker is polling for: ${running.targets.join(', ')}`,
          'Started with "pnpm catalog worker", so the demo runs the same code the catalog page runs.',
        ],
      });
    } else {
      outcomes.push({
        stage: 'worker',
        ran: false,
        reason: worker.reason,
        details: [],
      });
    }

    const ui = stageState('ui', definition.ui.enabled, options);

    if (ui.run) {
      const running = await startUi(
        definition.ui,
        address,
        log,
        definition.name,
      );

      webUrl = running.webUrl;
      processes.push(...running.processes);

      outcomes.push({
        stage: 'ui',
        ran: true,
        details: [
          ...(running.apiUrl ? [`ui-server API: ${running.apiUrl}`] : []),
          ...(running.webUrl ? [`UI: ${running.webUrl}`] : []),
        ],
      });
    } else {
      outcomes.push({
        stage: 'ui',
        ran: false,
        reason: ui.reason,
        details: [],
      });
    }

    const scenarios = stageState(
      'scenarios',
      definition.examples.length > 0 || hasOwnScenario(definition.name),
      options,
    );

    if (!scenarios.run) {
      outcomes.push({
        stage: 'scenarios',
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
      namespace: definition.server.namespace,
      log,
    };

    if (definition.examples.length) {
      log(`Starting ${definition.examples.length} catalog example(s)`);

      const result = await startCatalogExamples(context, definition.examples);

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

    outcomes.push({ stage: 'scenarios', ran: true, details });
  }
};

const recordedRunNames = (): string[] => {
  if (!existsSync(WORK_DIR)) return [];

  return readdirSync(WORK_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
};

export const stopFeatureDemo = async (name: string | undefined, io: DemoIo) => {
  const names = name ? [name] : recordedRunNames();
  let stopped = 0;

  for (const candidate of names) {
    const state = await readState(candidate);

    if (!state) continue;

    // The supervisor shuts its own children down, so it is asked first. Any
    // child that outlives it is stopped directly below.
    if (state.supervisorPid && isRunning(state.supervisorPid)) {
      await stopPid(state.supervisorPid);
      io.writeOutput(`Stopped the run holding ${candidate} open.`);
      stopped += 1;
    }

    for (const child of state.processes) {
      if (!isRunning(child.pid)) continue;

      await stopPid(child.pid);
      io.writeOutput(`Stopped ${child.label} (pid ${child.pid}).`);
      stopped += 1;
    }

    await clearState(candidate);
  }

  if (!stopped) {
    io.writeOutput(
      name
        ? `Nothing recorded as running for "${name}".`
        : 'Nothing recorded as running.',
    );
  }
};
