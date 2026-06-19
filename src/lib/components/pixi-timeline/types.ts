export type EventStatus =
  | 'scheduled'
  | 'started'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'fired'
  | 'signaled';

export interface TemporalEvent {
  eventId: string;
  eventType: string;
  eventTime: string | number;
  startMs: number;
  endMs: number;
  status: EventStatus;
  trackIndex: number;
  attributes: Record<string, unknown>;
  poolIdx?: number;
}

export interface TimelineViewport {
  startMs: number;
  endMs: number;
  scrollY: number;
  zoom: number;
  scaleY: number;
}

export interface TimelineConfig {
  trackHeight: number;
  trackGap: number;
  minZoom: number;
  maxZoom: number;
  backgroundColor: number;
}

/** Passed to PixiRenderer.loadEvents() and Timeline.svelte instead of TemporalEvent[]. */
export interface PixiRenderArgs {
  /** Total groups registered in the buffer pool so far (ascCount + descCount). */
  poolCount: number;
  /** Estimated total number of groups across the entire workflow. */
  totalRows: number;
  /** Groups loaded by the ascending cursor. */
  ascCount: number;
  /** Groups loaded by the descending cursor. */
  descCount: number;
  /** True once fetchBidirectional completes and assignTrackIndices() has been called. */
  finalized: boolean;
}
