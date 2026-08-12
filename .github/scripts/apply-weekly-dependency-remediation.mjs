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

const ROOT_MANIFEST = '/package.json';
const DIRECT_DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies'];
const VERSION =
  /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const VERSION_IN_RANGE =
  /(?<operator>\^|~|>=|>|=)?\s*(?<version>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?/;

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

function rangeLowerBound(range) {
  if (typeof range !== 'string') return null;
  const match = VERSION_IN_RANGE.exec(range.trim());
  if (!match?.groups) return null;
  return {
    operator: match.groups.operator ?? '',
    version: `${match.groups.version}.${match.groups.minor}.${match.groups.patch}`,
  };
}

function isSimpleRange(range) {
  if (typeof range !== 'string') return false;
  return /^(?:\^|~|>=|>|=)?\s*\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
    range.trim(),
  );
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
    };
  });
}

function classification({ packageName, alertIds, status, reason, action }) {
  return {
    packageName: packageName ?? null,
    alertIds,
    status,
    reason,
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

function overrideTargetsPackage(selector, packageName) {
  const target = selector.split('>').at(-1)?.trim();
  return target === packageName || target?.startsWith(`${packageName}@`);
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
  const bound = rangeLowerBound(override.version);
  if (!bound || !isSimpleRange(override.version)) {
    return classification({
      packageName,
      alertIds,
      status: 'manual',
      reason: `Existing pnpm override ${override.selector} uses an unsupported range: ${String(override.version)}.`,
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
  if (!isRangeCompatible(bound, patched)) {
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
      to: `${bound.operator}${patched}`,
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

function classifyPackage(alerts, packageJson) {
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

/**
 * Return a deterministic, manifest-only remediation plan.
 * Unsupported alerts are intentionally not mixed with npm remediation groups.
 */
export function planRemediation({ audit, packageJson }) {
  const normalized = normalizeAlerts(audit);
  const unsupported = [];
  const npmByPackage = new Map();

  for (const alert of normalized) {
    if (alert.ecosystem !== 'npm') {
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
    if (alert.manifestPath !== ROOT_MANIFEST) {
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
    const group = npmByPackage.get(alert.packageName) ?? [];
    group.push(alert);
    npmByPackage.set(alert.packageName, group);
  }

  const classifications = [
    ...[...npmByPackage.keys()]
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((packageName) =>
        classifyPackage(npmByPackage.get(packageName), packageJson),
      ),
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
  const options = { packageJson: 'package.json', apply: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--audit') options.audit = args[++index];
    else if (arg === '--package-json') options.packageJson = args[++index];
    else if (arg === '--report') options.report = args[++index];
    else if (arg === '--help') options.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

export async function runCli(args = process.argv.slice(2)) {
  const options = parseCliArguments(args);
  if (options.help) {
    console.log(
      'Usage: node apply-weekly-dependency-remediation.mjs --audit audit.json [--package-json package.json] [--report remediation.json] [--apply]',
    );
    return { exitCode: 0 };
  }
  if (!options.audit) throw new Error('--audit is required');

  const [auditText, packageJsonText] = await Promise.all([
    readFile(options.audit, 'utf8'),
    readFile(options.packageJson, 'utf8'),
  ]);
  const plan = planRemediation({
    audit: JSON.parse(auditText),
    packageJson: JSON.parse(packageJsonText),
  });
  const report = {
    ...plan,
    manifestPath: path.resolve(options.packageJson),
    applied: options.apply && plan.actions.length > 0,
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
