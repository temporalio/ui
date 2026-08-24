import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

type AuditResult = {
  code: number;
  stdout: string;
  stderr: string;
};

const temporaryDirectories: string[] = [];

const createAuditTarget = async (source: string): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), 'tailwind-color-audit-'));
  temporaryDirectories.push(directory);
  await writeFile(join(directory, 'fixture.svelte'), source);
  return directory;
};

const runAudit = (directory: string): Promise<AuditResult> =>
  new Promise((resolve) => {
    execFile(
      'pnpm',
      ['exec', 'esno', 'scripts/audit-tailwind-colors', '--', directory],
      { cwd: process.cwd() },
      (error, stdout, stderr) => {
        resolve({
          code: typeof error?.code === 'number' ? error.code : error ? 1 : 0,
          stdout,
          stderr,
        });
      },
    );
  });

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
});

describe('Tailwind color audit CLI', () => {
  it('accepts the property-aware API, generated variables, and arbitrary colors', async () => {
    const directory = await createAuditTarget(`
      <div class="accent-auto bg-background-primary bg-surface-primary bg-interactive-primary bg-action-hover-overlay bg-overlay-primary bg-content-primary bg-border-primary bg-white bg-black bg-indigo-9 bg-alpha-red-30 border-primary border-interactive-primary border-content-primary divide-primary ring-danger ring-interactive-primary ring-offset-background-primary outline-danger outline-interactive-primary caret-primary fill-primary fill-indigo-9 fill-none stroke-indigo-9 stroke-none from-surface-primary via-actions-hover-overlay to-indigo-9 decoration-primary shadow-content-inverse-primary placeholder-tertiary text-primary text-brand text-white bg-inherit text-current border-transparent bg-[#123456] outline-none shadow-none bg-none border-none decoration-auto decoration-from-font text-sm border-2 ring-2 ring-offset-2 stroke-2 text-indigo-6 text-alpha-red-30 border-slate-1 border-alpha-neutral-30 ring-green-7 ring-alpha-indigo-30 divide-purple-5 outline-alpha-blue-30 caret-red-9 placeholder-alpha-slate-20 decoration-indigo-6 shadow-alpha-neutral-30 ring-offset-slate-1 accent-alpha-green-30 border-white ring-black">
        <span style="color: var(--color-content-primary); background: var(--color-actions-hover-overlay)">Valid</span>
      </div>
    `);

    const result = await runAudit(directory);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('No color API violations found');
    expect(result.stderr).toBe('');
  });

  it('rejects io colors and variables, Tailwind defaults, legacy aliases, and property-invalid colors', async () => {
    const directory = await createAuditTarget(`
      <div class="bg-io-surface-primary text-io-content-primary border-io-border-primary divide-io-border-primary ring-io-interactive-primary ring-offset-io-background-primary outline-io-border-danger caret-io-content-danger fill-io-content-primary stroke-io-indigo-9 from-io-surface-primary decoration-io-content-primary shadow-io-content-primary accent-io-content-primary placeholder-io-content-primary bg-gray-100 text-red-500 stroke-white bg-primary surface-primary text-surface-primary border-surface-primary divide-interactive-primary ring-surface-primary ring-offset-primary outline-content-primary caret-border-danger fill-surface-primary stroke-primary from-primary decoration-border-primary shadow-primary accent-primary placeholder-surface-primary bg-content-white border-content-black from-content-white shadow-content-black text-content-white">
        <span style="color: var(--color-io-content-primary); background: var(--color-text-primary)">Invalid</span>
      </div>
    `);

    const result = await runAudit(directory);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain('color API violations');
    expect(result.stderr).toContain(
      '[legacy-tailwind-color] bg-io-surface-primary',
    );
    expect(result.stderr).toContain('[legacy-tailwind-color] bg-gray-100');
    expect(result.stderr).toContain(
      '[legacy-tailwind-color] text-surface-primary',
    );
    expect(result.stderr).toContain('[legacy-tailwind-color] bg-primary');
    expect(result.stderr).toContain(
      '[legacy-tailwind-color] outline-content-primary',
    );
    expect(result.stderr).toContain('[legacy-tailwind-color] shadow-primary');
    expect(result.stderr).toContain('[legacy-tailwind-color] bg-content-white');
    expect(result.stderr).toContain(
      '[legacy-tailwind-color] border-content-black',
    );
    expect(result.stderr).toContain('[legacy-component] surface-primary');
    expect(result.stderr).toContain(
      '[legacy-css-variable] --color-io-content-primary',
    );
    expect(result.stderr).toContain(
      '[legacy-css-variable] --color-text-primary',
    );
    expect(result.stderr).toContain(
      'Use the property-aware unprefixed color API',
    );
  });
});
