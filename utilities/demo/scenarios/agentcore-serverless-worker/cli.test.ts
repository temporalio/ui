import { describe, expect, it } from 'vitest';

import { cliCandidates, MIN_CLI_VERSION, parseCliVersion } from './cli';

describe('parseCliVersion', () => {
  it('reads the version out of real CLI output', () => {
    expect(
      parseCliVersion('temporal version 1.8.3 (Server 1.31.2, UI 2.50.1)'),
    ).toBe('1.8.3');
  });

  it('handles a v prefix and a pre-release suffix', () => {
    expect(parseCliVersion('temporal version v1.9.0-rc1 (Server 1.32.0)')).toBe(
      '1.9.0-rc1',
    );
  });

  it('returns undefined for output it does not recognise', () => {
    expect(parseCliVersion('command not found')).toBeUndefined();
  });
});

describe('cliCandidates', () => {
  // A package-manager CLI is often older than the repository pins, and the
  // agentcore flags are new enough that the difference decides the run.
  it('prefers the repository CLI over PATH', () => {
    const candidates = cliCandidates('/repo');

    expect(candidates.indexOf('/repo/bin/cli/temporal')).toBeLessThan(
      candidates.indexOf('temporal'),
    );
  });

  it('lets TEMPORAL_CLI win over both', () => {
    const previous = process.env.TEMPORAL_CLI;
    process.env.TEMPORAL_CLI = '/custom/temporal';

    try {
      expect(cliCandidates('/repo')[0]).toBe('/custom/temporal');
    } finally {
      if (previous === undefined) delete process.env.TEMPORAL_CLI;
      else process.env.TEMPORAL_CLI = previous;
    }
  });
});

describe('MIN_CLI_VERSION', () => {
  it('is the release that added the --aws-agentcore-* flags', () => {
    expect(MIN_CLI_VERSION).toBe('1.8.3');
  });
});
