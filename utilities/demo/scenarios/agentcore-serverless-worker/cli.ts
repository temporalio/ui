import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { $ } from 'zx';

import { failure } from '../../remedy';
import { compareVersions } from '../../requirements';

/**
 * The CLI release that first carries the --aws-agentcore-* flags
 * (temporalio/cli#1177).
 */
export const MIN_CLI_VERSION = '1.8.3';

/** `temporal version 1.8.3 (Server ...)` -> `1.8.3`. */
export const parseCliVersion = (output: string): string | undefined =>
  /version\s+v?(\d+\.\d+\.\d+\S*)/.exec(output)?.[1];

/**
 * Which `temporal` to shell out to.
 *
 * PATH is checked last on purpose. A machine that has ever installed the CLI
 * from a package manager is likely to have an older one there than the
 * repository pins, and the agentcore flags are new enough that the difference
 * decides whether this scenario can run at all.
 */
export const cliCandidates = (cwd = process.cwd()): string[] => [
  ...(process.env.TEMPORAL_CLI ? [process.env.TEMPORAL_CLI] : []),
  join(cwd, 'bin', 'cli', 'temporal'),
  'temporal',
];

export const resolveCli = async (cwd = process.cwd()): Promise<string> => {
  const seen: string[] = [];

  for (const candidate of cliCandidates(cwd)) {
    const isPath = candidate.includes('/');

    if (isPath && !existsSync(candidate)) continue;

    const probe = await $`${candidate} --version`.quiet().nothrow();

    if (probe.exitCode !== 0) continue;

    const version = parseCliVersion(probe.stdout);

    if (!version) continue;

    if (compareVersions(version, MIN_CLI_VERSION) >= 0) return candidate;

    seen.push(`${candidate} is ${version}`);
  }

  throw failure({
    attempting: `No Temporal CLI new enough to configure an AgentCore compute provider. The --aws-agentcore-* flags arrived in ${MIN_CLI_VERSION}.`,
    reported: seen.join('\n'),
    fixes: [
      'Run "pnpm install" in this repository: its prepare step downloads a CLI into bin/cli, which is preferred over PATH.',
      'Or upgrade the one on PATH: brew upgrade temporal.',
      `Or point TEMPORAL_CLI at a binary of ${MIN_CLI_VERSION} or later.`,
    ],
    seeAlso: ['https://github.com/temporalio/cli/releases'],
  });
};
