import type { EventGroup } from '$lib/models/event-groups/event-groups';

import type { TimelineChildSummary } from './timeline-child-summary';
import type { Timespan } from './timespan';

export type TimeSegmentKey = string;

export type TimelineDisplayMode = 'full-duration' | 'fixed-window';
export type TimelineViewMode = TimelineDisplayMode | 'classic';

export interface TimeSegment {
  kind: 'active' | 'inactive';
  timespan: Timespan;
}

/** The event open in the details panel, with what it needs to render. */
export type TimelineSelectedDetails = {
  group: EventGroup;
  timelineKey: string;
  endTime: string | number;
  /** False once the event's run has ended, so it shows no pending state. */
  active: boolean;
  /**
   * The workflow whose history the group's events belong to. In Lanes that
   * is often a nested child, not the workflow the page is for, so event
   * numbers have to be read and linked against it.
   */
  owner?: TimelineHistoryOwner;
  /** Set when the group starts a child workflow whose history is loaded. */
  child?: TimelineChildSummary;
};

export type TimelineHistoryOwner = {
  namespace: string;
  workflowId: string;
  runId: string;
  workflowType: string;
};
