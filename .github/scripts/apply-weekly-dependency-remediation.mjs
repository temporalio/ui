#!/usr/bin/env node

/**
 * Plans the smallest safe package.json change for Dependabot alerts.
 *
 * This script deliberately does not run a package manager or inspect/edit a
 * lockfile. The workflow owns `pnpm install --lockfile-only` after a reviewed
 * plan has changed the manifest.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REMEDIABLE_MANIFESTS = new Set(['package.json', 'pnpm-lock.yaml']);
const GO_MANIFESTS = new Set(['server/go.mod', 'server/go.sum']);
const DIRECT_DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies'];
const VERSION =
  /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const VERSION_IN_RANGE =
  /(?<operator>\^|~|>=|>|=)?\s*(?<version>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?<prerelease>-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/;

export function parseSemver(version) {
  if (typeof version !== 'string') return null;
  const match = VERSION.exec(version.trim());
  if (!match?.groups) return null;

  return {
    major: Number(match.groups.major),
    minor: Number(match.groups.minor),
    patch: Number(match.groups.patch),
    version: version.trim(),
  };
}

export function compareSemver(left, right) {
  const a = typeof left === 'string' ? parseSemver(left) : left;
  const b = typeof right === 'string' ? parseSemver(right) : right;
  if (!a || !b)
    throw new TypeError('compareSemver requires concrete semver versions');

  for (const key of ['major', 'minor', 'patch']) {
    if (a[key] !== b[key]) return a[key] < b[key] ? -1 : 1;
  }
  return 0;
}

export function isVersionAtLeast(version, floor) {
  const parsedVersion = parseSemver(version);
  const parsedFloor = parseSemver(floor);
  return Boolean(
    parsedVersion &&
    parsedFloor &&
    compareSemver(parsedVersion, parsedFloor) >= 0,
  );
}

const RANGE_CONSTRAINT = /^(>=|<=|>|<|=)?\s*(.+)$/;

function satisfiesConstraint(comparison, operator) {
  if (operator === '<') return comparison < 0;
  if (operator === '<=') return comparison <= 0;
  if (operator === '>') return comparison > 0;
  if (operator === '>=') return comparison >= 0;
  return comparison === 0;
}

export function isVersionVulnerable(version, range) {
  const target = parseSemver(version);
  if (!target || typeof range !== 'string') return true;
  const constraints = range
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (constraints.length === 0) return true;

  for (const constraint of constraints) {
    const match = RANGE_CONSTRAINT.exec(constraint);
    if (!match) return true;
    const bound = parseSemver(match[2]);
    if (!bound) return true;
    if (!satisfiesConstraint(compareSemver(target, bound), match[1] ?? '=')) {
      return false;
    }
  }
  return true;
}

function rangeLowerBound(range) {
  if (typeof range !== 'string') return null;
  const match = VERSION_IN_RANGE.exec(range.trim());
  if (!match?.groups) return null;
  const prerelease = match.groups.prerelease ?? '';
  return {
    operator: match.groups.operator ?? '',
    version: `${match.groups.version}.${match.groups.minor}.${match.groups.patch}${prerelease}`,
    prerelease: Boolean(prerelease),
  };
}

function prereleaseBoundReason(kind, bound) {
  return `${kind} lower bound ${bound.version} carries a prerelease tag, which this planner does not order.`;
}

function isSimpleRange(range) {
  if (typeof range !== 'string') return false;
  return /^(?:\^|~|>=|>|=)?\s*\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
    range.trim(),
  );
}

const COMPOUND_RANGE =
  /^(?<lowerOperator>>=|>)\s*(?<lower>(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?)\s+(?<upperOperator><=|<)\s*(?<upper>(?:0|[1-9]\d*)(?:\.\d+){0,2})$/;

function parseOverrideRange(range) {
  if (typeof range !== 'string') return null;
  if (isSimpleRange(range)) {
    const bound = rangeLowerBound(range);
    return bound ? { ...bound, upper: null } : null;
  }
  const match = COMPOUND_RANGE.exec(range.trim());
  if (!match?.groups) return null;
  return {
    operator: match.groups.lowerOperator,
    version: match.groups.lower,
    upper: {
      operator: match.groups.upperOperator,
      version: match.groups.upper,
    },
  };
}

function satisfiesUpperBound(version, upper) {
  const parts = upper.version.split('.');
  while (parts.length < 3) parts.push('0');
  const ceiling = parseSemver(parts.join('.'));
  const target = parseSemver(version);
  if (!ceiling || !target) return false;
  const comparison = compareSemver(target, ceiling);
  return upper.operator === '<=' ? comparison <= 0 : comparison < 0;
}

function raisedRange(bound, patched) {
  if (!bound.upper) return `${bound.operator}${patched}`;
  return `${bound.operator}${patched} ${bound.upper.operator}${bound.upper.version}`;
}

const LOCKFILE_PACKAGE_KEY = /^ {2}('?)(?<entry>[^'\s]+)\1:\s*$/;

export function parseLockfileVersions(lockfileText) {
  const versions = new Map();
  if (typeof lockfileText !== 'string') return versions;

  let insidePackages = false;
  for (const line of lockfileText.split('\n')) {
    if (/^\S/.test(line)) {
      insidePackages = line.trimEnd() === 'packages:';
      continue;
    }
    if (!insidePackages) continue;

    const match = LOCKFILE_PACKAGE_KEY.exec(line);
    if (!match?.groups) continue;

    const entry = match.groups.entry.replace(/\(.*\)$/, '');
    const separator = entry.lastIndexOf('@');
    if (separator <= 0) continue;

    const name = entry.slice(0, separator);
    const version = entry.slice(separator + 1);
    if (!parseSemver(version)) continue;

    const found = versions.get(name) ?? [];
    if (!found.includes(version)) found.push(version);
    versions.set(name, found);
  }

  for (const found of versions.values()) {
    found.sort((left, right) => compareSemver(left, right));
  }
  return versions;
}

const GO_REQUIREMENT =
  /^(?<module>[^\s()]+)\s+(?<version>v[^\s]+)(?<indirect>\s+\/\/\s*indirect)?$/;

export function parseGoRequirements(goModText) {
  const requirements = new Map();
  if (typeof goModText !== 'string') return requirements;

  let insideBlock = false;
  for (const raw of goModText.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('require (')) {
      insideBlock = true;
      continue;
    }
    if (insideBlock && line === ')') {
      insideBlock = false;
      continue;
    }

    const candidate = insideBlock
      ? line
      : line.startsWith('require ')
        ? line.slice('require '.length).trim()
        : null;
    if (!candidate) continue;

    const match = GO_REQUIREMENT.exec(candidate);
    if (!match?.groups) continue;
    requirements.set(match.groups.module, {
      version: match.groups.version,
      indirect: Boolean(match.groups.indirect),
    });
  }
  return requirements;
}

function goSemver(version) {
  if (typeof version !== 'string' || !version.startsWith('v')) return null;
  const bare = version.slice(1);
  if (bare.includes('-')) return null;
  return parseSemver(bare);
}

function flattenAlerts(audit) {
  if (Array.isArray(audit)) return audit;
  if (Array.isArray(audit?.dependabot?.alerts)) return audit.dependabot.alerts;
  if (Array.isArray(audit?.alerts)) return audit.alerts;
  if (Array.isArray(audit?.dependabotAlerts)) return audit.dependabotAlerts;
  return [];
}

function vulnerabilityForAlert(alert) {
  const direct = alert?.security_vulnerability ?? alert?.securityVulnerability;
  if (direct) return direct;
  return (
    alert?.security_advisory?.vulnerabilities?.[0] ??
    alert?.securityAdvisory?.vulnerabilities?.[0]
  );
}

function versionIdentifier(value) {
  if (typeof value === 'string') return value;
  return value?.identifier ?? null;
}

/** Normalize either GitHub Dependabot REST responses or the weekly audit shape. */
export function normalizeAlerts(audit) {
  return flattenAlerts(audit).map((alert, index) => {
    const vulnerability = vulnerabilityForAlert(alert) ?? {};
    const dependency = alert?.dependency ?? {};
    const dependencyPackage = dependency.package ?? {};
    const vulnerabilityPackage = vulnerability.package ?? {};
    const firstPatched =
      versionIdentifier(vulnerability.first_patched_version) ??
      versionIdentifier(vulnerability.firstPatchedVersion) ??
      versionIdentifier(alert?.first_patched_version) ??
      versionIdentifier(alert?.firstPatchedVersion) ??
      null;
    const normalizedPackageName =
      typeof alert?.package === 'string' ? alert.package : alert?.package?.name;

    return {
      id: alert?.number ?? alert?.id ?? index + 1,
      ecosystem:
        dependencyPackage.ecosystem ??
        vulnerabilityPackage.ecosystem ??
        alert?.ecosystem,
      manifestPath:
        dependency.manifest_path ??
        dependency.manifestPath ??
        alert?.manifest_path ??
        alert?.manifestPath,
      packageName:
        dependencyPackage.name ??
        vulnerabilityPackage.name ??
        normalizedPackageName ??
        alert?.packageName,
      patchedVersion: firstPatched,
      vulnerableRange:
        vulnerability.vulnerable_version_range ??
        vulnerability.vulnerableVersionRange ??
        alert?.vulnerableRange ??
        null,
    };
  });
}

function classification({
  packageName,
  alertIds,
  status,
  reason,
  action,
  resolvedVersions,
}) {
  return {
    packageName: packageName ?? null,
    alertIds,
    status,
    reason,
    ...(resolvedVersions ? { resolvedVersions } : {}),
    ...(action ? { action } : {}),
  };
}

function findDirectDependency(packageJson, packageName) {
  for (const section of DIRECT_DEPENDENCY_SECTIONS) {
    const version = packageJson?.[section]?.[packageName];
    if (typeof version === 'string') return { section, version };
  }
  return null;
}

function overrideSelectorTarget(selector) {
  let target = selector;
  for (let index = 1; index < selector.length; index += 1) {
    if (selector[index] !== '>') continue;
    if (selector[index - 1] === '@') continue;
    if (selector[index + 1] === '=') continue;
    target = selector.slice(index + 1);
  }
  return target.trim();
}

function overrideTargetsPackage(selector, packageName) {
  const target = overrideSelectorTarget(selector);
  return target === packageName || target.startsWith(`${packageName}@`);
}

function findOverrides(packageJson, packageName) {
  return Object.entries(packageJson?.pnpm?.overrides ?? {})
    .filter(([selector]) => overrideTargetsPackage(selector, packageName))
    .map(([selector, version]) => ({ selector, version }));
}

function isCaretCompatible(currentVersion, patchedVersion) {
  const current = parseSemver(currentVersion);
  const patched = parseSemver(patchedVersion);
  if (!current || !patched || current.major !== patched.major) return false;
  if (current.major > 0) return true;
  if (current.minor !== patched.minor) return false;
  if (current.minor > 0) return true;
  return current.patch === patched.patch;
}

function isRangeCompatible(bound, patchedVersion) {
  const current = parseSemver(bound.version);
  const patched = parseSemver(patchedVersion);
  if (!current || !patched) return false;
  if (bound.operator === '~') {
    return current.major === patched.major && current.minor === patched.minor;
  }
  return isCaretCompatible(bound.version, patchedVersion);
}

function incompatibleRangeReason({ kind, bound, patched }) {
  const current = parseSemver(bound.version);
  const target = parseSemver(patched);
  if (current.major !== target.major) {
    return `${kind} remediation requires a major upgrade from ${bound.version} to ${patched}.`;
  }
  if (bound.operator === '~') {
    return `${kind} remediation from ${bound.version} to ${patched} is outside the tilde-compatible minor version.`;
  }
  return `${kind} remediation from ${bound.version} to ${patched} is outside caret-compatible pre-1.0 bounds.`;
}

function classifyOverride({ packageName, alertIds, patched, override }) {
  const bound = parseOverrideRange(override.version);
  if (!bound) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason: `Existing pnpm override ${override.selector} uses an unsupported range: ${String(override.version)}.`,
    });
  }
  if (bound.prerelease) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason: prereleaseBoundReason('Override', bound),
    });
  }
  if (isVersionAtLeast(bound.version, patched)) {
    return classification({
      packageName,
      alertIds,
      status: 'safe',
      reason: `Existing override lower bound ${bound.version} already meets ${patched}.`,
    });
  }
  if (bound.upper && !satisfiesUpperBound(patched, bound.upper)) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason: `Override remediation to ${patched} exceeds the pinned upper bound ${bound.upper.operator}${bound.upper.version}.`,
    });
  }
  if (!bound.upper && !isRangeCompatible(bound, patched)) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason: incompatibleRangeReason({
        kind: 'Override',
        bound,
        patched,
      }),
    });
  }

  return classification({
    packageName,
    alertIds,
    status: 'safe',
    reason: `Update existing pnpm override ${override.selector} to the highest patched floor ${patched}.`,
    action: {
      type: 'pnpm-override',
      selector: override.selector,
      from: override.version,
      to: raisedRange(bound, patched),
    },
  });
}

function highestPatchedVersion(alerts) {
  const versions = alerts.map((alert) => alert.patchedVersion);
  if (versions.some((version) => !parseSemver(version))) return null;
  return versions.reduce((highest, version) =>
    compareSemver(version, highest) > 0 ? version : highest,
  );
}

/** The resolved versions that an alert of this group still covers. */
function vulnerableResolvedVersions(alerts, resolvedVersions) {
  return (resolvedVersions ?? []).filter((version) =>
    alerts.some((item) => isVersionVulnerable(version, item.vulnerableRange)),
  );
}

function classifyPackage(alerts, packageJson, resolvedVersions) {
  const result = classifyPackageStatus(alerts, packageJson, resolvedVersions);
  const stillVulnerable = vulnerableResolvedVersions(alerts, resolvedVersions);

  // The manifest satisfies the advisory and the planner therefore has no work
  // to do, but the lockfile still holds a version the advisory covers. The
  // floor does not take effect, so a person must find out why. Without this a
  // run reports success, creates no pull request, and leaves the alert open,
  // because the verification step only reads an alert that an action names.
  if (
    result.status === 'safe' &&
    !result.action &&
    stillVulnerable.length > 0
  ) {
    return classification({
      packageName: alerts[0]?.packageName,
      alertIds: alerts.map((alert) => alert.id),
      status: 'manual',
      reason: `${result.reason} The lockfile still resolves ${stillVulnerable.join(', ')}, so that floor does not take effect.`,
      resolvedVersions,
    });
  }

  if (!resolvedVersions?.length || result.resolvedVersions) return result;
  return { ...result, resolvedVersions };
}

function classifyPackageStatus(alerts, packageJson, resolvedVersions) {
  const packageName = alerts[0]?.packageName;
  const alertIds = alerts.map((alert) => alert.id);
  const patched = highestPatchedVersion(alerts);

  if (!packageName) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason: 'Alert did not identify an npm package.',
    });
  }

  if (!patched) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason: 'No concrete first patched version is available.',
    });
  }

  const patchedMajors = new Set(
    alerts.map((alert) => parseSemver(alert.patchedVersion)?.major),
  );
  if (patchedMajors.size !== 1) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason:
        'Alerts require patched versions across multiple major versions; dependency cascade is ambiguous.',
    });
  }

  const vulnerableResolved = vulnerableResolvedVersions(
    alerts,
    resolvedVersions,
  );
  if (resolvedVersions?.length && vulnerableResolved.length === 0) {
    return classification({
      packageName,
      alertIds,
      status: 'alreadySafe',
      reason: `The lockfile resolves ${packageName} to ${resolvedVersions.join(', ')}, which the advisory does not cover.`,
      resolvedVersions,
    });
  }

  const direct = findDirectDependency(packageJson, packageName);

  if (direct) {
    const bound = rangeLowerBound(direct.version);
    if (!bound || !isSimpleRange(direct.version)) {
      return classification({
        packageName,
        alertIds,
        status: 'manual',
        reason: `Direct dependency uses an unsupported range: ${direct.version}.`,
      });
    }
    if (bound.prerelease) {
      return classification({
        packageName,
        alertIds,
        status: 'manual',
        reason: prereleaseBoundReason('Direct dependency', bound),
      });
    }
    const interactingOverrides = findOverrides(packageJson, packageName);
    if (isVersionAtLeast(bound.version, patched)) {
      if (interactingOverrides.length > 1) {
        return classification({
          packageName,
          alertIds,
          status: 'manual',
          reason: `Multiple pnpm override selectors target ${packageName}; selector choice is ambiguous.`,
        });
      }
      if (interactingOverrides.length === 1) {
        return classifyOverride({
          packageName,
          alertIds,
          patched,
          override: interactingOverrides[0],
        });
      }
      return classification({
        packageName,
        alertIds,
        status: 'safe',
        reason: `Direct dependency lower bound ${bound.version} already meets ${patched}.`,
      });
    }
    if (!isRangeCompatible(bound, patched)) {
      return classification({
        packageName,
        alertIds,
        status: 'manual',
        reason: incompatibleRangeReason({
          kind: 'Direct dependency',
          bound,
          patched,
        }),
      });
    }
    if (interactingOverrides.length > 0) {
      return classification({
        packageName,
        alertIds,
        status: 'manual',
        reason: `Direct dependency also has pnpm override selector(s) ${interactingOverrides
          .map(({ selector }) => selector)
          .join(', ')}; a direct-only bump could be superseded.`,
      });
    }
    if (vulnerableResolved.length > 1) {
      return classification({
        packageName,
        alertIds,
        status: 'manual',
        reason: `The lockfile resolves ${packageName} to ${vulnerableResolved.join(', ')}; a direct dependency bump cannot reach every vulnerable copy.`,
        resolvedVersions,
      });
    }

    return classification({
      packageName,
      alertIds,
      status: 'safe',
      reason: `Bump the direct dependency to the highest patched floor ${patched}.`,
      action: {
        type: 'direct-dependency',
        section: direct.section,
        from: direct.version,
        to: `${bound.operator}${patched}`,
      },
    });
  }

  const overrides = findOverrides(packageJson, packageName);
  if (overrides.length === 0) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason:
        'Transitive package has no existing pnpm override; refusing to create an unqualified global override.',
    });
  }
  if (overrides.length > 1) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason: `Multiple pnpm override selectors target ${packageName}; selector choice is ambiguous.`,
    });
  }

  return classifyOverride({
    packageName,
    alertIds,
    patched,
    override: overrides[0],
  });
}

function classifyGoModule(alerts) {
  const moduleName = alerts[0]?.moduleName;
  const alertIds = alerts.map((alert) => alert.id);
  const patched = highestPatchedVersion(alerts);
  const requirement = alerts[0]?.requirement;

  if (!patched) {
    return classification({
      packageName: moduleName,
      alertIds,
      status: 'manual',
      reason: 'No concrete first patched version is available.',
    });
  }
  if (!requirement) {
    return classification({
      packageName: moduleName,
      alertIds,
      status: 'manual',
      reason: `server/go.mod does not require ${moduleName}.`,
    });
  }

  const current = goSemver(requirement.version);
  if (!current) {
    return classification({
      packageName: moduleName,
      alertIds,
      status: 'manual',
      reason: `server/go.mod pins ${moduleName} to ${requirement.version}, which is not a comparable release.`,
    });
  }
  if (isVersionAtLeast(current.version, patched)) {
    return classification({
      packageName: moduleName,
      alertIds,
      status: 'safe',
      reason: `server/go.mod already requires ${moduleName} at ${requirement.version}.`,
    });
  }

  const target = parseSemver(patched);
  if (current.major !== target.major) {
    return classification({
      packageName: moduleName,
      alertIds,
      status: 'manual',
      reason: `Remediation moves ${moduleName} from ${requirement.version} to v${patched}. A major upgrade changes the module path.`,
    });
  }

  return classification({
    packageName: moduleName,
    alertIds,
    status: 'safe',
    reason: `Update ${moduleName} to the highest patched version v${patched}.`,
    action: {
      type: 'go-module',
      from: requirement.version,
      to: `v${patched}`,
    },
  });
}

/**
 * Return a deterministic, manifest-only remediation plan.
 * Unsupported alerts are intentionally not mixed with npm remediation groups.
 */
export function planRemediation({ audit, packageJson, lockfile, goMod }) {
  const normalized = normalizeAlerts(audit);
  const resolved = parseLockfileVersions(lockfile);
  const goRequirements = parseGoRequirements(goMod);
  const unsupported = [];
  const npmByPackage = new Map();
  const goByModule = new Map();

  for (const alert of normalized) {
    const manifests =
      alert.ecosystem === 'npm'
        ? REMEDIABLE_MANIFESTS
        : alert.ecosystem === 'go'
          ? GO_MANIFESTS
          : null;
    if (!manifests) {
      unsupported.push(
        classification({
          packageName: alert.packageName,
          alertIds: [alert.id],
          status: 'unsupported',
          reason: `Unsupported ecosystem: ${alert.ecosystem ?? 'unknown'}.`,
        }),
      );
      continue;
    }
    if (!manifests.has(alert.manifestPath)) {
      unsupported.push(
        classification({
          packageName: alert.packageName,
          alertIds: [alert.id],
          status: 'unsupported',
          reason: `Unsupported manifest: ${alert.manifestPath ?? 'unknown'}.`,
        }),
      );
      continue;
    }

    const grouped = alert.ecosystem === 'go' ? goByModule : npmByPackage;
    const group = grouped.get(alert.packageName) ?? [];
    group.push(
      alert.ecosystem === 'go'
        ? {
            ...alert,
            moduleName: alert.packageName,
            requirement: goRequirements.get(alert.packageName),
          }
        : alert,
    );
    grouped.set(alert.packageName, group);
  }

  const classifications = [
    ...[...npmByPackage.keys()]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((packageName) =>
        classifyPackage(
          npmByPackage.get(packageName),
          packageJson,
          resolved.get(packageName),
        ),
      ),
    ...[...goByModule.keys()]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((moduleName) => classifyGoModule(goByModule.get(moduleName))),
    ...unsupported.sort((a, b) =>
      String(a.packageName).localeCompare(String(b.packageName)),
    ),
  ];
  const actions = classifications
    .filter((item) => item.action)
    .map(({ packageName, alertIds, action }) => ({
      packageName,
      alertIds,
      ...action,
    }));

  return {
    schemaVersion: 1,
    sourceAlertCount: normalized.length,
    summary: {
      safe: classifications.filter((item) => item.status === 'safe').length,
      alreadySafe: classifications.filter(
        (item) => item.status === 'alreadySafe',
      ).length,
      manual: classifications.filter((item) => item.status === 'manual').length,
      unsupported: classifications.filter(
        (item) => item.status === 'unsupported',
      ).length,
      actions: actions.length,
    },
    classifications,
    actions,
  };
}

/** Apply only the manifest paths explicitly permitted by a remediation plan. */
export function applyRemediation(packageJson, plan) {
  const next = structuredClone(packageJson);
  for (const action of plan.actions) {
    if (action.type === 'direct-dependency') {
      if (!DIRECT_DEPENDENCY_SECTIONS.includes(action.section)) {
        throw new Error(
          `Refusing unsupported dependency section: ${action.section}`,
        );
      }
      if (next[action.section]?.[action.packageName] !== action.from) {
        throw new Error(
          `Refusing to overwrite changed dependency: ${action.packageName}`,
        );
      }
      next[action.section][action.packageName] = action.to;
      continue;
    }
    if (action.type === 'go-module') continue;
    if (action.type === 'pnpm-override') {
      const current = next.pnpm?.overrides?.[action.selector];
      if (current !== action.from) {
        throw new Error(
          `Refusing to overwrite changed override: ${action.selector}`,
        );
      }
      next.pnpm.overrides[action.selector] = action.to;
      continue;
    }
    throw new Error(`Refusing unsupported remediation action: ${action.type}`);
  }
  return next;
}

function parseCliArguments(args) {
  const options = {
    packageJson: 'package.json',
    lockfile: 'pnpm-lock.yaml',
    goMod: 'server/go.mod',
    apply: false,
  };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--audit') options.audit = args[++index];
    else if (arg === '--package-json') options.packageJson = args[++index];
    else if (arg === '--lockfile') {
      options.lockfile = args[++index];
      options.lockfileRequired = true;
    } else if (arg === '--go-mod') {
      options.goMod = args[++index];
      options.goModRequired = true;
    } else if (arg === '--report') options.report = args[++index];
    else if (arg === '--help') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

export async function runCli(args = process.argv.slice(2)) {
  const options = parseCliArguments(args);
  if (options.help) {
    console.log(
      'Usage: node apply-weekly-dependency-remediation.mjs --audit audit.json [--package-json package.json] [--lockfile pnpm-lock.yaml] [--go-mod server/go.mod] [--report remediation.json] [--apply]',
    );
    return { exitCode: 0 };
  }
  if (!options.audit) throw new Error('--audit is required');

  const [auditText, packageJsonText] = await Promise.all([
    readFile(options.audit, 'utf8'),
    readFile(options.packageJson, 'utf8'),
  ]);
  const lockfileText = await readFile(options.lockfile, 'utf8').catch(
    (error) => {
      if (options.lockfileRequired) throw error;
      return undefined;
    },
  );
  const goModText = await readFile(options.goMod, 'utf8').catch((error) => {
    if (options.goModRequired) throw error;
    return undefined;
  });
  const plan = planRemediation({
    audit: JSON.parse(auditText),
    packageJson: JSON.parse(packageJsonText),
    lockfile: lockfileText,
    goMod: goModText,
  });
  const applied = options.apply && plan.actions.length > 0;
  const report = {
    ...plan,
    manifestPath: path.resolve(options.packageJson),
    applied,
    ...(applied ? { resolver: 'deterministic-planner' } : {}),
  };

  if (options.apply && plan.actions.length > 0) {
    const next = applyRemediation(JSON.parse(packageJsonText), plan);
    await writeFile(options.packageJson, `${JSON.stringify(next, null, 2)}\n`);
  }
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (options.report) await writeFile(options.report, serialized);
  else process.stdout.write(serialized);
  return { exitCode: 0, report };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
