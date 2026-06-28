import { SvelteMap } from 'svelte/reactivity';

import type { TimeScale } from './renderer/fonts';
import type { TemporalEvent, TimelineViewport } from './types';

export const TIMELINE_CTX = Symbol('timeline-ctx');

export class TimelineState {
  viewport = $state<TimelineViewport>({
    startMs: 0,
    endMs: 120_000,
    scrollY: 0,
    zoom: 0.008,
    scaleY: 1.0,
  });

  hovered = $state<TemporalEvent | null>(null);
  selectedEvents = $state<Record<string, TemporalEvent>>({});
  hoveredPosition = $state({ x: 0, y: 0, barBottom: 0 });

  dataRange = $state({ startMs: 0, endMs: 120_000 });

  totalEvents = $state(0);
  totalTracks = $state(0);
  visibleEvents = $state(0);
  scrollHeight = $state(0);
  maxScrollY = $state(0);
  expansionH = $state(0);
  rowSize = $state(25);
  effectiveTrackH = $state(22);
  expandedPanelHeights = $state<Record<string, number>>({});
  rendererInfo = $state('');
  grouped = $state(true);
  timeScale = $state<TimeScale>('auto');
  sortOrder = $state<'desc' | 'asc'>('desc');
  keyboardFocusPoolIdx = $state<number | null>(null);

  frameStats = $state({
    avgMs: 0,
    p95Ms: 0,
    p99Ms: 0,
    maxMs: 0,
    sampleCount: 0,
  });
  openedChildWorkflows = $state<
    {
      runId: string;
      label: string;
      events: TemporalEvent[];
      trackIndex: number;
      collapsed: boolean;
      height: number;
      topOffset: number;
    }[]
  >([]);
}

export interface TimelineCtx {
  isChild: boolean;
  state: TimelineState;
  panelEls: Map<string, HTMLElement>;
  childLaneEls: Map<string, HTMLElement>;
  childWorkflowData: Map<string, TemporalEvent[]>;
  setHovered: (
    event: TemporalEvent | null,
    x?: number,
    y?: number,
    barHeight?: number,
  ) => void;
  setViewport: (partial: Partial<TimelineViewport>) => void;
  toggleSelected: (event: TemporalEvent) => void;
  deselectEvent: (eventId: string) => void;
  openChildWorkflow: (runId: string, label: string, trackIndex: number) => void;
  closeChildWorkflow: (runId: string) => void;
  toggleCollapseChildWorkflow: (runId: string) => void;
}

export const panelEls = new SvelteMap<string, HTMLElement>();

export const childWorkflowData = new SvelteMap<string, TemporalEvent[]>();

export const childLaneEls = new SvelteMap<string, HTMLElement>();

export const timelineState = new TimelineState();

export function setViewport(partial: Partial<TimelineViewport>) {
  Object.assign(timelineState.viewport, partial);
}

export function setHovered(
  event: TemporalEvent | null,
  canvasX = 0,
  canvasY = 0,
  barHeight = 0,
) {
  timelineState.hovered = event;
  if (event)
    timelineState.hoveredPosition = {
      x: canvasX,
      y: canvasY,
      barBottom: canvasY + barHeight,
    };
}

export function toggleSelected(event: TemporalEvent) {
  if (timelineState.selectedEvents[event.eventId]) {
    delete timelineState.selectedEvents[event.eventId];
    delete timelineState.expandedPanelHeights[event.eventId];
  } else {
    timelineState.selectedEvents[event.eventId] = event;
  }
}

export function deselectEvent(eventId: string) {
  delete timelineState.selectedEvents[eventId];
  delete timelineState.expandedPanelHeights[eventId];
}

export function openChildWorkflow(
  runId: string,
  label: string,
  trackIndex: number,
) {
  if (timelineState.openedChildWorkflows.some((c) => c.runId === runId)) return;
  const events = childWorkflowData.get(runId);
  if (!events) return;
  timelineState.openedChildWorkflows.push({
    runId,
    label,
    events,
    trackIndex,
    collapsed: false,
    height: 280,
    topOffset: 0,
  });
}

export function closeChildWorkflow(runId: string) {
  const idx = timelineState.openedChildWorkflows.findIndex(
    (c) => c.runId === runId,
  );
  if (idx >= 0) timelineState.openedChildWorkflows.splice(idx, 1);
}

export function toggleCollapseChildWorkflow(runId: string) {
  const entry = timelineState.openedChildWorkflows.find(
    (c) => c.runId === runId,
  );
  if (entry) entry.collapsed = !entry.collapsed;
}

export function makeMainCtx(): TimelineCtx {
  return {
    isChild: false,
    state: timelineState,
    panelEls,
    childLaneEls,
    childWorkflowData,
    setHovered,
    setViewport,
    toggleSelected,
    deselectEvent,
    openChildWorkflow,
    closeChildWorkflow,
    toggleCollapseChildWorkflow,
  };
}

export function makeChildCtx(): TimelineCtx {
  const state = new TimelineState();

  const childPanelEls = new SvelteMap<string, HTMLElement>();
  return {
    isChild: true,
    state,
    panelEls: childPanelEls,

    childLaneEls: new SvelteMap(),

    childWorkflowData: new SvelteMap(),
    setHovered: (ev, x = 0, y = 0, h = 0) => {
      state.hovered = ev;
      if (ev) state.hoveredPosition = { x, y, barBottom: y + h };
    },
    setViewport: (partial) => Object.assign(state.viewport, partial),
    toggleSelected: (ev) => {
      if (state.selectedEvents[ev.eventId]) {
        delete state.selectedEvents[ev.eventId];
        delete state.expandedPanelHeights[ev.eventId];
      } else {
        state.selectedEvents[ev.eventId] = ev;
      }
    },
    deselectEvent: (id) => {
      delete state.selectedEvents[id];
      delete state.expandedPanelHeights[id];
    },
    openChildWorkflow: () => {},
    closeChildWorkflow: () => {},
    toggleCollapseChildWorkflow: () => {},
  };
}
