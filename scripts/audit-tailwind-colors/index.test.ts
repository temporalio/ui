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

const retiredTailwindClasses = [
  'bg-action-hover-overlay',
  'bg-action-press-overlay',
  'bg-action-brand-hover',
  'bg-action-brand-press',
  'via-actions-hover-overlay',
  'via-actions-press-overlay',
  'via-actions-brand-hover',
  'via-actions-brand-press',
  'bg-overlay-primary',
  'bg-overlay-secondary',
  'bg-overlay-tertiary',
  'bg-overlay-information',
  'bg-overlay-success',
  'bg-overlay-warning',
  'bg-overlay-danger',
  'bg-overlay-error',
  'bg-overlay-accent',
  'bg-overlay-backdrop',
  'text-static-text-info',
  'text-static-text-success',
  'text-static-text-warning',
  'text-static-text-danger',
  'bg-surface-static-neutral',
];

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
      <div class="accent-auto bg-background-primary bg-surface-primary bg-surface-neutral bg-surface-accent bg-interactive-primary bg-interactive-tertiary-hover bg-surface-overlay-primary bg-surface-overlay-accent bg-action-info bg-content-primary bg-content-accent bg-border-primary bg-border-accent bg-white bg-black bg-indigo-9 bg-alpha-red-30 border-primary border-accent border-action-danger border-interactive-primary border-content-primary divide-primary ring-danger ring-accent ring-interactive-primary ring-offset-background-primary outline-danger outline-accent outline-interactive-primary caret-primary caret-accent fill-primary fill-accent fill-action-workflow-signal fill-indigo-9 fill-none stroke-action-workflow-timer stroke-indigo-9 stroke-none from-surface-primary from-surface-accent via-interactive-tertiary-hover via-surface-overlay-accent to-action-workflow-workflow to-content-accent decoration-primary decoration-accent shadow-content-inverse-primary shadow-content-accent placeholder-tertiary placeholder-accent text-primary text-brand text-accent text-static-success text-action-workflow-activity text-white bg-inherit text-current border-transparent bg-[#123456] outline-none shadow-none bg-none border-none decoration-auto decoration-from-font text-sm border-2 ring-2 ring-offset-2 stroke-2 text-indigo-6 text-alpha-red-30 border-slate-1 border-alpha-neutral-30 ring-green-7 ring-alpha-indigo-30 divide-purple-5 outline-alpha-blue-30 caret-red-9 placeholder-alpha-slate-20 decoration-indigo-6 shadow-alpha-neutral-30 ring-offset-slate-1 accent-alpha-green-30 border-white ring-black">
        <span style="color: var(--color-content-primary); background: var(--color-interactive-tertiary-hover)">Valid</span>
      </div>
    `);

    const result = await runAudit(directory);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('No color API violations found');
    expect(result.stderr).toBe('');
  });

  it('rejects parsed unknown colors while accepting registered colors', async () => {
    const directory = await createAuditTarget(`
      <div class="bg-surface-garbage bg-content-static-text-success bg-background-secondary">Colors</div>
    `);

    const result = await runAudit(directory);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain(
      '[legacy-tailwind-color] bg-surface-garbage',
    );
    expect(result.stderr).toContain(
      '[legacy-tailwind-color] bg-content-static-text-success',
    );
    expect(result.stderr).toContain(
      '[legacy-tailwind-color] bg-background-secondary',
    );
  });

  it('rejects io colors and variables, Tailwind defaults, legacy aliases, and property-invalid colors', async () => {
    const directory = await createAuditTarget(`
      <div class="bg-io-surface-primary text-io-content-primary border-io-border-primary divide-io-border-primary ring-io-interactive-primary ring-offset-io-background-primary outline-io-border-danger caret-io-content-danger fill-io-content-primary stroke-io-indigo-9 from-io-surface-primary decoration-io-content-primary shadow-io-content-primary accent-io-content-primary placeholder-io-content-primary bg-gray-100 text-red-500 stroke-white bg-primary ${retiredTailwindClasses.join(' ')} surface-primary text-surface-primary border-surface-primary divide-interactive-primary ring-surface-primary ring-offset-primary outline-content-primary caret-border-danger fill-surface-primary stroke-primary from-primary decoration-border-primary shadow-primary accent-primary placeholder-surface-primary bg-content-white border-content-black from-content-white shadow-content-black text-content-white">
        <span style="color: var(--color-io-content-primary); border-color: var(--color-text-primary); background: var(--color-actions-hover-overlay)">Invalid</span>
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
    for (const className of retiredTailwindClasses) {
      expect(result.stderr).toContain(`[legacy-tailwind-color] ${className}`);
    }
    expect(result.stderr).toContain(
      '[legacy-css-variable] --color-actions-hover-overlay',
    );
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
