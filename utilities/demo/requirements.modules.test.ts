import { describe, expect, it } from 'vitest';

import {
  moduleSatisfies,
  readModuleVersions,
  unmetModuleRequirements,
} from './requirements';

// Shaped like temporalio/temporal's go.mod, with the auto-scaled-workers line
// at the pseudo-version that first registers the aws-agentcore provider.
const GO_MOD = `module go.temporal.io/server

go 1.25.4

require (
	github.com/aws/aws-sdk-go-v2 v1.43.4
	go.temporal.io/api v1.63.5
	go.temporal.io/auto-scaled-workers v0.0.0-20260824233950-312f95fb8b99
	google.golang.org/grpc v1.83.0
)

require go.temporal.io/sdk v1.48.0
`;

const ASW = 'go.temporal.io/auto-scaled-workers';
const BUMPED = 'v0.0.0-20260824233950-312f95fb8b99';
const BEFORE = 'v0.0.0-20260811170210-91f6fe1d10ab';

describe('readModuleVersions', () => {
  it('reads a module version out of a require block', () => {
    expect(readModuleVersions(GO_MOD, [ASW])[ASW]).toBe(BUMPED);
  });

  it('reports undefined for a module the go.mod does not pin', () => {
    expect(
      readModuleVersions(GO_MOD, ['example.com/nope'])['example.com/nope'],
    ).toBeUndefined();
  });

  it('does not confuse a module with one whose path extends it', () => {
    const mod =
      'require (\n\tgo.temporal.io/api/extra v1.0.0\n\tgo.temporal.io/api v1.63.5\n)';
    expect(
      readModuleVersions(mod, ['go.temporal.io/api'])['go.temporal.io/api'],
    ).toBe('v1.63.5');
  });
});

describe('moduleSatisfies', () => {
  it('orders pseudo-versions by their embedded commit timestamp', () => {
    expect(moduleSatisfies(BUMPED, BUMPED)).toBe(true);
    expect(moduleSatisfies(BUMPED, BEFORE)).toBe(true);
    expect(moduleSatisfies(BEFORE, BUMPED)).toBe(false);
  });

  it('treats a tagged release as satisfying a pseudo-version floor', () => {
    expect(moduleSatisfies('v1.2.3', BUMPED)).toBe(true);
  });

  it('falls back to semver for tagged versions', () => {
    expect(moduleSatisfies('v1.63.5', 'v1.63.4')).toBe(true);
    expect(moduleSatisfies('v1.63.3', 'v1.63.4')).toBe(false);
  });
});

describe('unmetModuleRequirements', () => {
  it('passes the bumped server', () => {
    expect(unmetModuleRequirements(GO_MOD, { [ASW]: BUMPED })).toEqual([]);
  });

  it('names the module, the floor, and what was found when short', () => {
    const future = 'v0.0.0-20991231235959-ffffffffffff';
    expect(unmetModuleRequirements(GO_MOD, { [ASW]: future })).toEqual([
      { module: ASW, required: future, found: BUMPED },
    ]);
  });

  it('reports a module that is absent entirely', () => {
    expect(
      unmetModuleRequirements(GO_MOD, { 'example.com/nope': 'v1.0.0' }),
    ).toEqual([
      { module: 'example.com/nope', required: 'v1.0.0', found: undefined },
    ]);
  });

  it('is a no-op with no requirements', () => {
    expect(unmetModuleRequirements(GO_MOD)).toEqual([]);
  });
});
