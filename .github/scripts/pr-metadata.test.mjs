import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { checkPrMetadata } from './pr-metadata.mjs';

const workflow = readFileSync(
  new URL('../workflows/check-pr-metadata.yml', import.meta.url),
  'utf8',
);

const marker = '<!-- temporal-ui-pr-metadata -->';
const botComment = {
  id: 123,
  user: { login: 'github-actions[bot]', type: 'Bot' },
  body: `${marker}\nOld results`,
};

async function run({
  body = 'A meaningful PR description.',
  files = [],
  changedFiles = files.length,
  comments = [],
  failRequest = false,
} = {}) {
  const calls = [];
  const failures = [];
  const warnings = [];
  const summary = [];
  const endpoint = (method, result) => async (params) => {
    calls.push({ method, params });
    if (failRequest) throw new Error('GitHub API unavailable');
    return result;
  };
  const github = {
    rest: {
      pulls: {
        get: endpoint('get', { data: { body, changed_files: changedFiles } }),
        listFiles: endpoint('listFiles', files),
      },
      issues: {
        listComments: endpoint('listComments', comments),
        createComment: endpoint('createComment', {}),
        updateComment: endpoint('updateComment', {}),
        deleteComment: endpoint('deleteComment', {}),
      },
    },
    paginate: (request, params) => request(params),
  };
  const core = {
    setFailed: (message) => failures.push(message),
    warning: (message) => warnings.push(message),
    summary: {
      addHeading() {
        return this;
      },
      addRaw(message) {
        summary.push(message);
        return this;
      },
      async write() {},
    },
  };
  const context = {
    repo: { owner: 'temporalio', repo: 'ui' },
    payload: {
      pull_request: {
        number: 4045,
        body: 'Stale event description',
        head: { repo: { full_name: 'external-contributor/ui' } },
      },
    },
  };

  await checkPrMetadata({
    github,
    context,
    core,
  });
  return { calls, failures, warnings, summary };
}

test('runs only the trusted base script with pinned actions and no install, secrets, or shell execution', () => {
  assert.match(workflow, /\n {2}pull_request_target:\n/);
  assert.match(workflow, /types: \[.*edited.*\]/);
  assert.match(workflow, /pull-requests: write/);
  const actions = [...workflow.matchAll(/uses: (.+)/g)];
  assert.equal(actions.length, 2);
  assert.match(actions[0][1], /^actions\/checkout@[a-f0-9]{40}\b/);
  assert.match(actions[1][1], /^actions\/github-script@[a-f0-9]{40}\b/);
  assert.match(workflow, /repository: \$\{\{ github\.repository \}\}/);
  assert.match(
    workflow,
    /ref: \$\{\{ github\.event\.pull_request\.base\.sha \}\}/,
  );
  assert.match(workflow, /persist-credentials: false/);
  assert.match(
    workflow,
    /sparse-checkout: \.github\/scripts\/pr-metadata\.mjs/,
  );
  assert.match(workflow, /sparse-checkout-cone-mode: false/);
  assert.doesNotMatch(
    workflow,
    /\b(?:run|secrets|eval|exec|spawn)\b|pull_request\.head|refs\/pull/,
  );
  assert.match(
    workflow,
    /await checkPrMetadata\(\{ github, context, core \}\)/,
  );
  assert.match(workflow, /group: .*github\.event\.pull_request\.number/);
});

test('accepts a fork PR without secrets and reads current metadata through the API', async () => {
  const { calls, failures, warnings, summary } = await run();
  assert.deepEqual(failures, []);
  assert.deepEqual(warnings, []);
  assert.deepEqual(summary, ['All PR metadata checks passed.']);
  assert.deepEqual(
    calls.map(({ method }) => method),
    ['get', 'listFiles', 'listComments'],
  );
  assert.equal(calls[0].params.pull_number, 4045);
  assert.equal(calls[0].params.owner, 'temporalio');
  assert.equal(calls[0].params.repo, 'ui');
  assert.equal(calls[1].params.per_page, 100);
  assert.equal(calls[2].params.per_page, 100);
});

for (const body of [null, '', 'short', '          ']) {
  test(`fails an insufficient description: ${JSON.stringify(body)}`, async () => {
    const { calls, failures } = await run({ body });
    assert.deepEqual(failures, [
      'Please add a meaningful description to the PR.',
    ]);
    const comment = calls.find(({ method }) => method === 'createComment');
    assert.ok(comment.params.body.startsWith(marker));
    assert.ok(comment.params.body.includes(failures[0]));
  });
}

test('warns about large PRs using the API total rather than one page of files', async () => {
  const { warnings, failures } = await run({ changedFiles: 601 });
  assert.ok(warnings.some((message) => message.includes('601 changed files')));
  assert.deepEqual(failures, []);
});

test('does not warn about PR size at the existing 600-file threshold', async () => {
  const { warnings } = await run({ changedFiles: 600 });
  assert.ok(warnings.every((message) => !message.includes('changed files')));
});

test('reminds maintainers to release when the Temporal API dependency changes', async () => {
  const { warnings } = await run({
    files: [
      {
        filename: 'server/go.mod',
        status: 'modified',
        patch:
          '@@ -1 +1 @@\n-go.temporal.io/api v1.0.0\n+go.temporal.io/api v1.1.0',
      },
    ],
  });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Remember to cut a new release/);
});

for (const file of [
  {
    filename: 'server/go.mod',
    status: 'modified',
    patch: ' go.temporal.io/api v1.0.0\n+example.com/other v1.0.0',
  },
  {
    filename: 'server/go.mod',
    status: 'removed',
    patch: '-go.temporal.io/api v1.0.0',
  },
  {
    filename: 'other/go.mod',
    status: 'modified',
    patch: '+go.temporal.io/api v1.0.0',
  },
]) {
  test(`ignores unrelated or removed dependency changes: ${file.filename} ${file.status}`, async () => {
    const { warnings } = await run({ files: [file] });
    assert.deepEqual(warnings, []);
  });
}

test('warns rather than silently omitting a release reminder when a patch is unavailable', async () => {
  const { warnings } = await run({
    files: [{ filename: 'server/go.mod', status: 'modified' }],
  });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Could not inspect/);
});

test('warns when GitHub truncates the changed-file list', async () => {
  const { warnings } = await run({ changedFiles: 3001 });
  assert.ok(
    warnings.some((message) =>
      message.includes('did not return every changed file'),
    ),
  );
});

test('updates the existing bot comment instead of posting duplicates', async () => {
  const { calls } = await run({ body: '', comments: [botComment] });
  assert.equal(
    calls.filter(({ method }) => method === 'createComment').length,
    0,
  );
  const update = calls.find(({ method }) => method === 'updateComment');
  assert.equal(update.params.comment_id, botComment.id);
  assert.match(update.params.body, /meaningful description/);
});

test('does not update a contributor comment spoofing the bot marker', async () => {
  const { calls } = await run({
    body: '',
    comments: [{ ...botComment, user: { login: 'contributor', type: 'User' } }],
  });
  assert.equal(
    calls.filter(({ method }) => method === 'updateComment').length,
    0,
  );
  assert.equal(
    calls.filter(({ method }) => method === 'createComment').length,
    1,
  );
});

test('removes the stale bot comment after all findings are resolved', async () => {
  const { calls, failures } = await run({ comments: [botComment] });
  const deletion = calls.find(({ method }) => method === 'deleteComment');
  assert.equal(deletion.params.comment_id, botComment.id);
  assert.deepEqual(failures, []);
});

test('treats contributor-provided metadata and patches as data, not executable code', async () => {
  const payload =
    '${{ secrets.TEMPORAL_CICD_PRIVATE_KEY }}; process.exit(1); @everyone';
  const { failures, calls } = await run({
    body: payload,
    files: [
      { filename: 'server/go.mod', status: 'modified', patch: `+${payload}` },
    ],
  });
  assert.deepEqual(failures, []);
  assert.ok(
    calls.every(({ params }) => !JSON.stringify(params).includes(payload)),
  );
});

test('fails closed if the GitHub API request fails', async () => {
  await assert.rejects(run({ failRequest: true }), /GitHub API unavailable/);
});
