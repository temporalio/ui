import {
  escapeSlackMrkdwn,
  requireEnv,
  requireJsonEnv,
} from './slack-utils.mjs';

export default async ({ context }) => {
  requireEnv('SLACK_BOT_TOKEN');
  const reviewers = requireJsonEnv('REVIEWERS_JSON');

  if (reviewers.length === 0) {
    console.log('No reviewers to notify, exiting');
    return;
  }

  const pr = context.payload.pull_request;

  for (const reviewer of reviewers) {
    try {
      console.log(`Notifying ${reviewer.login} for PR #${pr.number}`);

      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: reviewer.slackUserId,
          text: `PR Review Requested: ${escapeSlackMrkdwn(pr.title)}`,
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'PR Review Requested',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*<${pr.html_url}|#${pr.number}: ${escapeSlackMrkdwn(pr.title)}>*\nYou have been requested to review this PR.`,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Author:*\n${pr.user?.login}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Repository:*\n${context.repo.owner}/${context.repo.repo}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Branch:*\n\`${escapeSlackMrkdwn(pr.head.ref)}\``,
                },
                {
                  type: 'mrkdwn',
                  text: `*Changes:*\n+${pr.additions} / -${pr.deletions}`,
                },
              ],
            },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: { type: 'plain_text', text: 'Review PR' },
                  style: 'primary',
                  url: pr.html_url,
                },
              ],
            },
          ],
        }),
      });

      const result = await response.json();
      if (!result.ok) {
        console.error(`Failed to notify ${reviewer.login}: ${result.error}`);
      } else {
        console.log(`Successfully notified ${reviewer.login}`);
      }
    } catch (error) {
      console.error(`Failed to notify ${reviewer.login}: ${error.message}`);
    }
  }
};
