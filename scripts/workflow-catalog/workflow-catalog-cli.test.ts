import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

import {
  workflowCatalogCommandAliases,
  workflowCatalogHelp,
} from './workflow-catalog-cli';

const execFileAsync = promisify(execFile);

describe('workflow catalog CLI', () => {
  it('shows the canonical workflow catalog commands', () => {
    expect(workflowCatalogHelp).toContain(
      'workflow-catalog scaffold <example-id>',
    );
    expect(workflowCatalogHelp).toContain('workflow-catalog generate');
    expect(workflowCatalogHelp).toContain('workflow-catalog verify');
    expect(workflowCatalogHelp).toContain(
      'workflow-catalog promote <example-id> [--dry-run]',
    );
    expect(workflowCatalogHelp).toContain('workflow-catalog dev');
    expect(workflowCatalogHelp).toContain('workflow-catalog worker');
    expect(workflowCatalogHelp).toContain('workflow-catalog help');
  });

  it('prints canonical help through the executable entrypoint without mutating the repository', async () => {
    const { stdout } = await execFileAsync(
      'pnpm',
      [
        'exec',
        'esno',
        'scripts/workflow-catalog/workflow-catalog-cli.ts',
        '--help',
      ],
      { cwd: process.cwd() },
    );

    expect(stdout).toContain('workflow-catalog scaffold <example-id>');
    expect(stdout).toContain(
      'workflow-catalog promote <example-id> [--dry-run]',
    );
  });

  it('returns a nonzero exit and performs no command for an unknown entrypoint command', async () => {
    const error = await execFileAsync(
      'pnpm',
      [
        'exec',
        'esno',
        'scripts/workflow-catalog/workflow-catalog-cli.ts',
        'unknown',
      ],
      { cwd: process.cwd() },
    ).catch((cause: NodeJS.ErrnoException & { stderr: string }) => cause);

    expect(error.code).toBe(1);
    expect(error.stderr).toContain(
      'Unknown workflow catalog command "unknown"',
    );
    expect(
      error.stderr.match(/Unknown workflow catalog command "unknown"/g),
    ).toHaveLength(1);
    expect(error.stderr).toContain('Usage: workflow-catalog <command>');
  });

  it('prints an invalid-argument usage error only once through the executable entrypoint', async () => {
    const error = await execFileAsync(
      'pnpm',
      [
        'exec',
        'esno',
        'scripts/workflow-catalog/workflow-catalog-cli.ts',
        'generate',
        'unexpected',
      ],
      { cwd: process.cwd() },
    ).catch((cause: NodeJS.ErrnoException & { stderr: string }) => cause);

    expect(error.code).toBe(1);
    expect(error.stderr).toContain(
      'Invalid arguments for workflow catalog command "generate"',
    );
    expect(
      error.stderr.match(
        /Invalid arguments for workflow catalog command "generate"/g,
      ),
    ).toHaveLength(1);
    expect(error.stderr).toContain('Usage: workflow-catalog <command>');
  });

  it('keeps dev and worker as supported legacy aliases', () => {
    expect(workflowCatalogCommandAliases).toEqual({
      new: 'scaffold',
      'dev:catalog': 'dev',
      'dev:workflow-catalog-worker': 'worker',
    });
  });

  it('exposes the unified dispatcher through the workflow-catalog package script', async () => {
    const packageJson = JSON.parse(
      await readFile(join(process.cwd(), 'package.json'), 'utf8'),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts['workflow-catalog']).toBe(
      'esno scripts/workflow-catalog/workflow-catalog-cli.ts',
    );
    expect(packageJson.scripts['workflow-catalog:new']).toBe(
      'pnpm workflow-catalog scaffold',
    );
    expect(packageJson.scripts['dev:catalog']).toBe(
      'pnpm workflow-catalog dev',
    );
    expect(packageJson.scripts['dev:workflow-catalog-worker']).toBe(
      'pnpm workflow-catalog worker',
    );
  });
});
