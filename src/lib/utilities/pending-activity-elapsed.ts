import type { PendingActivity } from '$lib/types/events';

import { formatDistance, type ValidTime } from './format-time';

export type PendingActivityElapsed = {
  /** Time since the current attempt started (or, while it waits, since the previous attempt completed). */
  currentAttempt: string;
  /** Time since the activity was first scheduled. */
  total: string;
};

type ElapsedActivity = {
  state: PendingActivity['state'];
  lastStartedTime?: ValidTime | null;
  lastAttemptCompleteTime?: ValidTime | null;
  scheduledTime?: ValidTime | null;
};

const distance = (
  start: ValidTime | undefined | null,
  now: ValidTime,
): string => (start ? formatDistance({ start, end: now }) : '');

/**
 * Elapsed times for the Pending Activity view, split into the current
 * attempt's elapsed time and the total elapsed time across all attempts.
 * Previously only the total was visible, and users mistook it for the
 * current attempt's time when judging StartToClose.
 *
 * `firstScheduledTime` is the ActivityTaskScheduled event's timestamp: the
 * moment the activity was first scheduled. It falls back to the pending
 * activity's own scheduledTime when the event is unavailable.
 */
export const getPendingActivityElapsed = (
  activity: ElapsedActivity,
  firstScheduledTime?: ValidTime | null,
  now: ValidTime = new Date(),
): PendingActivityElapsed => {
  const totalStart = firstScheduledTime ?? activity.scheduledTime ?? undefined;

  const attemptStarted =
    activity.state === 'Started' || activity.state === 'CancelRequested'
      ? activity.lastStartedTime
      : undefined;
  const currentAttemptStart =
    attemptStarted ?? activity.lastAttemptCompleteTime ?? totalStart;

  return {
    currentAttempt: distance(currentAttemptStart, now),
    total: distance(totalStart, now),
  };
};
