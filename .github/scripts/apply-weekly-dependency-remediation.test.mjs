import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyRemediation,
  planRemediation,
} from './apply-weekly-dependency-remediation.mjs';

function alert({
  number = 1,
  name = 'example',
  patched = '1.2.3',
  ecosystem = 'npm',
  manifestPath = '/package.json',
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
            manifestPath: '/package.json',
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
        manifestPath: '/packages/nested/package.json',
      }),
      alert({ number: 6, name: 'go-module', ecosystem: 'go' }),
    ],
    packageJson: manifest(),
  });

  assert.equal(plan.actions.length, 0);
  assert.equal(plan.summary.manual, 1);
  assert.equal(plan.summary.unsupported, 2);
});
