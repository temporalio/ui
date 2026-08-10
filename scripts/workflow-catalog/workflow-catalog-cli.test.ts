import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it, vi } from 'vitest';

import {
  runWorkflowCatalogCommand,
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
    const stableStatus = (status: string) =>
      status
        .split('\n')
        .filter((line) => !line.endsWith('.workflow-catalog.lock'))
        .join('\n');
    const before = stableStatus(
      (
        await execFileAsync('git', ['status', '--short'], {
          cwd: process.cwd(),
        })
      ).stdout,
    );
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
    const after = stableStatus(
      (
        await execFileAsync('git', ['status', '--short'], {
          cwd: process.cwd(),
        })
      ).stdout,
    );
    expect(after).toBe(before);
  });

  it('rejects an unknown command with canonical help', async () => {
    const writeError = vi.fn();

    await expect(
      runWorkflowCatalogCommand({
        arguments: ['unknown'],
        commands: {},
        writeError,
        writeOutput: vi.fn(),
      }),
    ).rejects.toThrow('Unknown workflow catalog command "unknown"');

    expect(writeError).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
  });

  it('rejects invalid arguments with the command error and canonical help', async () => {
    const writeError = vi.fn();

    await expect(
      runWorkflowCatalogCommand({
        arguments: ['generate', 'unexpected'],
        commands: { generate: vi.fn() },
        writeError,
        writeOutput: vi.fn(),
      }),
    ).rejects.toThrow('Invalid arguments');

    expect(writeError).toHaveBeenCalledWith(
      expect.stringContaining('Invalid arguments'),
    );
    expect(writeError).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
  });

  it('scaffolds before generating artifacts', async () => {
    const calls: string[] = [];

    await runWorkflowCatalogCommand({
      arguments: ['scaffold', 'order-lifecycle'],
      commands: {
        generate: async () => calls.push('generate'),
        scaffold: async (exampleId) => calls.push(`scaffold:${exampleId}`),
      },
      writeError: vi.fn(),
      writeOutput: vi.fn(),
    });

    expect(calls).toEqual(['scaffold:order-lifecycle', 'generate']);
  });

  it('prints actionable next steps after scaffolding and generation succeed', async () => {
    const writeOutput = vi.fn();

    await runWorkflowCatalogCommand({
      arguments: ['scaffold', 'order-lifecycle'],
      commands: {
        generate: async () => undefined,
        scaffold: async () => undefined,
      },
      writeError: vi.fn(),
      writeOutput,
    });

    expect(writeOutput).toHaveBeenCalledWith(
      expect.stringContaining('pnpm workflow-catalog dev'),
    );
    expect(writeOutput).toHaveBeenCalledWith(
      expect.stringContaining('order-lifecycle'),
    );
  });

  it('fails fast instead of generating after scaffold fails', async () => {
    const generate = vi.fn();

    await expect(
      runWorkflowCatalogCommand({
        arguments: ['scaffold', 'order-lifecycle'],
        commands: {
          generate,
          scaffold: async () => {
            throw new Error('scaffold failed');
          },
        },
        writeError: vi.fn(),
        writeOutput: vi.fn(),
      }),
    ).rejects.toThrow('scaffold failed');

    expect(generate).not.toHaveBeenCalled();
  });

  it('delegates generate and verify directly', async () => {
    const calls: string[] = [];
    const commands = {
      generate: async () => calls.push('generate'),
      verify: async () => calls.push('verify'),
    };

    await runWorkflowCatalogCommand({
      arguments: ['generate'],
      commands,
      writeError: vi.fn(),
      writeOutput: vi.fn(),
    });
    await runWorkflowCatalogCommand({
      arguments: ['verify'],
      commands,
      writeError: vi.fn(),
      writeOutput: vi.fn(),
    });

    expect(calls).toEqual(['generate', 'verify']);
  });

  it('confirms successful generation and verification', async () => {
    const writeOutput = vi.fn();
    const commands = {
      generate: async () => undefined,
      verify: async () => undefined,
    };

    await runWorkflowCatalogCommand({
      arguments: ['generate'],
      commands,
      writeError: vi.fn(),
      writeOutput,
    });
    await runWorkflowCatalogCommand({
      arguments: ['verify'],
      commands,
      writeError: vi.fn(),
      writeOutput,
    });

    expect(writeOutput.mock.calls.flat().join('\n')).toContain(
      'artifacts generated',
    );
    expect(writeOutput.mock.calls.flat().join('\n')).toContain(
      'artifacts verified',
    );
  });

  it('reports every promoted path and the manual review boundary', async () => {
    const writeOutput = vi.fn();

    await runWorkflowCatalogCommand({
      arguments: ['promote', 'order-lifecycle'],
      commands: {
        promote: async () => ({
          changedPaths: [
            'workflow-catalog.local/examples/order-lifecycle',
            'src/lib/workflow-catalog/worker/examples/order-lifecycle',
          ],
        }),
      },
      writeError: vi.fn(),
      writeOutput,
    });

    const output = writeOutput.mock.calls.flat().join('\n');
    expect(output).toContain(
      'src/lib/workflow-catalog/worker/examples/order-lifecycle',
    );
    expect(output).toContain('Review and commit');
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
