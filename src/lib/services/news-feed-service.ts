import type {
  NewsFeedCache,
  NewsFeedResponse,
  NewsFeedSource,
} from '$lib/types/news-feed';
import {
  buildNewsFeedUrl,
  getNewsFeedClientId,
  type NewsFeedStorage,
  newsFeedStorage,
  parseNewsFeedResponse,
} from '$lib/utilities/news-feed';

export const MOCK_NEWS_FEED_RESPONSE = {
  server_time: '2026-06-23T19:27:51Z',
  items: [
    {
      id: 1,
      title: 'OpenAI Agents SDK integration now supports sandbox environments',
      content:
        'The sandbox integration lets SandboxAgent from the OpenAI Agents SDK execute inside a remote or local sandbox (Daytona, Docker, E2B, local Unix, etc.) while keeping all coordination durable in Temporal. This is a pre-release feature. Find out more at [t.mp/nfpitem001](https://t.mp/nfpitem001)',
      priority: 8,
      tags: ['ai', 'new-feature', 'openai-agents-sdk'],
      published_at: '2026-06-04T13:38:14Z',
      expires_at: '2026-06-11T15:38:14Z',
    },
    {
      id: 2,
      title: "Videos now available for Replay '26",
      content:
        "Videos from this month's Replay conference in San Francisco started showing up on Temporal's YouTube channel yesterday. Our video team is hard at work, editing and publishing many more of them in the coming days. Here's [the playlist](https://t.mp/nfpitem002).",
      priority: 1,
      tags: ['replay', 'video'],
      published_at: '2026-06-04T06:38:14Z',
      expires_at: '2026-07-04T15:38:14Z',
    },
    {
      id: 4,
      title: 'Write lightweight, durable jobs with Standalone Activities',
      content:
        'We introduced a new primitive in Temporal: the Standalone Activity, which enables Activities to run on their own, not just as steps inside a Workflow. Standalone Activities let you improve the durability and debuggability of job processing, and eliminate complex queuing and retry logic by adopting the same model you already know and love. When your use case outgrows a single step, you can leverage that same Activity inside a Workflow, no rewrite required. Find out more at [t.mp/nfpitem004](https://t.mp/nfpitem004).',
      priority: 5,
      tags: ['product-announcement'],
      published_at: '2026-06-02T15:38:14Z',
      expires_at: '2026-07-04T15:38:14Z',
    },
    {
      id: 3,
      title: 'Serverless Workers Now in pre-release',
      content:
        'You can now run Temporal Workers on serverless compute, starting with AWS Lambda. Serverless Workers reduce time to get started by removing infrastructure planning overhead and eliminating the need for autoscaling strategy design. Temporal Cloud now automatically invokes, scales, and gracefully shuts down (scaling to zero, if appropriate) Temporal Workers on your behalf based on workload volume and metrics. This feature is now in pre-release. Find out more at [t.mp/nfpitem003](https://t.mp/nfpitem003).',
      priority: 3,
      tags: ['product-announcement', 'aws', 'operations'],
      published_at: '2026-05-20T15:38:14Z',
      expires_at: '2026-06-10T15:38:14Z',
    },
    {
      id: 5,
      title: 'Audit Log UI and API are generally available for Temporal Cloud',
      content:
        'Blah blah blah, this item should never show up in the Web UI because it is expired.',
      priority: 9,
      tags: ['feature-status-change'],
      published_at: '2026-03-16T15:38:14Z',
      expires_at: '2026-03-22T15:38:14Z',
    },
  ],
} satisfies NewsFeedResponse;

export type FetchNewsFeedOptions = {
  clusterId: string;
  source: NewsFeedSource;
  cache?: RequestCache;
  now?: () => number;
  request?: typeof fetch;
  storage?: NewsFeedStorage;
};

const toNewsFeedCache = (
  feed: NewsFeedResponse,
  fetchedAt: number,
): NewsFeedCache => ({
  fetchedAt,
  items: feed.items,
  serverTime: feed.server_time,
});

export const fetchNewsFeed = async ({
  clusterId,
  cache,
  now = Date.now,
  request = fetch,
  source,
  storage = newsFeedStorage,
}: FetchNewsFeedOptions): Promise<NewsFeedCache> => {
  if (!clusterId) {
    throw new Error('Unable to request news feed without a cluster ID');
  }

  const requestOptions: RequestInit = { credentials: 'omit' };
  if (cache) requestOptions.cache = cache;

  const response = await request(
    buildNewsFeedUrl({
      clientId: getNewsFeedClientId({ storage }),
      clusterId,
      source,
    }),
    requestOptions,
  );

  if (!response.ok) {
    throw new Error(`News feed request failed with status ${response.status}`);
  }

  const feed = parseNewsFeedResponse(await response.json());

  return toNewsFeedCache(feed, now());
};
