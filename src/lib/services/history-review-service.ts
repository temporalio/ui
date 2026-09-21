import type { EventGroup } from '$lib/models/event-groups/event-groups';
import { getEventGroupName } from '$lib/models/event-groups/get-group-name';
import type { WorkflowEvent } from '$lib/types/events';
import {
  isActivityTaskStartedEvent,
  isTimerStartedEvent,
} from '$lib/utilities/is-event-type';
import { routeForApi } from '$lib/utilities/route-for-api';

import {
  postTypeSafeRequest,
  toTypeSafeErrorMessage,
} from './typesafe-request';

export const HISTORY_REVIEW_MAX_ITEMS_PER_CALL = 1000;
export const HISTORY_REVIEW_MAX_NAME_LENGTH = 200;
export const HISTORY_REVIEW_COLLAPSE_THRESHOLD = 0.35;

export type HistoryReviewItemKind = 'group' | 'event';

export type HistoryReviewItem = {
  id: string;
  kind: HistoryReviewItemKind;
  category: string;
  name: string;
  classification: string;
  eventCount: number;
  attempt: number;
  pending: boolean;
};

export type HistoryReviewRequest = {
  namespace: string;
  workflowType: string;
  workflowStatus: string;
  items: HistoryReviewItem[];
};

export type HistoryReviewScore = {
  score: number;
  confidence: number;
  pinned: boolean;
};

export type HistoryReviewScores = Record<string, HistoryReviewScore>;

export type HistoryReviewResponse = {
  scores: HistoryReviewScores;
  model: string;
};

export { TypeSafeRequestError as HistoryReviewError } from './typesafe-request';

export const toHistoryReviewErrorMessage = (error: unknown): string =>
  toTypeSafeErrorMessage(error, {
    rateLimited: 'events.history-review-rate-limited',
    rateLimitedRetry: 'events.history-review-rate-limited-retry',
    forbidden: 'events.history-review-forbidden',
    generic: 'events.history-review-error',
  });

const limitName = (name: string): string =>
  name.slice(0, HISTORY_REVIEW_MAX_NAME_LENGTH);

/**
 * The only free-text field in a request. It must stay an identifier.
 * NEVER use `getEventGroupDisplayName` or `getSummaryAttribute` here: both
 * read decoded payloads (local activity summaries, inputs, results).
 * `markerName` is the one name a workflow author can set freely, so it is
 * length-limited like every other name and is the field to drop first if
 * names ever need to be restricted further.
 */
const getSafeName = (event: WorkflowEvent): string => {
  if (isTimerStartedEvent(event)) {
    return limitName(String(event.timerStartedEventAttributes?.timerId ?? ''));
  }

  return limitName(getEventGroupName(event) || String(event.name ?? ''));
};

const toAttempt = (value: unknown): number => {
  const attempt = Number(value);
  return Number.isFinite(attempt) && attempt > 0 ? Math.floor(attempt) : 0;
};

const getGroupAttempt = (group: EventGroup): number => {
  const started = group.eventList.filter(isActivityTaskStartedEvent).at(-1);

  return Math.max(
    toAttempt(group.pendingActivity?.attempt),
    toAttempt(started?.activityTaskStartedEventAttributes?.attempt),
  );
};

const toGroupItem = (group: EventGroup): HistoryReviewItem => ({
  id: String(group.id),
  kind: 'group',
  category: String(group.category ?? ''),
  name: getSafeName(group.initialEvent),
  classification: String(
    group.finalClassification ?? group.classification ?? '',
  ),
  eventCount: group.eventList.length,
  attempt: getGroupAttempt(group),
  pending: Boolean(group.isPending),
});

const toEventItem = (event: WorkflowEvent): HistoryReviewItem => ({
  id: String(event.id),
  kind: 'event',
  category: String(event.category ?? ''),
  name: getSafeName(event),
  classification: String(event.classification ?? ''),
  eventCount: 1,
  attempt: 0,
  pending: false,
});

const byNumericId = (a: HistoryReviewItem, b: HistoryReviewItem): number =>
  Number(a.id) - Number(b.id);

export const buildHistoryReviewItems = ({
  events,
  groups,
}: {
  events: WorkflowEvent[];
  groups: EventGroup[];
}): HistoryReviewItem[] => {
  const groupedEventIds = new Set<string>();
  for (const group of groups) {
    for (const event of group.eventList) groupedEventIds.add(String(event.id));
  }

  return [
    ...groups.map(toGroupItem),
    ...events
      .filter((event) => !groupedEventIds.has(String(event.id)))
      .map(toEventItem),
  ].sort(byNumericId);
};

// Explicit field lists, never a spread of caller input: a caller that passes a
// wider object (a workflow with memo or search attributes) must not leak it.
const toClosedItem = (item: HistoryReviewItem): HistoryReviewItem => ({
  id: String(item.id),
  kind: item.kind === 'group' ? 'group' : 'event',
  category: String(item.category ?? ''),
  name: limitName(String(item.name ?? '')),
  classification: String(item.classification ?? ''),
  eventCount: Number(item.eventCount) || 0,
  attempt: toAttempt(item.attempt),
  pending: Boolean(item.pending),
});

export const toHistoryReviewRequests = ({
  namespace,
  workflowType,
  workflowStatus,
  items,
}: HistoryReviewRequest): HistoryReviewRequest[] => {
  const requests: HistoryReviewRequest[] = [];
  for (let i = 0; i < items.length; i += HISTORY_REVIEW_MAX_ITEMS_PER_CALL) {
    requests.push({
      namespace: String(namespace ?? ''),
      workflowType: String(workflowType ?? ''),
      workflowStatus: String(workflowStatus ?? ''),
      items: items
        .slice(i, i + HISTORY_REVIEW_MAX_ITEMS_PER_CALL)
        .map(toClosedItem),
    });
  }
  return requests;
};

const PINNED_SCORE: HistoryReviewScore = {
  score: 1,
  confidence: 1,
  pinned: true,
};

/**
 * The server pins nothing by position. The first and the last row of the WHOLE
 * history are always visible, whatever their score and however many calls the
 * history needed.
 */
export const pinFirstAndLast = (
  scores: HistoryReviewScores,
  items: HistoryReviewItem[],
): HistoryReviewScores => {
  const pinned = { ...scores };
  for (const item of [items[0], items[items.length - 1]]) {
    if (!item) continue;
    const id = String(item.id);
    pinned[id] = pinned[id] ? { ...pinned[id], pinned: true } : PINNED_SCORE;
  }
  return pinned;
};

const isScore = (value: unknown): value is HistoryReviewScore =>
  typeof (value as HistoryReviewScore)?.score === 'number';

export const reviewHistory = async ({
  request = fetch,
  namespace,
  workflowType,
  workflowStatus,
  items,
}: HistoryReviewRequest & {
  request?: typeof fetch;
}): Promise<HistoryReviewResponse> => {
  const route = routeForApi('history-review');
  const scores: HistoryReviewScores = {};
  let model = '';

  for (const body of toHistoryReviewRequests({
    namespace,
    workflowType,
    workflowStatus,
    items,
  })) {
    const response = await postTypeSafeRequest<Partial<HistoryReviewResponse>>(
      route,
      body,
      request,
    );

    for (const [id, value] of Object.entries(response?.scores ?? {})) {
      if (!isScore(value)) continue;
      scores[id] = {
        score: value.score,
        confidence: typeof value.confidence === 'number' ? value.confidence : 0,
        pinned: Boolean(value.pinned),
      };
    }
    model = response?.model ?? model;
  }

  return { scores: pinFirstAndLast(scores, items), model };
};
