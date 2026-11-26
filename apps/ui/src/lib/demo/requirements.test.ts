import { describe, expect, it } from 'vitest';

import {
  type CliCandidate,
  type CommitFacts,
  compareVersions,
  lowestTaggedVersion,
  pickCli,
  planServerStrategy,
  satisfies,
} from './requirements';

const facts = (overrides: Partial<CommitFacts> = {}): CommitFacts => ({
  knownLocally: true,
  inCheckout: true,
  onMain: true,
  ...overrides,
});

const cli = (label: string, serverVersion: string): CliCandidate => ({
  label,
  path: `/bin/${label}`,
  serverVersion,
});

describe('compareVersions', () => {
  it('orders release lines', () => {
    expect(compareVersions('1.32.0', '1.31.2')).toBeGreaterThan(0);
    expect(compareVersions('1.31.2', '1.32.0')).toBeLessThan(0);
    expect(compareVersions('1.32.0', '1.32.0')).toBe(0);
  });

  it('ranks a release above any pre-release of the same line', () => {
    expect(compareVersions('1.32.0', '1.32.0-157.0')).toBeGreaterThan(0);
    expect(compareVersions('1.32.0-157.0', '1.31.2')).toBeGreaterThan(0);
  });

  it('orders pre-releases of one line by their numbers', () => {
    expect(compareVersions('1.32.0-158.0', '1.32.0-157.0')).toBeGreaterThan(0);
    expect(compareVersions('1.32.0-157.3', '1.32.0-157.10')).toBeLessThan(0);
  });

  it('lets a release satisfy a pre-release minimum', () => {
    expect(satisfies('1.32.0', '1.32.0-157.0')).toBe(true);
    expect(satisfies('1.32.0-100.0', '1.32.0-157.0')).toBe(false);
  });
});

describe('satisfies', () => {
  it('accepts anything when nothing is required', () => {
    expect(satisfies('1.20.0')).toBe(true);
  });

  it('accepts an unknown version rather than blocking a reused server', () => {
    expect(satisfies('unknown', '1.32.0')).toBe(true);
  });

  it('rejects a version below the minimum', () => {
    expect(satisfies('1.31.2', '1.32.0')).toBe(false);
  });
});

describe('lowestTaggedVersion', () => {
  it('takes the lowest release line among the tags', () => {
    expect(
      lowestTaggedVersion([
        'v1.32.0-158.0',
        'v1.32.0-157.0',
        'v1.33.0-1.0',
        '',
      ]),
    ).toBe('1.32.0-157.0');
  });

  it('ignores tags that are not versions', () => {
    expect(
      lowestTaggedVersion(['nightly', 'release-candidate']),
    ).toBeUndefined();
  });

  it('gives nothing for no tags', () => {
    expect(lowestTaggedVersion([])).toBeUndefined();
  });
});

describe('planServerStrategy', () => {
  it('needs nothing in particular when the definition asks for nothing', () => {
    expect(planServerStrategy({}, undefined)).toEqual({
      minServerVersion: undefined,
      mustBuildLocally: false,
      reasons: [],
    });
  });

  it('passes a plain minimum version through', () => {
    const plan = planServerStrategy({ minServerVersion: '1.32.0' }, undefined);

    expect(plan.mustBuildLocally).toBe(false);
    expect(plan.minServerVersion).toBe('1.32.0');
    expect(plan.reasons.join(' ')).toContain('1.32.0 or later');
  });

  it('derives the minimum from the tags that contain the commit', () => {
    const plan = planServerStrategy(
      { serverCommit: '01aa279c462fd9e7efc8e0ba6bbc4554b51557dd' },
      facts({ firstTaggedVersion: '1.32.0-157.0' }),
    );

    expect(plan.mustBuildLocally).toBe(false);
    expect(plan.minServerVersion).toBe('1.32.0-157.0');
    expect(plan.reasons.join(' ')).toContain('first tagged 1.32.0-157.0');
  });

  it('keeps the definition minimum when it is higher than the derived one', () => {
    const plan = planServerStrategy(
      { serverCommit: 'abc1234', minServerVersion: '1.33.0' },
      facts({ firstTaggedVersion: '1.32.0-157.0' }),
    );

    expect(plan.minServerVersion).toBe('1.33.0');
  });

  it('requires a local build for a commit that is on main but untagged', () => {
    const plan = planServerStrategy(
      { serverCommit: 'abc1234' },
      facts({ firstTaggedVersion: undefined }),
    );

    expect(plan.mustBuildLocally).toBe(true);
    expect(plan.reasons.join(' ')).toContain('no version tag yet');
  });

  it('requires a local build for a commit that is not on main', () => {
    const plan = planServerStrategy(
      { serverCommit: 'abc1234' },
      facts({ onMain: false, firstTaggedVersion: undefined }),
    );

    expect(plan.mustBuildLocally).toBe(true);
    expect(plan.reasons.join(' ')).toContain('not on main yet');
  });

  it('requires a local build when no checkout can resolve the commit', () => {
    const plan = planServerStrategy(
      { serverCommit: 'abc1234' },
      facts({ knownLocally: false, inCheckout: false, onMain: false }),
    );

    expect(plan.mustBuildLocally).toBe(true);
    expect(plan.reasons.join(' ')).toContain(
      'could not be resolved in a server checkout',
    );
  });
});

describe('pickCli', () => {
  it('takes the highest version that meets the minimum', () => {
    const chosen = pickCli(
      [cli('old', '1.30.0'), cli('good', '1.32.0'), cli('best', '1.33.0')],
      '1.32.0',
    );

    expect(chosen?.label).toBe('best');
  });

  it('gives nothing when every candidate is too old', () => {
    expect(pickCli([cli('old', '1.31.2')], '1.32.0')).toBeUndefined();
  });

  it('ignores a candidate whose version could not be read', () => {
    expect(pickCli([cli('broken', 'unknown')], '1.32.0')).toBeUndefined();
  });

  it('takes the highest of all candidates when nothing is required', () => {
    expect(pickCli([cli('a', '1.30.0'), cli('b', '1.31.2')])?.label).toBe('b');
  });
});
