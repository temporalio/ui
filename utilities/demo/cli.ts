import type { DefinitionSummary, Stage } from './definition';
import { STAGES } from './definition';
import type { StartOptions } from './run';

export const demoHelp = `Usage: demo <command>

Commands:
  demo help                      Show this help text.
  demo list                      List the feature definitions.
  demo show <definition>         Show a definition with its defaults applied.
  demo start <definition> [--skip <stage>] [--only <stage>] [--once]
                                 Start the stages the definition declares and
                                 leave them running. --once tears them down
                                 again before returning.
                                 Stages: ${STAGES.join(', ')}.
                                 Repeat --skip or --only to name more than one.
  demo stop [<definition>]       Stop what an earlier start left running.
  demo new <name> [example-id...]
                                 Create a definition naming those catalog
                                 examples. Run "pnpm catalog list" for the ids.

"pnpm demo list" shows which stages each definition turns on.`;

export type DemoIo = {
  writeError: (message: string) => void;
  writeOutput: (message: string) => void;
};

export type DemoCommands = {
  list: () => Promise<DefinitionSummary[]>;
  show: (target: string) => Promise<string>;
  start: (target: string, options: StartOptions) => Promise<unknown>;
  stop: (name: string | undefined) => Promise<unknown>;
  create: (name: string, exampleIds: readonly string[]) => Promise<string>;
};

const KNOWN_COMMANDS = [
  'help',
  'list',
  'new',
  'show',
  'start',
  'stop',
] as const;

const START_USAGE =
  'Usage: demo start <definition> [--skip <stage>] [--only <stage>] [--once]';

const formatDefinitions = (definitions: readonly DefinitionSummary[]) => {
  if (!definitions.length) {
    return 'No definitions yet. Run "pnpm demo new <name>" to make one.';
  }

  return definitions
    .flatMap((definition) => [
      `  ${definition.name}`,
      `    ${definition.title}`,
      `    stages: ${definition.stages.join(', ') || 'none'}`,
      ...(definition.examples.length
        ? [`    examples: ${definition.examples.join(', ')}`]
        : []),
      ...(definition.ownScenario ? ['    ships its own scenario.ts'] : []),
      '',
    ])
    .join('\n')
    .trimEnd();
};

export const parseStartOptions = (
  args: readonly string[],
  fail: (message: string) => never,
): StartOptions => {
  const skip: Stage[] = [];
  const only: Stage[] = [];
  let once = false;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--once') {
      once = true;
      continue;
    }

    if (argument !== '--skip' && argument !== '--only') fail(START_USAGE);

    const value = args[index + 1];

    if (!value || !STAGES.includes(value as Stage)) {
      fail(
        `${argument} needs one of these stages: ${STAGES.join(', ')}.\n\n${START_USAGE}`,
      );
    }

    (argument === '--skip' ? skip : only).push(value as Stage);
    index += 1;
  }

  return { skip, only, once };
};

export const runDemoCli = async ({
  argv,
  io,
  commands,
}: {
  argv: readonly string[];
  io: DemoIo;
  commands: DemoCommands;
}) => {
  if (argv.length === 0 || argv.includes('--help')) {
    io.writeOutput(demoHelp);
    return;
  }

  const command = argv[0] as string;
  const fail = (message: string): never => {
    io.writeError(`${message}\n\n${demoHelp}`);
    throw new Error(message);
  };

  if (command === 'help' && argv.length === 1) {
    io.writeOutput(demoHelp);
    return;
  }

  if (command === 'list' && argv.length === 1) {
    io.writeOutput(formatDefinitions(await commands.list()));
    return;
  }

  if (command === 'show' && argv.length === 2) {
    io.writeOutput(await commands.show(argv[1]));
    return;
  }

  if (command === 'start' && argv.length >= 2) {
    await commands.start(argv[1], parseStartOptions(argv.slice(2), fail));
    return;
  }

  if (command === 'stop' && (argv.length === 1 || argv.length === 2)) {
    await commands.stop(argv[1]);
    return;
  }

  if (command === 'new' && argv.length >= 2) {
    const path = await commands.create(argv[1], argv.slice(2));

    io.writeOutput(
      `Created ${path}. Replace the TODO values, then run "pnpm demo start ${argv[1]}".`,
    );
    return;
  }

  if ((KNOWN_COMMANDS as readonly string[]).includes(command)) {
    fail(`Invalid arguments for demo command "${command}"`);
  }

  fail(`Unknown demo command "${command}"`);
};
