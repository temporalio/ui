import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it, vi } from 'vitest';

import {
  catalogControlSetting,
  catalogHelp,
  catalogWorkerEntry,
  isCatalogSourceChange,
  prepareCatalogCommand,
  runCatalogWorkerDevelopment,
} from './catalog-cli';

const execFileAsync = promisify(execFile);

describe('catalog CLI', () => {
  it('shows the canonical catalog commands', () => {
    expect(catalogHelp).toContain('catalog scaffold <example-id>');
    expect(catalogHelp).toContain('catalog generate');
    expect(catalogHelp).toContain('catalog verify');
    expect(catalogHelp).toContain('catalog promote <example-id> [--dry-run]');
    expect(catalogHelp).toContain('catalog demote <example-id> [--dry-run]');
    expect(catalogHelp).toContain('catalog dev');
    expect(catalogHelp).toContain('catalog worker');
    expect(catalogHelp).toContain('catalog help');
  });

  it('migrates local state before constructing command authoring', async () => {
    const calls: string[] = [];
    const authoring = {} as ReturnType<
      typeof import('./ui-authoring').createUiCatalogAuthoring
    >;

    await expect(
      prepareCatalogCommand({
        rootDirectory: '/catalog-root',
        migrate: async (rootDirectory) => {
          calls.push(`migrate:${rootDirectory}`);
          return [];
        },
        createAuthoring: (rootDirectory) => {
          calls.push(`authoring:${rootDirectory}`);
          return authoring;
        },
      }),
    ).resolves.toBe(authoring);
    expect(calls).toEqual(['migrate:/catalog-root', 'authoring:/catalog-root']);
  });

  it('does not construct or run a command when migration fails', async () => {
    const createAuthoring = vi.fn();

    await expect(
      prepareCatalogCommand({
        rootDirectory: '/catalog-root',
        migrate: async () => {
          throw new Error('resolve conflicting local state');
        },
        createAuthoring,
      }),
    ).rejects.toThrow('resolve conflicting local state');
    expect(createAuthoring).not.toHaveBeenCalled();
  });

  it('prints canonical help through the executable entrypoint without mutating the repository', async () => {
    const { stdout } = await execFileAsync(
      'pnpm',
      ['exec', 'esno', 'scripts/catalog/catalog-cli.ts', '--help'],
      { cwd: process.cwd() },
    );

    expect(stdout).toContain('catalog scaffold <example-id>');
    expect(stdout).toContain('catalog promote <example-id> [--dry-run]');
    expect(stdout).toContain('catalog demote <example-id> [--dry-run]');
  });

  it('returns a nonzero exit and performs no command for an unknown entrypoint command', async () => {
    const error = await execFileAsync(
      'pnpm',
      ['exec', 'esno', 'scripts/catalog/catalog-cli.ts', 'unknown'],
      { cwd: process.cwd() },
    ).catch((cause: NodeJS.ErrnoException & { stderr: string }) => cause);

    expect(error.code).toBe(1);
    expect(error.stderr).toContain('Unknown catalog command "unknown"');
    expect(
      error.stderr.match(/Unknown catalog command "unknown"/g),
    ).toHaveLength(1);
    expect(error.stderr).toContain('Usage: catalog <command>');
  });

  it('prints an invalid-argument usage error only once through the executable entrypoint', async () => {
    const error = await execFileAsync(
      'pnpm',
      [
        'exec',
        'esno',
        'scripts/catalog/catalog-cli.ts',
        'generate',
        'unexpected',
      ],
      { cwd: process.cwd() },
    ).catch((cause: NodeJS.ErrnoException & { stderr: string }) => cause);

    expect(error.code).toBe(1);
    expect(error.stderr).toContain(
      'Invalid arguments for catalog command "generate"',
    );
    expect(
      error.stderr.match(/Invalid arguments for catalog command "generate"/g),
    ).toHaveLength(1);
    expect(error.stderr).toContain('Usage: catalog <command>');
  });

  it('prints invalid demotion usage only once through the executable entrypoint', async () => {
    const error = await execFileAsync(
      'pnpm',
      [
        'exec',
        'esno',
        'scripts/catalog/catalog-cli.ts',
        'demote',
        'example-id',
        '--move',
      ],
      { cwd: process.cwd() },
    ).catch((cause: NodeJS.ErrnoException & { stderr: string }) => cause);

    expect(error.code).toBe(1);
    expect(error.stderr).toContain(
      'Usage: catalog demote <example-id> [--dry-run]',
    );
    expect(
      error.stderr.match(/Usage: catalog demote <example-id> \[--dry-run\]/g),
    ).toHaveLength(1);
  });

  it('exposes the unified dispatcher through the catalog package script', async () => {
    const packageJson = JSON.parse(
      await readFile(join(process.cwd(), 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts['catalog']).toBe(
      'esno scripts/catalog/catalog-cli.ts',
    );
    expect(packageJson.scripts).not.toHaveProperty('catalog:new');
    expect(packageJson.scripts).not.toHaveProperty('dev:catalog');
    expect(packageJson.scripts).not.toHaveProperty('dev:catalog-worker');
  });

  describe('worker crash restarts', () => {
    const createHarness = () => {
      const exits: ((code: number | null) => void)[] = [];
      const kills: NodeJS.Signals[] = [];
      const spawned: (readonly string[])[] = [];
      const signalListeners = new Map<string, () => void>();
      let onChange: (filename: string) => void = () => undefined;
      const stopWatching = vi.fn();
      const watchedPaths: string[] = [];

      const spawnWorker = vi.fn((_command: string, args: readonly string[]) => {
        spawned.push(args);
        return {
          once: (event: string, listener: (code: number | null) => void) => {
            if (event === 'exit') exits.push(listener);
          },
          kill: (signal: NodeJS.Signals) => kills.push(signal),
        } as never;
      });
      const options = {
        environment: { CATALOG_CONTROL: 'on' },
        rootDirectory: '/catalog-root',
        log: () => undefined,
        spawnWorker,
        debounceMs: 200,
        watchSources: (
          paths: readonly string[],
          listener: (filename: string) => void,
        ) => {
          watchedPaths.push(...paths);
          onChange = listener;
          return stopWatching;
        },
        signals: {
          on: (signal: string, listener: () => void) =>
            signalListeners.set(signal, listener),
          off: (signal: string) => signalListeners.delete(signal),
        },
      };

      return {
        change: (filename: string) => onChange(filename),
        exits,
        kills,
        options,
        signal: (name: string) => signalListeners.get(name)?.(),
        signalListeners,
        spawnWorker,
        spawned,
        stopWatching,
        watchedPaths,
      };
    };
    const spawnProcess = vi.fn();

    it('restarts the worker without watch mode after a crash exit', async () => {
      const harness = createHarness();
      const development = runCatalogWorkerDevelopment(
        spawnProcess,
        harness.options,
      );

      harness.exits[0](75);
      harness.exits[1](0);

      await expect(development).resolves.toBeUndefined();
      expect(harness.spawned).toEqual([
        ['exec', 'esno', catalogWorkerEntry],
        ['exec', 'esno', catalogWorkerEntry],
      ]);
      expect(spawnProcess).not.toHaveBeenCalled();
    });

    it('stops on any other failure instead of restarting', async () => {
      const harness = createHarness();
      const development = runCatalogWorkerDevelopment(
        spawnProcess,
        harness.options,
      );

      harness.exits[0](1);

      await expect(development).rejects.toThrow(
        `${catalogWorkerEntry} exited with status 1`,
      );
      expect(harness.spawnWorker).toHaveBeenCalledOnce();
      expect(harness.stopWatching).toHaveBeenCalledOnce();
      expect(harness.signalListeners.size).toBe(0);
    });

    it('watches the catalog sources under the project root', () => {
      const harness = createHarness();
      void runCatalogWorkerDevelopment(spawnProcess, harness.options);

      expect(harness.watchedPaths).toEqual([
        '/catalog-root/src/lib/catalog',
        '/catalog-root/scripts/catalog',
        '/catalog-root/catalog.local',
      ]);
    });

    it('restarts the worker once for a burst of source changes', async () => {
      vi.useFakeTimers();
      try {
        const harness = createHarness();
        const development = runCatalogWorkerDevelopment(
          spawnProcess,
          harness.options,
        );

        harness.change('worker/examples/hello/workflow.ts');
        harness.change('browser/catalog.generated.json');
        vi.advanceTimersByTime(199);
        expect(harness.kills).toEqual([]);

        vi.advanceTimersByTime(1);
        expect(harness.kills).toEqual(['SIGTERM']);

        harness.exits[0](null);
        expect(harness.spawnWorker).toHaveBeenCalledTimes(2);

        harness.exits[1](0);
        await expect(development).resolves.toBeUndefined();
      } finally {
        vi.useRealTimers();
      }
    });

    it('ignores changes to files the worker does not load', () => {
      vi.useFakeTimers();
      try {
        const harness = createHarness();
        void runCatalogWorkerDevelopment(spawnProcess, harness.options);

        harness.change('README.md');
        harness.change('worker/.workflow.ts.swp');
        harness.change('node_modules/pkg/index.js');
        vi.advanceTimersByTime(1000);

        expect(harness.kills).toEqual([]);
      } finally {
        vi.useRealTimers();
      }
    });

    it('forwards an interrupt to the worker and stops without restarting', async () => {
      const harness = createHarness();
      const development = runCatalogWorkerDevelopment(
        spawnProcess,
        harness.options,
      );

      harness.signal('SIGINT');
      expect(harness.kills).toEqual(['SIGINT']);

      harness.exits[0](75);

      await expect(development).resolves.toBeUndefined();
      expect(harness.spawnWorker).toHaveBeenCalledOnce();
      expect(harness.stopWatching).toHaveBeenCalledOnce();
    });

    it('recognizes worker source files', () => {
      expect(isCatalogSourceChange('worker/runner.ts')).toBe(true);
      expect(isCatalogSourceChange('browser/catalog.generated.json')).toBe(
        true,
      );
      expect(isCatalogSourceChange('examples/index.mjs')).toBe(true);
      expect(isCatalogSourceChange('README.md')).toBe(false);
      expect(isCatalogSourceChange('node_modules/x/index.js')).toBe(false);
    });

    it('reads the crash control from the environment, then the local env file, then the defaults', async () => {
      const rootDirectory = await mkdtemp(join(tmpdir(), 'catalog-control-'));

      try {
        await writeFile(
          join(rootDirectory, '.env.catalog'),
          'CATALOG_CONTROL=off\n',
        );
        expect(catalogControlSetting(rootDirectory, {})).toBe('off');

        await writeFile(
          join(rootDirectory, '.env.catalog.local'),
          'CATALOG_CONTROL=on\n',
        );
        expect(catalogControlSetting(rootDirectory, {})).toBe('on');
        expect(
          catalogControlSetting(rootDirectory, { CATALOG_CONTROL: 'off' }),
        ).toBe('off');
      } finally {
        await rm(rootDirectory, { recursive: true, force: true });
      }
    });
  });
});
