/**
 * Runs one feature definition end to end: provisions a Temporal server with the
 * dynamic config the feature needs, stands up the UI, runs the scenarios that
 * demonstrate the feature, then reports how a reviewer can see it.
 *
 *   pnpm demo list
 *   pnpm demo start system-nexus-signal-with-start
 *   pnpm demo start system-nexus-signal-with-start --skip ui
 *   pnpm demo stop
 *
 * The harness itself is in src/lib/demo, which ships in the package. This file
 * is the part that is particular to this repository: which stages exist, and
 * how a catalog example gets started.
 */
import { pathToFileURL } from 'node:url';

import { startCatalogExamples } from './examples';
import { scaffoldDefinition } from './scaffold';
import { uiDemoStages } from './stages';
import { demoHelpFor, runDemoCli } from '../../src/lib/demo/cli';
import { listDefinitions, loadDefinition } from '../../src/lib/demo/definition';
import { loadLocalEnvironment } from '../../src/lib/demo/paths';
import {
  type DemoRunner,
  ReportedRunFailure,
  startFeatureDemo,
  stopFeatureDemo,
} from '../../src/lib/demo/run';
import { stageNames } from '../../src/lib/demo/stage';

const runner: DemoRunner = {
  stages: uiDemoStages,
  runExamples: startCatalogExamples,
};

const stages = stageNames(uiDemoStages);

export const demoHelp = demoHelpFor(stages);

const isReportedDemoCliError = (error: unknown) => {
  if (error instanceof ReportedRunFailure) return true;
  if (!(error instanceof Error)) return false;

  return [
    'Unknown demo command',
    'Invalid arguments for demo command',
    'Usage: demo start',
    '--skip needs one of these stages',
    '--only needs one of these stages',
  ].some((prefix) => error.message.startsWith(prefix));
};

const showDefinition = async (target: string) => {
  const { path, definition } = await loadDefinition(target);

  return [`${path}`, '', JSON.stringify(definition, null, 2)].join('\n');
};

const main = async () => {
  loadLocalEnvironment();

  const io = {
    writeError: (message: string) => console.error(message),
    writeOutput: (message: string) => console.log(message),
  };

  try {
    await runDemoCli({
      argv: process.argv.slice(2),
      io,
      stages,
      commands: {
        list: () => listDefinitions(uiDemoStages),
        show: showDefinition,
        start: (target, options) =>
          startFeatureDemo(target, options, io, runner),
        stop: (name) => stopFeatureDemo(name, io),
        create: (name, exampleIds) => scaffoldDefinition(name, exampleIds),
      },
    });
  } catch (error) {
    if (!isReportedDemoCliError(error)) {
      const message = error instanceof Error ? error.message : error;
      console.error(message);
    }
    process.exitCode = 1;
  }
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main();
}
