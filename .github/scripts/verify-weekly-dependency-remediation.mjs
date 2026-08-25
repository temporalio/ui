#!/usr/bin/env node

/**
 * Confirms that a remediated alert no longer matches its advisory.
 *
 * The workflow runs this after it installs the candidate dependency graph, so
 * the lockfile holds the versions the change actually resolves.
 */
import { readFile, writeFile } from 'node:fs/promises';

import {
  isVersionVulnerable,
  normalizeAlerts,
  parseGoRequirements,
  parseLockfileVersions,
} from './apply-weekly-dependency-remediation.mjs';

function goResolvedVersions(requirements, moduleName) {
  const requirement = requirements.get(moduleName);
  if (!requirement?.version?.startsWith('v')) return [];
  const bare = requirement.version.slice(1);
  if (bare.includes('-')) return [];
  return [bare];
}

export function verifyRemediation({ audit, report, lockfileText, goModText }) {
  const resolved = parseLockfileVersions(lockfileText);
  const goRequirements = parseGoRequirements(goModText);
  const remediatedIds = new Set(
    (report?.actions ?? []).flatMap((action) => action.alertIds ?? []),
  );
  const failures = [];
  const evidence = [];

  for (const item of normalizeAlerts(audit)) {
    if (!remediatedIds.has(item.id)) continue;

    const resolvedVersions =
      item.ecosystem === 'go'
        ? goResolvedVersions(goRequirements, item.packageName)
        : (resolved.get(item.packageName) ?? []);
    evidence.push({
      alertId: item.id,
      packageName: item.packageName,
      resolvedVersions,
    });

    if (resolvedVersions.length === 0) {
      failures.push({
        alertId: item.id,
        packageName: item.packageName,
        resolvedVersions,
        reason:
          item.ecosystem === 'go'
            ? `server/go.mod does not require ${item.packageName} at a comparable version, so the remediation cannot be confirmed.`
            : `The lockfile does not contain ${item.packageName}, so the remediation cannot be confirmed.`,
      });
      continue;
    }

    const stillVulnerable = resolvedVersions.filter((version) =>
      isVersionVulnerable(version, item.vulnerableRange),
    );
    if (stillVulnerable.length > 0) {
      failures.push({
        alertId: item.id,
        packageName: item.packageName,
        resolvedVersions: stillVulnerable,
        reason: `${item.ecosystem === 'go' ? 'server/go.mod requires' : 'The lockfile resolves'} ${item.packageName} at ${stillVulnerable.join(', ')}, which the advisory range ${item.vulnerableRange} still covers.`,
      });
    }
  }

  const verified = failures.length === 0;
  return {
    verified,
    failures,
    evidence,
    report: {
      ...report,
      verification: { verified, alerts: evidence, failures },
    },
  };
}

function parseArguments(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--audit') options.audit = args[++index];
    else if (argument === '--report') options.report = args[++index];
    else if (argument === '--lockfile') options.lockfile = args[++index];
    else if (argument === '--go-mod') options.goMod = args[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }
  for (const required of ['audit', 'report', 'lockfile']) {
    if (!options[required]) throw new Error(`--${required} is required`);
  }
  return options;
}

export async function runCli(args = process.argv.slice(2)) {
  const options = parseArguments(args);
  const [auditText, reportText, lockfileText] = await Promise.all([
    readFile(options.audit, 'utf8'),
    readFile(options.report, 'utf8'),
    readFile(options.lockfile, 'utf8'),
  ]);
  const goModText = options.goMod
    ? await readFile(options.goMod, 'utf8')
    : undefined;

  const result = verifyRemediation({
    audit: JSON.parse(auditText),
    report: JSON.parse(reportText),
    lockfileText,
    goModText,
  });

  await writeFile(
    options.report,
    `${JSON.stringify(result.report, null, 2)}\n`,
  );

  for (const failure of result.failures) {
    console.error(failure.reason);
  }
  return { exitCode: result.verified ? 0 : 1, report: result.report };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli()
    .then(({ exitCode }) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
