import { describe, expect, it } from 'vitest';

import {
  moduleSatisfies,
  readModuleVersions,
  unmetModuleRequirements,
  workspaceGoVersion,
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

describe('workspaceGoVersion', () => {
  const mod = (version: string) => `module x\n\ngo ${version}\n`;

  it('takes the highest directive among the modules', () => {
    // The real failure: the CLI moved to 1.26.5 while the server was on 1.26.4,
    // and a workspace pinned to the lower one will not build.
    expect(workspaceGoVersion([mod('1.26.4'), mod('1.26.5')])).toBe('1.26.5');
    expect(workspaceGoVersion([mod('1.26.5'), mod('1.26.4')])).toBe('1.26.5');
  });

  it('handles a two-part directive', () => {
    expect(workspaceGoVersion([mod('1.27')])).toBe('1.27');
  });

  it('falls back when no module declares one', () => {
    expect(workspaceGoVersion(['module x\n'], '1.24')).toBe('1.24');
  });

  it('ignores a go directive inside a require line', () => {
    const tricky =
      'module x\n\ngo 1.26.4\n\nrequire (\n\tgo.temporal.io/api v1.63.5\n)\n';

    expect(workspaceGoVersion([tricky])).toBe('1.26.4');
  });
});
