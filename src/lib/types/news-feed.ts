export type NewsFeedItem = {
  id: number;
  title: string;
  content: string;
  priority: number;
  tags: string[];
  published_at: string;
  expires_at: string;
};

export type NewsFeedResponse = {
  server_time: string;
  items: NewsFeedItem[];
};

export type NewsFeedCache = {
  items: NewsFeedItem[];
  fetchedAt: number;
  serverTime: string;
};

export type NewsFeedSource = 'web-ui' | 'cloud-ui';

export type NewsFeedState = {
  autoFetchEnabled: boolean;
  error: string;
  fetchedAt: number | null;
  hasUnread: boolean;
  isLoading: boolean;
  items: NewsFeedItem[];
  lastSeenServerTime: string;
  serverTime: string;
};
