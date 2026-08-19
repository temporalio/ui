import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  applyRemediation,
  isVersionVulnerable,
  parseLockfileVersions,
  planRemediation,
  runCli,
} from './apply-weekly-dependency-remediation.mjs';

function alert({
  number = 1,
  name = 'example',
  patched = '1.2.3',
  ecosystem = 'npm',
  manifestPath = 'package.json',
  vulnerable = null,
} = {}) {
  return {
    number,
    dependency: {
      manifest_path: manifestPath,
      package: { ecosystem, name },
    },
    security_vulnerability: {
      package: { ecosystem, name },
      first_patched_version: patched ? { identifier: patched } : null,
      ...(vulnerable ? { vulnerable_version_range: vulnerable } : {}),
    },
  };
}

function manifest({ dependencies, devDependencies, overrides } = {}) {
  return {
    name: 'fixture',
    ...(dependencies ? { dependencies } : {}),
    ...(devDependencies ? { devDependencies } : {}),
    ...(overrides ? { pnpm: { overrides } } : {}),
  };
}

test('plans and applies the smallest direct dependency bump', () => {
  const packageJson = manifest({ dependencies: { lodash: '^4.17.20' } });
  const plan = planRemediation({
    audit: [alert({ name: 'lodash', patched: '4.17.21' })],
    packageJson,
  });

  assert.deepEqual(plan.actions, [
    {
      packageName: 'lodash',
      alertIds: [1],
      type: 'direct-dependency',
      section: 'dependencies',
      from: '^4.17.20',
      to: '^4.17.21',
    },
  ]);
  assert.equal(
    applyRemediation(packageJson, plan).dependencies.lodash,
    '^4.17.21',
  );
});

test('plans and applies an audit-normalized direct dependency alert', () => {
  const packageJson = manifest({ dependencies: { lodash: '^4.17.20' } });
  const plan = planRemediation({
    audit: {
      schemaVersion: 1,
      generatedAt: '2026-08-12T12:00:00.000Z',
      repository: 'temporalio/ui',
      run: { url: 'https://github.com/temporalio/ui/actions/runs/1' },
      dependabot: {
        openAlertCount: 1,
        alerts: [
          {
            number: 42,
            package: 'lodash',
            ecosystem: 'npm',
            manifestPath: 'package.json',
            firstPatchedVersion: '4.17.21',
          },
        ],
      },
      remediation: null,
      vln: { pending: [], needsTriage: [] },
      externalContributors: {
        reviewReady: [],
        triage: [],
        authorFollowup: [],
        staleCount: 0,
      },
    },
    packageJson,
  });

  assert.deepEqual(plan.actions, [
    {
      packageName: 'lodash',
      alertIds: [42],
      type: 'direct-dependency',
      section: 'dependencies',
      from: '^4.17.20',
      to: '^4.17.21',
    },
  ]);
  assert.equal(
    applyRemediation(packageJson, plan).dependencies.lodash,
    '^4.17.21',
  );
});

test('requires manual remediation for a transitive alert without an existing override', () => {
  const plan = planRemediation({
    audit: [alert({ name: 'cookie', patched: '0.7.0' })],
    packageJson: manifest(),
  });

  assert.deepEqual(plan.actions, []);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /refusing to create/);
});

test('updates a compatible existing scoped override for a transitive alert', () => {
  const packageJson = manifest({
    overrides: { 'legacy-client>cookie': '^0.6.0' },
  });
  const plan = planRemediation({
    audit: [alert({ name: 'cookie', patched: '0.6.1' })],
    packageJson,
  });

  assert.deepEqual(plan.actions, [
    {
      packageName: 'cookie',
      alertIds: [1],
      type: 'pnpm-override',
      selector: 'legacy-client>cookie',
      from: '^0.6.0',
      to: '^0.6.1',
    },
  ]);
  assert.equal(
    applyRemediation(packageJson, plan).pnpm.overrides['legacy-client>cookie'],
    '^0.6.1',
  );
});

test('rejects pre-1.0 remediation across minor versions', () => {
  const plan = planRemediation({
    audit: [alert({ name: 'cookie', patched: '0.7.0' })],
    packageJson: manifest({ dependencies: { cookie: '^0.6.0' } }),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /caret-compatible pre-1\.0/);
});

test('rejects 0.0.x remediation across patch versions', () => {
  const plan = planRemediation({
    audit: [alert({ name: 'tiny-package', patched: '0.0.4' })],
    packageJson: manifest({ dependencies: { 'tiny-package': '^0.0.3' } }),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /caret-compatible pre-1\.0/);
});

test('rejects a direct-only bump when an override could supersede it', () => {
  const plan = planRemediation({
    audit: [alert({ name: 'lodash', patched: '4.17.21' })],
    packageJson: manifest({
      dependencies: { lodash: '^4.17.20' },
      overrides: { lodash: '4.17.19' },
    }),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /could be superseded/);
});

test('updates a vulnerable override before calling a direct dependency safe', () => {
  const packageJson = manifest({
    dependencies: { foo: '^1.3.0' },
    overrides: { foo: '1.2.0' },
  });
  const plan = planRemediation({
    audit: [alert({ name: 'foo', patched: '1.3.0' })],
    packageJson,
  });

  assert.deepEqual(plan.actions, [
    {
      packageName: 'foo',
      alertIds: [1],
      type: 'pnpm-override',
      selector: 'foo',
      from: '1.2.0',
      to: '1.3.0',
    },
  ]);
  assert.equal(applyRemediation(packageJson, plan).pnpm.overrides.foo, '1.3.0');
});

test('allows a tilde dependency bump within the same minor version', () => {
  const plan = planRemediation({
    audit: [alert({ name: 'example', patched: '1.2.3' })],
    packageJson: manifest({ dependencies: { example: '~1.2.0' } }),
  });

  assert.equal(plan.actions.length, 1);
  assert.equal(plan.actions[0].to, '~1.2.3');
});

test('rejects a tilde dependency bump across minor versions', () => {
  const plan = planRemediation({
    audit: [alert({ name: 'example', patched: '1.3.0' })],
    packageJson: manifest({ dependencies: { example: '~1.2.0' } }),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /tilde-compatible minor/);
});

test('uses the highest patched floor for multiple alerts affecting one package', () => {
  const plan = planRemediation({
    audit: [
      alert({ number: 2, name: 'ws', patched: '8.17.0' }),
      alert({ number: 3, name: 'ws', patched: '8.18.0' }),
    ],
    packageJson: manifest({ dependencies: { ws: '^8.16.0' } }),
  });

  assert.equal(plan.actions.length, 1);
  assert.deepEqual(plan.actions[0].alertIds, [2, 3]);
  assert.equal(plan.actions[0].to, '^8.18.0');
});

test('marks an already-safe direct dependency without editing it', () => {
  const plan = planRemediation({
    audit: [alert({ name: 'axios', patched: '1.7.0' })],
    packageJson: manifest({ dependencies: { axios: '^1.8.0' } }),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.classifications[0].status, 'safe');
  assert.match(plan.classifications[0].reason, /already meets/);
});

test('rejects a direct dependency remediation that needs a major upgrade', () => {
  const plan = planRemediation({
    audit: [alert({ name: 'vite', patched: '6.0.0' })],
    packageJson: manifest({ devDependencies: { vite: '^5.4.0' } }),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /major upgrade/);
});

test('rejects alert groups whose patched floors cross major versions', () => {
  const plan = planRemediation({
    audit: [
      alert({ number: 7, name: 'rollup', patched: '4.0.0' }),
      alert({ number: 8, name: 'rollup', patched: '5.0.0' }),
    ],
    packageJson: manifest(),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /cascade is ambiguous/);
});

test('marks missing patched versions and unsupported manifests as non-automatable', () => {
  const plan = planRemediation({
    audit: [
      alert({ number: 4, name: 'no-patch', patched: null }),
      alert({
        number: 5,
        name: 'nested',
        manifestPath: 'packages/nested/package.json',
      }),
      alert({ number: 6, name: 'go-module', ecosystem: 'go' }),
      alert({
        number: 9,
        name: 'npm-shrinkwrapped',
        manifestPath: 'package-lock.json',
      }),
    ],
    packageJson: manifest(),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.summary.manual, 1);
  assert.equal(plan.summary.unsupported, 3);

  const unsupported = plan.classifications.filter(
    (item) => item.status === 'unsupported',
  );
  assert.deepEqual(unsupported.map((item) => item.reason).sort(), [
    'Unsupported ecosystem: go.',
    'Unsupported manifest: package-lock.json.',
    'Unsupported manifest: packages/nested/package.json.',
  ]);
});

test('plans a direct dependency bump for an alert reported against package.json', () => {
  const packageJson = manifest({ dependencies: { lodash: '^4.17.20' } });
  const plan = planRemediation({
    audit: [
      alert({
        name: 'lodash',
        patched: '4.17.21',
        manifestPath: 'package.json',
      }),
    ],
    packageJson,
  });

  assert.equal(plan.summary.unsupported, 0);
  assert.deepEqual(plan.actions, [
    {
      packageName: 'lodash',
      alertIds: [1],
      type: 'direct-dependency',
      section: 'dependencies',
      from: '^4.17.20',
      to: '^4.17.21',
    },
  ]);
});

test('raises an existing override for a transitive alert reported against the lockfile', () => {
  const packageJson = manifest({ overrides: { protobufjs: '^7.5.5' } });
  const plan = planRemediation({
    audit: [
      alert({
        number: 338,
        name: 'protobufjs',
        patched: '7.6.5',
        manifestPath: 'pnpm-lock.yaml',
      }),
    ],
    packageJson,
  });

  assert.equal(plan.summary.unsupported, 0);
  assert.deepEqual(plan.actions, [
    {
      packageName: 'protobufjs',
      alertIds: [338],
      type: 'pnpm-override',
      selector: 'protobufjs',
      from: '^7.5.5',
      to: '^7.6.5',
    },
  ]);
});

test('raises the floor of a versioned override selector', () => {
  const packageJson = manifest({
    overrides: { 'minimatch@>=5 <6': '^5.1.9' },
  });
  const plan = planRemediation({
    audit: [
      alert({
        number: 21,
        name: 'minimatch',
        patched: '5.1.10',
        manifestPath: 'pnpm-lock.yaml',
      }),
    ],
    packageJson,
  });

  assert.deepEqual(plan.actions, [
    {
      packageName: 'minimatch',
      alertIds: [21],
      type: 'pnpm-override',
      selector: 'minimatch@>=5 <6',
      from: '^5.1.9',
      to: '^5.1.10',
    },
  ]);
  assert.equal(
    applyRemediation(packageJson, plan).pnpm.overrides['minimatch@>=5 <6'],
    '^5.1.10',
  );
});

test('raises a nested override selector that also carries a version range', () => {
  const packageJson = manifest({
    overrides: { 'legacy-client>cookie@>=0 <1': '^0.6.0' },
  });
  const plan = planRemediation({
    audit: [
      alert({
        number: 22,
        name: 'cookie',
        patched: '0.6.1',
        manifestPath: 'pnpm-lock.yaml',
      }),
    ],
    packageJson,
  });

  assert.deepEqual(plan.actions, [
    {
      packageName: 'cookie',
      alertIds: [22],
      type: 'pnpm-override',
      selector: 'legacy-client>cookie@>=0 <1',
      from: '^0.6.0',
      to: '^0.6.1',
    },
  ]);
});

test('raises a compound override range and keeps its upper bound', () => {
  const packageJson = manifest({
    overrides: { undici: '>=6.27.0 <7' },
  });
  const plan = planRemediation({
    audit: [
      alert({
        number: 31,
        name: 'undici',
        patched: '6.28.0',
        manifestPath: 'pnpm-lock.yaml',
      }),
    ],
    packageJson,
  });

  assert.deepEqual(plan.actions, [
    {
      packageName: 'undici',
      alertIds: [31],
      type: 'pnpm-override',
      selector: 'undici',
      from: '>=6.27.0 <7',
      to: '>=6.28.0 <7',
    },
  ]);
  assert.equal(
    applyRemediation(packageJson, plan).pnpm.overrides.undici,
    '>=6.28.0 <7',
  );
});

test('refuses a compound override raise that crosses the upper bound', () => {
  const plan = planRemediation({
    audit: [
      alert({
        number: 32,
        name: 'undici',
        patched: '7.1.0',
        manifestPath: 'pnpm-lock.yaml',
      }),
    ],
    packageJson: manifest({ overrides: { undici: '>=6.27.0 <7' } }),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /upper bound <7/);
});

test('reports a version below a one-sided vulnerable range as vulnerable', () => {
  assert.equal(isVersionVulnerable('1.9.15', '< 1.9.16'), true);
  assert.equal(isVersionVulnerable('1.9.16', '< 1.9.16'), false);
});

test('reports a version outside a two-sided vulnerable range as not vulnerable', () => {
  assert.equal(isVersionVulnerable('1.14.3', '>= 1.14.0, < 1.14.4'), true);
  assert.equal(isVersionVulnerable('1.14.4', '>= 1.14.0, < 1.14.4'), false);
  assert.equal(isVersionVulnerable('1.13.9', '>= 1.14.0, < 1.14.4'), false);
});

test('reports the live advisory ranges for the open alerts', () => {
  const protobufjs = ['>= 7.5.0, <= 7.6.4', '<= 7.6.0', '<= 7.6.2'];
  for (const range of protobufjs) {
    assert.equal(isVersionVulnerable('7.5.8', range), true);
    assert.equal(isVersionVulnerable('7.6.5', range), false);
  }

  assert.equal(isVersionVulnerable('1.14.3', '>= 1.14.0, < 1.14.4'), true);
  assert.equal(isVersionVulnerable('1.14.4', '>= 1.14.0, < 1.14.4'), false);
});

test('treats an unreadable vulnerable range as vulnerable', () => {
  assert.equal(isVersionVulnerable('1.0.0', 'not a range'), true);
  assert.equal(isVersionVulnerable('1.0.0', ''), true);
  assert.equal(isVersionVulnerable('1.0.0', null), true);
  assert.equal(isVersionVulnerable('not-a-version', '< 2.0.0'), true);
});

const LOCKFILE = `lockfileVersion: '9.0'

settings:
  autoInstallPeers: true

overrides:
  protobufjs: ^7.5.5

importers:

  .:
    dependencies:
      protobufjs:
        specifier: ^7.5.5
        version: 7.5.8

packages:

  '@grpc/grpc-js@1.14.3':
    resolution: {integrity: sha512-aaa}
    engines: {node: '>=12.10.0'}

  protobufjs@7.5.8:
    resolution: {integrity: sha512-bbb}

  protobufjs@6.11.4:
    resolution: {integrity: sha512-ccc}

  'is-even@1.0.0(peer@2.0.0)':
    resolution: {integrity: sha512-ddd}

snapshots:

  protobufjs@7.5.8:
    dependencies: {}
`;

test('reports every version the lockfile resolves for a package', () => {
  const versions = parseLockfileVersions(LOCKFILE);

  assert.deepEqual(versions.get('protobufjs'), ['6.11.4', '7.5.8']);
  assert.deepEqual(versions.get('@grpc/grpc-js'), ['1.14.3']);
  assert.deepEqual(versions.get('is-even'), ['1.0.0']);
  assert.equal(versions.get('absent'), undefined);
});

test('marks a package the lockfile already resolves above the advisory as already safe', () => {
  const plan = planRemediation({
    audit: [
      alert({
        number: 338,
        name: 'protobufjs',
        patched: '7.6.5',
        vulnerable: '>= 7.5.0, <= 7.6.4',
        manifestPath: 'pnpm-lock.yaml',
      }),
    ],
    packageJson: manifest({ overrides: { protobufjs: '^7.5.5' } }),
    lockfile: `lockfileVersion: '9.0'

packages:

  protobufjs@7.6.5:
    resolution: {integrity: sha512-aaa}
`,
  });

  assert.deepEqual(plan.actions, []);
  assert.equal(plan.classifications[0].status, 'alreadySafe');
  assert.deepEqual(plan.classifications[0].resolvedVersions, ['7.6.5']);
  assert.equal(plan.summary.alreadySafe, 1);
});

test('refuses a direct dependency bump when the lockfile holds an unreachable copy', () => {
  const plan = planRemediation({
    audit: [
      alert({
        number: 41,
        name: 'foo',
        patched: '1.0.5',
        vulnerable: '< 1.0.5',
        manifestPath: 'package.json',
      }),
    ],
    packageJson: manifest({ dependencies: { foo: '^1.0.0' } }),
    lockfile: `lockfileVersion: '9.0'

packages:

  foo@1.0.2:
    resolution: {integrity: sha512-aaa}

  foo@0.9.0:
    resolution: {integrity: sha512-bbb}
`,
  });

  assert.deepEqual(plan.actions, []);
  assert.equal(plan.classifications[0].status, 'manual');
  assert.match(plan.classifications[0].reason, /0\.9\.0, 1\.0\.2/);
});

test('reports the resolved versions on every npm classification', () => {
  const plan = planRemediation({
    audit: [
      alert({
        number: 338,
        name: 'protobufjs',
        patched: '7.6.5',
        vulnerable: '>= 7.5.0, <= 7.6.4',
        manifestPath: 'pnpm-lock.yaml',
      }),
      alert({
        number: 295,
        name: 'grpc',
        patched: '1.14.4',
        vulnerable: '>= 1.14.0, < 1.14.4',
        manifestPath: 'pnpm-lock.yaml',
      }),
    ],
    packageJson: manifest({ overrides: { protobufjs: '^7.5.5' } }),
    lockfile: `lockfileVersion: '9.0'

packages:

  protobufjs@7.5.8:
    resolution: {integrity: sha512-aaa}

  grpc@1.14.3:
    resolution: {integrity: sha512-bbb}
`,
  });

  const byPackage = Object.fromEntries(
    plan.classifications.map((item) => [item.packageName, item]),
  );

  assert.equal(byPackage.protobufjs.status, 'safe');
  assert.deepEqual(byPackage.protobufjs.resolvedVersions, ['7.5.8']);
  assert.equal(byPackage.grpc.status, 'manual');
  assert.deepEqual(byPackage.grpc.resolvedVersions, ['1.14.3']);
});

test('reports lockfile evidence from the command line', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'weekly-remediation-'));
  const auditPath = path.join(directory, 'audit.json');
  const packageJsonPath = path.join(directory, 'package.json');
  const lockfilePath = path.join(directory, 'pnpm-lock.yaml');

  await writeFile(
    auditPath,
    JSON.stringify([
      alert({
        number: 338,
        name: 'protobufjs',
        patched: '7.6.5',
        vulnerable: '>= 7.5.0, <= 7.6.4',
        manifestPath: 'pnpm-lock.yaml',
      }),
    ]),
  );
  await writeFile(
    packageJsonPath,
    JSON.stringify(manifest({ overrides: { protobufjs: '^7.5.5' } })),
  );
  await writeFile(
    lockfilePath,
    `lockfileVersion: '9.0'

packages:

  protobufjs@7.5.8:
    resolution: {integrity: sha512-aaa}
`,
  );

  const { report } = await runCli([
    '--audit',
    auditPath,
    '--package-json',
    packageJsonPath,
    '--lockfile',
    lockfilePath,
    '--report',
    path.join(directory, 'remediation.json'),
  ]);

  assert.deepEqual(report.classifications[0].resolvedVersions, ['7.5.8']);
});
