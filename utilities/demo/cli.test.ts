import { describe, expect, it, vi } from 'vitest';

import type { DemoCommands } from './cli';
import { demoHelp, parseStartOptions, runDemoCli } from './cli';
import type { DefinitionSummary } from './definition';

const definition: DefinitionSummary = {
  name: 'system-nexus-signal-with-start',
  title: 'Signal With Start through the system Nexus endpoint',
  path: 'utilities/demo/scenarios/system-nexus-signal-with-start/definition.ts',
  stages: ['server', 'worker', 'ui', 'scenarios'],
  examples: ['signal-handlers'],
  ownScenario: true,
};

const setup = (overrides: Partial<DemoCommands> = {}) => {
  const output: string[] = [];
  const errors: string[] = [];

  const commands: DemoCommands = {
    list: vi.fn(async () => [definition]),
    show: vi.fn(async () => 'the resolved definition'),
    start: vi.fn(async () => undefined),
    stop: vi.fn(async () => undefined),
    create: vi.fn(
      async () => 'utilities/demo/scenarios/new-thing/definition.ts',
    ),
    ...overrides,
  };

  const run = (...argv: string[]) =>
    runDemoCli({
      argv,
      io: {
        writeOutput: (message) => output.push(message),
        writeError: (message) => errors.push(message),
      },
      commands,
    });

  return { commands, output, errors, run };
};

describe('demo CLI help', () => {
  it('names every command it accepts', () => {
    expect(demoHelp).toContain('demo help');
    expect(demoHelp).toContain('demo list');
    expect(demoHelp).toContain('demo show <definition>');
    expect(demoHelp).toContain('demo start <definition>');
    expect(demoHelp).toContain('demo stop [<definition>]');
    expect(demoHelp).toContain('demo new <name> [example-id...]');
  });

  it.each([[[]], [['--help']], [['help']]])(
    'shows help for %j',
    async (argv) => {
      const { output, run } = setup();

      await run(...argv);

      expect(output).toEqual([demoHelp]);
    },
  );
});

describe('demo list', () => {
  it('shows each definition with its stages and scenarios', async () => {
    const { output, run } = setup();

    await run('list');

    expect(output.join('\n')).toContain('system-nexus-signal-with-start');
    expect(output.join('\n')).toContain(
      'stages: server, worker, ui, scenarios',
    );
    expect(output.join('\n')).toContain('examples: signal-handlers');
    expect(output.join('\n')).toContain('ships its own scenario.ts');
  });

  it('tells a person how to make the first definition', async () => {
    const { output, run } = setup({ list: async () => [] });

    await run('list');

    expect(output.join('\n')).toContain('pnpm demo new <name>');
  });
});

describe('demo show', () => {
  it('passes the target through and prints the result', async () => {
    const { commands, output, run } = setup();

    await run('show', 'system-nexus-signal-with-start');

    expect(commands.show).toHaveBeenCalledWith(
      'system-nexus-signal-with-start',
    );
    expect(output).toEqual(['the resolved definition']);
  });
});

describe('demo start', () => {
  it('keeps every stage and leaves the run up by default', async () => {
    const { commands, run } = setup();

    await run('start', 'system-nexus-signal-with-start');

    expect(commands.start).toHaveBeenCalledWith(
      'system-nexus-signal-with-start',
      {
        skip: [],
        only: [],
        once: false,
      },
    );
  });

  it('collects repeated stage flags', async () => {
    const { commands, run } = setup();

    await run(
      'start',
      'system-nexus-signal-with-start',
      '--skip',
      'ui',
      '--skip',
      'scenarios',
      '--once',
    );

    expect(commands.start).toHaveBeenCalledWith(
      'system-nexus-signal-with-start',
      {
        skip: ['ui', 'scenarios'],
        only: [],
        once: true,
      },
    );
  });

  it('accepts the worker stage', async () => {
    const { commands, run } = setup();

    await run('start', 'system-nexus-signal-with-start', '--skip', 'worker');

    expect(commands.start).toHaveBeenCalledWith(
      'system-nexus-signal-with-start',
      {
        skip: ['worker'],
        only: [],
        once: false,
      },
    );
  });

  it('collects --only stages', async () => {
    const { commands, run } = setup();

    await run('start', 'system-nexus-signal-with-start', '--only', 'server');

    expect(commands.start).toHaveBeenCalledWith(
      'system-nexus-signal-with-start',
      {
        skip: [],
        only: ['server'],
        once: false,
      },
    );
  });

  it('refuses a stage it does not have', async () => {
    const { commands, errors, run } = setup();

    await expect(
      run('start', 'system-nexus-signal-with-start', '--skip', 'database'),
    ).rejects.toThrow('--skip needs one of these stages');

    expect(commands.start).not.toHaveBeenCalled();
    expect(errors.join('\n')).toContain('server, worker, ui, scenarios');
  });

  it('refuses a flag it does not have', async () => {
    const { commands, run } = setup();

    await expect(
      run('start', 'system-nexus-signal-with-start', '--fast'),
    ).rejects.toThrow('Usage: demo start');

    expect(commands.start).not.toHaveBeenCalled();
  });

  it('refuses a stage flag with no stage after it', async () => {
    const { run } = setup();

    await expect(
      run('start', 'system-nexus-signal-with-start', '--only'),
    ).rejects.toThrow('--only needs one of these stages');
  });
});

describe('demo stop', () => {
  it('stops every recorded run when given no name', async () => {
    const { commands, run } = setup();

    await run('stop');

    expect(commands.stop).toHaveBeenCalledWith(undefined);
  });

  it('stops one run when given its name', async () => {
    const { commands, run } = setup();

    await run('stop', 'system-nexus-signal-with-start');

    expect(commands.stop).toHaveBeenCalledWith(
      'system-nexus-signal-with-start',
    );
  });
});

describe('demo new', () => {
  it('reports the file it made and the next command', async () => {
    const { commands, output, run } = setup();

    await run('new', 'new-thing');

    expect(commands.create).toHaveBeenCalledWith('new-thing', []);
    expect(output.join('\n')).toContain('scenarios/new-thing/definition.ts');
    expect(output.join('\n')).toContain('pnpm demo start new-thing');
  });

  it('passes catalog example ids through to the generator', async () => {
    const { commands, run } = setup();

    await run('new', 'new-thing', 'signal-handlers', 'long-activity');

    expect(commands.create).toHaveBeenCalledWith('new-thing', [
      'signal-handlers',
      'long-activity',
    ]);
  });
});

describe('demo errors', () => {
  it('refuses a command it does not have', async () => {
    const { errors, run } = setup();

    await expect(run('deploy')).rejects.toThrow(
      'Unknown demo command "deploy"',
    );

    expect(errors.join('\n')).toContain(demoHelp);
  });

  it('refuses a known command with the wrong arguments', async () => {
    const { commands, run } = setup();

    await expect(run('list', 'everything')).rejects.toThrow(
      'Invalid arguments for demo command "list"',
    );

    expect(commands.list).not.toHaveBeenCalled();
  });
});

describe('parseStartOptions', () => {
  it('reports the usage line through fail', () => {
    const fail = vi.fn(() => {
      throw new Error('failed');
    }) as unknown as (message: string) => never;

    expect(() => parseStartOptions(['--nope'], fail)).toThrow('failed');
    expect(fail).toHaveBeenCalledWith(
      expect.stringContaining('Usage: demo start <definition>'),
    );
  });
});
