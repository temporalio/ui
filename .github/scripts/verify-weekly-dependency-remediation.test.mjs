import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  runCli,
  verifyRemediation,
} from './verify-weekly-dependency-remediation.mjs';

const alert = ({ number, name, vulnerable, patched }) => ({
  number,
  dependency: {
    manifest_path: 'pnpm-lock.yaml',
    package: { ecosystem: 'npm', name },
  },
  security_vulnerability: {
    package: { ecosystem: 'npm', name },
    first_patched_version: { identifier: patched },
    vulnerable_version_range: vulnerable,
  },
});

const lockfile = (entries) =>
  `lockfileVersion: '9.0'

packages:

${entries
  .map(
    (entry) => `  ${entry}:
    resolution: {integrity: sha512-aaa}
`,
  )
  .join('\n')}`;

const report = ({ actions, classifications = [] }) => ({
  schemaVersion: 1,
  actions,
  classifications,
  applied: true,
  resolver: 'deterministic-planner',
});

test('confirms a remediated alert when every resolved copy escapes its range', () => {
  const result = verifyRemediation({
    audit: [
      alert({
        number: 338,
        name: 'protobufjs',
        vulnerable: '>= 7.5.0, <= 7.6.4',
        patched: '7.6.5',
      }),
    ],
    report: report({
      actions: [
        {
          packageName: 'protobufjs',
          alertIds: [338],
          type: 'pnpm-override',
          selector: 'protobufjs',
          from: '^7.5.5',
          to: '^7.6.5',
        },
      ],
    }),
    lockfileText: lockfile(['protobufjs@7.6.5']),
  });

  assert.equal(result.verified, true);
  assert.deepEqual(result.failures, []);
});

test('records the resolved version after the install in the report', () => {
  const result = verifyRemediation({
    audit: [
      alert({
        number: 338,
        name: 'protobufjs',
        vulnerable: '>= 7.5.0, <= 7.6.4',
        patched: '7.6.5',
      }),
    ],
    report: report({
      actions: [
        {
          packageName: 'protobufjs',
          alertIds: [338],
          type: 'pnpm-override',
          selector: 'protobufjs',
          from: '^7.5.5',
          to: '^7.6.5',
        },
      ],
    }),
    lockfileText: lockfile(['protobufjs@7.6.5']),
  });

  assert.equal(result.report.verification.verified, true);
  assert.deepEqual(result.report.verification.alerts, [
    { alertId: 338, packageName: 'protobufjs', resolvedVersions: ['7.6.5'] },
  ]);
  assert.deepEqual(result.report.verification.failures, []);
  assert.equal(result.report.applied, true);
});

test('rejects a remediated alert when a resolved copy stays inside its range', () => {
  const result = verifyRemediation({
    audit: [
      alert({
        number: 338,
        name: 'protobufjs',
        vulnerable: '>= 7.5.0, <= 7.6.4',
        patched: '7.6.5',
      }),
    ],
    report: report({
      actions: [
        {
          packageName: 'protobufjs',
          alertIds: [338],
          type: 'pnpm-override',
          selector: 'protobufjs',
          from: '^7.5.5',
          to: '^7.6.5',
        },
      ],
    }),
    lockfileText: lockfile(['protobufjs@7.6.5', 'protobufjs@7.5.8']),
  });

  assert.equal(result.verified, false);
  assert.equal(result.failures.length, 1);
  assert.deepEqual(result.failures[0].resolvedVersions, ['7.5.8']);
  assert.match(result.failures[0].reason, /still covers/);
});

test('rejects a remediated package the lockfile no longer contains', () => {
  const result = verifyRemediation({
    audit: [
      alert({
        number: 338,
        name: 'protobufjs',
        vulnerable: '>= 7.5.0, <= 7.6.4',
        patched: '7.6.5',
      }),
    ],
    report: report({
      actions: [
        {
          packageName: 'protobufjs',
          alertIds: [338],
          type: 'pnpm-override',
          selector: 'protobufjs',
          from: '^7.5.5',
          to: '^7.6.5',
        },
      ],
    }),
    lockfileText: lockfile(['unrelated@1.0.0']),
  });

  assert.equal(result.verified, false);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0].reason, /does not contain/);
});

test('ignores an alert the plan did not remediate', () => {
  const result = verifyRemediation({
    audit: [
      alert({
        number: 295,
        name: '@grpc/grpc-js',
        vulnerable: '>= 1.14.0, < 1.14.4',
        patched: '1.14.4',
      }),
    ],
    report: report({
      actions: [],
      classifications: [
        {
          packageName: '@grpc/grpc-js',
          alertIds: [295],
          status: 'manual',
          reason: 'Transitive package has no existing pnpm override.',
        },
      ],
    }),
    lockfileText: lockfile(['@grpc/grpc-js@1.14.3']),
  });

  assert.equal(result.verified, true);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.report.verification.alerts, []);
});

async function fixtureFiles({ resolvedVersion }) {
  const directory = await mkdtemp(path.join(tmpdir(), 'weekly-verify-'));
  const auditPath = path.join(directory, 'audit.json');
  const reportPath = path.join(directory, 'remediation.json');
  const lockfilePath = path.join(directory, 'pnpm-lock.yaml');

  await writeFile(
    auditPath,
    JSON.stringify([
      alert({
        number: 338,
        name: 'protobufjs',
        vulnerable: '>= 7.5.0, <= 7.6.4',
        patched: '7.6.5',
      }),
    ]),
  );
  await writeFile(
    reportPath,
    JSON.stringify(
      report({
        actions: [
          {
            packageName: 'protobufjs',
            alertIds: [338],
            type: 'pnpm-override',
            selector: 'protobufjs',
            from: '^7.5.5',
            to: '^7.6.5',
          },
        ],
      }),
    ),
  );
  await writeFile(lockfilePath, lockfile([`protobufjs@${resolvedVersion}`]));
  return { auditPath, reportPath, lockfilePath };
}

test('writes the verified report and succeeds from the command line', async () => {
  const { auditPath, reportPath, lockfilePath } = await fixtureFiles({
    resolvedVersion: '7.6.5',
  });

  const result = await runCli([
    '--audit',
    auditPath,
    '--report',
    reportPath,
    '--lockfile',
    lockfilePath,
  ]);

  assert.equal(result.exitCode, 0);
  const written = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(written.verification.verified, true);
  assert.deepEqual(written.verification.alerts[0].resolvedVersions, ['7.6.5']);
});

test('fails the run from the command line when a copy stays vulnerable', async () => {
  const { auditPath, reportPath, lockfilePath } = await fixtureFiles({
    resolvedVersion: '7.5.8',
  });

  const result = await runCli([
    '--audit',
    auditPath,
    '--report',
    reportPath,
    '--lockfile',
    lockfilePath,
  ]);

  assert.equal(result.exitCode, 1);
  const written = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.equal(written.verification.verified, false);
  assert.equal(written.verification.failures.length, 1);
});

test('requires the lockfile', async () => {
  const { auditPath, reportPath } = await fixtureFiles({
    resolvedVersion: '7.6.5',
  });

  await assert.rejects(
    () => runCli(['--audit', auditPath, '--report', reportPath]),
    /--lockfile is required/,
  );
  await assert.rejects(
    () =>
      runCli([
        '--audit',
        auditPath,
        '--report',
        reportPath,
        '--lockfile',
        path.join(path.dirname(auditPath), 'absent-lock.yaml'),
      ]),
    /ENOENT/,
  );
});

const goAlert = ({ number, name, vulnerable, patched }) => ({
  number,
  dependency: {
    manifest_path: 'server/go.mod',
    package: { ecosystem: 'go', name },
  },
  security_vulnerability: {
    package: { ecosystem: 'go', name },
    first_patched_version: { identifier: patched },
    vulnerable_version_range: vulnerable,
  },
});

const goModText = (requirements) =>
  `module github.com/temporalio/ui-server/v2

go 1.26.5

require (
${requirements.map((line) => `\t${line}`).join('\n')}
)
`;

const goReport = () =>
  report({
    actions: [
      {
        packageName: 'golang.org/x/crypto',
        alertIds: [335],
        type: 'go-module',
        from: 'v0.51.0',
        to: 'v0.52.0',
      },
    ],
  });

test('confirms a remediated Go alert when go.mod escapes its range', () => {
  const result = verifyRemediation({
    audit: [
      goAlert({
        number: 335,
        name: 'golang.org/x/crypto',
        vulnerable: '< 0.52.0',
        patched: '0.52.0',
      }),
    ],
    report: goReport(),
    lockfileText: lockfile(['unrelated@1.0.0']),
    goModText: goModText(['golang.org/x/crypto v0.52.0']),
  });

  assert.equal(result.verified, true);
  assert.deepEqual(result.report.verification.alerts, [
    {
      alertId: 335,
      packageName: 'golang.org/x/crypto',
      resolvedVersions: ['0.52.0'],
    },
  ]);
});

test('rejects a remediated Go alert when go.mod stays vulnerable', () => {
  const result = verifyRemediation({
    audit: [
      goAlert({
        number: 335,
        name: 'golang.org/x/crypto',
        vulnerable: '< 0.52.0',
        patched: '0.52.0',
      }),
    ],
    report: goReport(),
    lockfileText: lockfile(['unrelated@1.0.0']),
    goModText: goModText(['golang.org/x/crypto v0.51.0']),
  });

  assert.equal(result.verified, false);
  assert.match(result.failures[0].reason, /server\/go\.mod requires/);
});

test('accepts a Go version above the authorized one', () => {
  const result = verifyRemediation({
    audit: [
      goAlert({
        number: 335,
        name: 'golang.org/x/crypto',
        vulnerable: '< 0.52.0',
        patched: '0.52.0',
      }),
    ],
    report: goReport(),
    lockfileText: lockfile(['unrelated@1.0.0']),
    goModText: goModText(['golang.org/x/crypto v0.53.0']),
  });

  assert.equal(result.verified, true);
});

test('rejects a remediated Go module that go.mod pins to a pseudo-version', () => {
  const result = verifyRemediation({
    audit: [
      goAlert({
        number: 335,
        name: 'golang.org/x/crypto',
        vulnerable: '< 0.52.0',
        patched: '0.52.0',
      }),
    ],
    report: goReport(),
    lockfileText: lockfile(['unrelated@1.0.0']),
    goModText: goModText([
      'golang.org/x/crypto v0.0.0-20260411013819-759bbc3e3207',
    ]),
  });

  assert.equal(result.verified, false);
  assert.match(result.failures[0].reason, /comparable version/);
});

test('reads go.mod from the command line', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'weekly-verify-go-'));
  const auditPath = path.join(directory, 'audit.json');
  const reportPath = path.join(directory, 'remediation.json');
  const lockfilePath = path.join(directory, 'pnpm-lock.yaml');
  const goModPath = path.join(directory, 'go.mod');

  await writeFile(
    auditPath,
    JSON.stringify([
      goAlert({
        number: 335,
        name: 'golang.org/x/crypto',
        vulnerable: '< 0.52.0',
        patched: '0.52.0',
      }),
    ]),
  );
  await writeFile(reportPath, JSON.stringify(goReport()));
  await writeFile(lockfilePath, lockfile(['unrelated@1.0.0']));
  await writeFile(goModPath, goModText(['golang.org/x/crypto v0.52.0']));

  const result = await runCli([
    '--audit',
    auditPath,
    '--report',
    reportPath,
    '--lockfile',
    lockfilePath,
    '--go-mod',
    goModPath,
  ]);

  assert.equal(result.exitCode, 0);
  const written = JSON.parse(await readFile(reportPath, 'utf8'));
  assert.deepEqual(written.verification.alerts[0].resolvedVersions, ['0.52.0']);
});
