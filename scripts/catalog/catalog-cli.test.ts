import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it, vi } from 'vitest';

import { catalogHelp, prepareCatalogCommand } from './catalog-cli';

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
});
