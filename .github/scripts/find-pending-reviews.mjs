import {
  escapeSlackMrkdwn,
  requireEnv,
  requireJsonEnv,
} from './slack-utils.mjs';

export default async ({ github, context }) => {
  requireEnv('SLACK_BOT_TOKEN');
  const { members: userMap } = requireJsonEnv('SLACK_USER_MAP');

  const now = new Date();
  const REMINDER_THRESHOLD_HOURS = 15;

  const pullRequests = await github.paginate(github.rest.pulls.list, {
    owner: context.repo.owner,
    repo: context.repo.repo,
    state: 'open',
    per_page: 100,
  });

  console.log(`Found ${pullRequests.length} open PRs`);

  const reviewerPRs = new Map();

  for (const pr of pullRequests) {
    if (pr.draft) {
      console.log(`Skipping draft PR #${pr.number}`);
      continue;
    }

    if (pr.head.repo.full_name !== pr.base.repo.full_name) {
      console.log(`Skipping fork PR #${pr.number}`);
      continue;
    }

    const prAgeHours = (now - new Date(pr.created_at)) / (1000 * 60 * 60);
    if (prAgeHours < REMINDER_THRESHOLD_HOURS) {
      console.log(
        `PR #${pr.number} is only ${prAgeHours.toFixed(1)}hrs old, skipping`,
      );
      continue;
    }

    const reviews = await github.paginate(github.rest.pulls.listReviews, {
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr.number,
      per_page: 100,
    });

    const approvals = reviews.filter((r) => r.state === 'APPROVED');
    if (approvals.length >= 1) {
      console.log(
        `PR #${pr.number} has ${approvals.length} approval(s), skipping`,
      );
      continue;
    }

    const { data: reviewRequests } =
      await github.rest.pulls.listRequestedReviewers({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: pr.number,
      });

    const pendingReviewers = new Map();

    for (const reviewer of reviewRequests.users) {
      if (reviewer.login === pr.user?.login) continue;
      const slackUserId = userMap[reviewer.login];
      if (!slackUserId) {
        console.warn(`No Slack mapping for ${reviewer.login}, skipping`);
        continue;
      }
      pendingReviewers.set(reviewer.login, slackUserId);
    }

    for (const [login, slackUserId] of pendingReviewers) {
      if (!reviewerPRs.has(login)) {
        reviewerPRs.set(login, { slackUserId, prs: [] });
      }
      reviewerPRs.get(login).prs.push(pr);
    }
  }

  for (const [login, { slackUserId, prs }] of reviewerPRs) {
    try {
      console.log(
        `Sending aggregated reminder to ${login} for ${prs.length} PR(s)`,
      );

      const prListText = prs
        .map(
          (pr) =>
            `\u2022 *<${pr.html_url}|#${pr.number}: ${escapeSlackMrkdwn(pr.title)}>* by ${pr.user?.login} (opened ${new Date(pr.created_at).toLocaleDateString()})`,
        )
        .join('\n');

      const blocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${prs.length === 1 ? '1 PR' : `${prs.length} PRs`} awaiting your review in ${context.repo.repo}`,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: prListText,
          },
        },
      ];

      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: slackUserId,
          text: `${prs.length} PR(s) awaiting your review`,
          blocks,
        }),
      });

      const result = await response.json();
      if (!result.ok) {
        console.error(`Failed to remind ${login}: ${result.error}`);
      } else {
        console.log(`Successfully reminded ${login}`);
      }
    } catch (error) {
      console.error(`Failed to remind ${login}: ${error.message}`);
    }
  }
};
