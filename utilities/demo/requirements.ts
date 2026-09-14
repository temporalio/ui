/**
 * Decides which Temporal server a feature needs, and the cheapest way to get
 * it. A definition says what the feature requires; it does not have to know
 * whether a release carries it yet.
 */

export type FeatureRequirement = {
  serverCommit?: string;
  minServerVersion?: string;
};

export type CommitFacts = {
  /** The commit is in the server checkout's object store. */
  knownLocally: boolean;
  /** The commit is an ancestor of the checkout's HEAD, so a build here has it. */
  inCheckout: boolean;
  /** The commit is an ancestor of main, so a release will carry it eventually. */
  onMain: boolean;
  /** The lowest release line whose tags contain the commit, e.g. `1.32.0`. */
  firstTaggedVersion?: string;
};

export type CliCandidate = {
  label: string;
  path: string;
  serverVersion: string;
};

export type StrategyPlan = {
  minServerVersion?: string;
  mustBuildLocally: boolean;
  reasons: string[];
};

const parseVersion = (version: string) => {
  const [line, ...rest] = version.trim().replace(/^v/, '').split('-');

  return {
    release: line.split('.').map((part) => Number.parseInt(part, 10) || 0),
    prerelease: rest.join('-').split('.').filter(Boolean),
  };
};

const comparePrerelease = (a: readonly string[], b: readonly string[]) => {
  // A release outranks any pre-release of the same line, so 1.32.0 is newer
  // than 1.32.0-157.0 and satisfies a minimum of it.
  if (!a.length && !b.length) return 0;
  if (!a.length) return 1;
  if (!b.length) return -1;

  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const left = a[index];
    const right = b[index];

    if (left === undefined) return -1;
    if (right === undefined) return 1;
    if (left === right) continue;

    const numeric = /^\d+$/.test(left) && /^\d+$/.test(right);

    if (numeric) return Number.parseInt(left, 10) - Number.parseInt(right, 10);

    return left < right ? -1 : 1;
  }

  return 0;
};

export const compareVersions = (left: string, right: string): number => {
  const a = parseVersion(left);
  const b = parseVersion(right);

  for (let index = 0; index < 3; index += 1) {
    if ((a.release[index] ?? 0) !== (b.release[index] ?? 0)) {
      return (a.release[index] ?? 0) - (b.release[index] ?? 0);
    }
  }

  return comparePrerelease(a.prerelease, b.prerelease);
};

export const satisfies = (version: string, minimum?: string) =>
  !minimum || version === 'unknown' || compareVersions(version, minimum) >= 0;

/**
 * The lowest release line among tags that contain a commit. A tag such as
 * `v1.32.0-157.3` is a pre-release of `1.32.0`, so the release line is what a
 * published CLI has to reach.
 */
export const lowestTaggedVersion = (tags: readonly string[]) => {
  const versions = tags
    .map((tag) => tag.trim().replace(/^v/, ''))
    .filter((tag) => /^\d+\.\d+\.\d+/.test(tag));

  if (!versions.length) return undefined;

  return versions.reduce((lowest, candidate) =>
    compareVersions(candidate, lowest) < 0 ? candidate : lowest,
  );
};

export const planServerStrategy = (
  requirement: FeatureRequirement,
  commit: CommitFacts | undefined,
): StrategyPlan => {
  const reasons: string[] = [];

  if (!requirement.serverCommit) {
    if (requirement.minServerVersion) {
      reasons.push(
        `The definition asks for Server ${requirement.minServerVersion} or later.`,
      );
    }

    return {
      minServerVersion: requirement.minServerVersion,
      mustBuildLocally: false,
      reasons,
    };
  }

  const short = requirement.serverCommit.slice(0, 9);

  if (!commit?.knownLocally) {
    // A stated floor needs no git history, so it is preferred over a build.
    if (requirement.minServerVersion) {
      reasons.push(
        `Commit ${short} adds the feature, and the definition states that Server ${requirement.minServerVersion} or later has it.`,
      );

      return {
        minServerVersion: requirement.minServerVersion,
        mustBuildLocally: false,
        reasons,
      };
    }

    reasons.push(
      `Commit ${short} could not be resolved in a server checkout and the definition states no minServerVersion, so its release line is unknown.`,
    );

    return { mustBuildLocally: true, reasons };
  }

  if (!commit.onMain) {
    reasons.push(
      `Commit ${short} is not on main yet, so no release can carry it. Only a build from the checkout will do.`,
    );

    return {
      minServerVersion: requirement.minServerVersion,
      mustBuildLocally: true,
      reasons,
    };
  }

  if (!commit.firstTaggedVersion) {
    reasons.push(
      `Commit ${short} is on main but carries no version tag yet, so no release has it. Only a build from the checkout will do.`,
    );

    return {
      minServerVersion: requirement.minServerVersion,
      mustBuildLocally: true,
      reasons,
    };
  }

  const derived = commit.firstTaggedVersion;
  const minimum =
    requirement.minServerVersion &&
    compareVersions(requirement.minServerVersion, derived) > 0
      ? requirement.minServerVersion
      : derived;

  reasons.push(
    `Commit ${short} is on main and first tagged ${derived}, so any Server ${minimum} or later has it.`,
  );

  return { minServerVersion: minimum, mustBuildLocally: false, reasons };
};

/** The highest-versioned candidate that meets the minimum, if any. */
export const pickCli = (
  candidates: readonly CliCandidate[],
  minimum?: string,
): CliCandidate | undefined =>
  candidates
    .filter((candidate) => candidate.serverVersion !== 'unknown')
    .filter((candidate) => satisfies(candidate.serverVersion, minimum))
    .reduce<CliCandidate | undefined>(
      (best, candidate) =>
        !best ||
        compareVersions(candidate.serverVersion, best.serverVersion) > 0
          ? candidate
          : best,
      undefined,
    );
