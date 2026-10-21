export async function checkPrMetadata({ github, context, core }) {
  const { owner, repo } = context.repo;
  const pull_number = context.payload.pull_request.number;
  const { data: pr } = await github.rest.pulls.get({
    owner,
    repo,
    pull_number,
  });
  const files = await github.paginate(github.rest.pulls.listFiles, {
    owner,
    repo,
    pull_number,
    per_page: 100,
  });
  const failures = [];
  const warnings = [];

  if (!pr.body || pr.body.trim().length < 10) {
    failures.push('Please add a meaningful description to the PR.');
  }

  if (pr.changed_files > 600) {
    warnings.push(
      `This PR has ${pr.changed_files} changed files. Consider breaking it into smaller PRs for easier review.`,
    );
  }

  const goMod = files.find(
    (file) => file.filename === 'server/go.mod' && file.status !== 'removed',
  );
  if (goMod) {
    if (typeof goMod.patch !== 'string') {
      warnings.push(
        'Could not inspect the server/go.mod patch. If go.temporal.io/api was bumped, remember to cut a new release after this merges.',
      );
    } else if (/^\+(?!\+\+).*\bgo\.temporal\.io\/api\s/m.test(goMod.patch)) {
      warnings.push(
        '📦 `go.temporal.io/api` was bumped in `server/go.mod`. Remember to cut a new release after this merges.',
      );
    }
  } else if (files.length < pr.changed_files) {
    warnings.push(
      'GitHub did not return every changed file. Check whether server/go.mod bumps go.temporal.io/api and requires a release.',
    );
  }

  const marker = '<!-- temporal-ui-pr-metadata -->';
  const comments = await github.paginate(github.rest.issues.listComments, {
    owner,
    repo,
    issue_number: pull_number,
    per_page: 100,
  });
  const existing = comments.find(
    (comment) =>
      comment.user?.login === 'github-actions[bot]' &&
      comment.user?.type === 'Bot' &&
      comment.body?.startsWith(marker),
  );
  const messages = [
    ...failures.map((message) => `❌ ${message}`),
    ...warnings.map((message) => `⚠️ ${message}`),
  ];

  if (messages.length) {
    const body = `${marker}\n## PR metadata\n\n${messages.join('\n\n')}`;
    if (existing) {
      await github.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existing.id,
        body,
      });
    } else {
      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body,
      });
    }
  } else if (existing) {
    await github.rest.issues.deleteComment({
      owner,
      repo,
      comment_id: existing.id,
    });
  }

  await core.summary
    .addHeading('PR metadata')
    .addRaw(messages.join('\n\n') || 'All PR metadata checks passed.')
    .write();
  for (const message of warnings) core.warning(message);
  if (failures.length) core.setFailed(failures.join('\n'));
}
