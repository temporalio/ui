#!/usr/bin/env node
// Gate: fail if svelte-check surfaces any Svelte accessibility warning (code `a11y_*`).
//
// Svelte emits a11y issues as compiler *warnings*, which svelte-check does not
// fail on by default. `--fail-on-warnings` can't be used here because the repo
// carries unrelated non-a11y warnings, and Svelte 5's `compilerOptions.warningFilter`
// only suppresses warnings, it can't escalate them. So this script runs svelte-check,
// keeps every other warning as-is, and fails *only* on `a11y_*` codes — turning
// accessibility warnings into a CI error without touching anything else.
import { spawnSync } from 'node:child_process';

const result = spawnSync(
  'svelte-check',
  ['--tsconfig', './tsconfig.json', '--output', 'machine'],
  {
    encoding: 'utf8',
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, VITE_TEMPORAL_UI_BUILD_TARGET: 'local' },
  },
);

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

// Svelte 5 a11y warning codes are all `a11y_*` (e.g. a11y_missing_attribute) and
// appear in the diagnostic message / doc URL. Match the code specifically so a path
// segment like `scripts/a11y/` never produces a false positive.
const a11yDiagnostics = output
  .split('\n')
  .filter((line) => /\b(ERROR|WARNING)\b/.test(line) && /a11y_/.test(line));

if (a11yDiagnostics.length > 0) {
  console.error(
    `\n✖ ${a11yDiagnostics.length} Svelte accessibility warning(s) — a11y warnings are gated as errors:\n`,
  );
  for (const line of a11yDiagnostics) console.error(`  ${line.trim()}`);
  console.error(
    '\nFix the accessibility issues above (prefer a Holocene primitive; see CLAUDE.md → Accessibility).\n',
  );
  process.exit(1);
}

if (result.status !== 0 && output.trim() === '') {
  console.error(
    'svelte-check produced no output and exited non-zero — cannot verify a11y state.',
  );
  process.exit(result.status ?? 1);
}

console.log('✓ svelte-check surfaced no Svelte a11y warnings.');
