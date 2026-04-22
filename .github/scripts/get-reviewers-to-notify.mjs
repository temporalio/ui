import { requireJsonEnv } from './slack-utils.mjs';

export default async ({ context, core }) => {
  const eventAction = context.payload.action;
  const pr = context.payload.pull_request;

  const { members: userMap } = requireJsonEnv('SLACK_USER_MAP');

  const resolveSlackUser = (login) => {
    const slackUserId = userMap[login];
    if (!slackUserId) {
      console.warn(`No Slack mapping for ${login}, skipping`);
      return null;
    }
    return { login, slackUserId };
  };

  const prAuthor = pr.user?.login;
  const reviewersToNotify = [];

  if (eventAction === 'review_requested') {
    const requestedReviewer = context.payload.requested_reviewer;

    if (requestedReviewer) {
      console.log(`Individual reviewer added: ${requestedReviewer.login}`);

      if (requestedReviewer.login === prAuthor) {
        console.log(`Skipping PR author ${prAuthor}`);
      } else {
        const resolved = resolveSlackUser(requestedReviewer.login);
        if (resolved) reviewersToNotify.push(resolved);
      }
    } else {
      console.log(
        'Team review requested, skipping (only individual reviewers are notified)',
      );
    }
  } else if (eventAction === 'ready_for_review') {
    console.log(
      'PR converted from draft, resolving individually requested reviewers...',
    );

    const requestedReviewers = pr.requested_reviewers || [];
    console.log(
      `Found ${requestedReviewers.length} individually requested reviewers`,
    );

    for (const reviewer of requestedReviewers) {
      if (reviewer.login === prAuthor) continue;
      const resolved = resolveSlackUser(reviewer.login);
      if (resolved) reviewersToNotify.push(resolved);
    }
  }

  console.log(`Total reviewers to notify: ${reviewersToNotify.length}`);
  for (const r of reviewersToNotify) core.setSecret(r.slackUserId);
  core.setOutput('reviewers', JSON.stringify(reviewersToNotify));
};
