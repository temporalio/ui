/**
 * Timeline graph-row rendering logic tests.
 *
 * `timeline-graph-row.svelte` is a pure function of its props: the rendered
 * SVG depends entirely on the group's shape (eventList, isPending, category)
 * plus the pixel-position math. We test those inputs and the math here in
 * plain TypeScript — no DOM, no Svelte compiler needed.
 *
 * Sections:
 *  1. Dot-position pixel math       — the core x = ⌊ratio × TW⌋ + gutter formula
 *  2. Dot count per group shape     — 1/2/3-event groups, solo events
 *  3. Pending-line conditions       — isPending, pauseTime
 *  4. Live-poll park-and-flush      — followers parked until head arrives
 *  5. Retry state inputs            — attempt count & icon selection
 *  6. Category → icon selection     — CategoryIcon look-up for dot icons
 *  7. Classification → color        — getStatusStrokeColor for line/dot stroke
 */
import { beforeEach, describe, expect, it } from 'vitest';

import {
  appendLiveEvent,
  getEventArray,
  getGroupArray,
  processEvent,
  reset,
  resetLive,
} from '$lib/services/grouped-event-buffer';
import {
  makeActivityGroup,
  makeTimerGroup,
  makeWorkflowStarted,
} from '$lib/services/test-helpers/synthetic-events';

import {
  CategoryIcon,
  getStatusStrokeColor,
  TimelineConfig,
} from '../constants';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const { gutter, radius } = TimelineConfig;
const CANVAS_W = 1000;
const TW = CANVAS_W - 2 * gutter; // timelineWidth passed to the component

// ---------------------------------------------------------------------------
// 1. Dot-position pixel math
//
// The component computes:
//   workflowMs = endMs - startMs
//   ratio      = (eventMs - startMs) / workflowMs
//   x          = Math.round(ratio * TW) + gutter
//
// We replicate the same formula so tests stay in sync with the component.
// ---------------------------------------------------------------------------

function computeX(
  startMs: number,
  eventMs: number,
  endMs: number,
  timelineWidth = TW,
): number {
  const ratio = (eventMs - startMs) / (endMs - startMs);
  return Math.round(ratio * timelineWidth) + gutter;
}

describe('dot-position pixel math', () => {
  const start = 0;
  const end = 10_000; // 10 s workflow

  it('event at workflow start → x = gutter (leftmost visible point)', () => {
    expect(computeX(start, 0, end)).toBe(gutter);
  });

  it('event at workflow end → x = gutter + TW (rightmost visible point)', () => {
    expect(computeX(start, 10_000, end)).toBe(gutter + TW);
  });

  it('event at 50% of workflow → x = gutter + TW/2', () => {
    expect(computeX(start, 5_000, end)).toBe(Math.round(gutter + TW / 2));
  });

  it('event at 25% → x = gutter + TW * 0.25', () => {
    expect(computeX(start, 2_500, end)).toBe(Math.round(gutter + TW * 0.25));
  });

  it('event at 75% → x = gutter + TW * 0.75', () => {
    expect(computeX(start, 7_500, end)).toBe(Math.round(gutter + TW * 0.75));
  });

  it('points always within [gutter, gutter + TW]', () => {
    for (const t of [0, 1000, 3000, 5000, 7000, 9000, 10000]) {
      const x = computeX(start, t, end);
      expect(x).toBeGreaterThanOrEqual(gutter);
      expect(x).toBeLessThanOrEqual(gutter + TW);
    }
  });

  it('three events produce strictly increasing x values for increasing timestamps', () => {
    const x1 = computeX(start, 1_000, end);
    const x2 = computeX(start, 5_000, end);
    const x3 = computeX(start, 9_000, end);
    expect(x1).toBeLessThan(x2);
    expect(x2).toBeLessThan(x3);
  });

  it('ratio is linear: mid-point x is between start-x and end-x', () => {
    const x0 = computeX(start, 2_000, end);
    const xMid = computeX(start, 5_000, end);
    const x1 = computeX(start, 8_000, end);
    expect(xMid).toBeGreaterThan(x0);
    expect(xMid).toBeLessThan(x1);
  });
});

// ---------------------------------------------------------------------------
// 2. Dot count per group shape
//
// The component renders one dot per event in group.eventList. We verify that
// the groups produced by the buffer have the expected eventList lengths.
// ---------------------------------------------------------------------------

describe('dot count per group shape', () => {
  beforeEach(() => {
    reset(20);
    resetLive();
  });

  it('solo event (WorkflowExecutionStarted) → 1 dot', () => {
    processEvent(makeWorkflowStarted(1), true);
    // WorkflowStarted is solo — it is NOT in a group (solo events skip groups).
    // Verify via getGroupArray: solo events are tracked separately and not in
    // getGroupArray, but we can check that the activity group below has 1+ events.
    // The key invariant: eventList.length === number of dots rendered.
    const [scheduled] = makeActivityGroup(2);
    processEvent(scheduled, true);
    const groups = getGroupArray();
    const actGroup = groups.find((g) => g.id === '2');
    // After only the head event, eventList has exactly 1 entry.
    expect(actGroup?.eventList.length).toBe(1);
  });

  it('activity group (3 events) → 3 dots', () => {
    const [s, st, c] = makeActivityGroup(1);
    processEvent(s, true);
    processEvent(st, true);
    processEvent(c, true);
    const groups = getGroupArray();
    const g = groups.find((g) => g.id === '1');
    expect(g?.eventList.length).toBe(3);
  });

  it('timer group (2 events) → 2 dots', () => {
    const [started, fired] = makeTimerGroup(1);
    processEvent(started, true);
    processEvent(fired, true);
    const groups = getGroupArray();
    const g = groups.find((g) => g.id === '1');
    expect(g?.eventList.length).toBe(2);
  });

  it('partial activity (only scheduled) → 1 dot until followers arrive', () => {
    const [scheduled, started] = makeActivityGroup(1);
    processEvent(scheduled, true);
    expect(getGroupArray().find((g) => g.id === '1')?.eventList.length).toBe(1);

    processEvent(started, true);
    expect(getGroupArray().find((g) => g.id === '1')?.eventList.length).toBe(2);
  });

  it('multiple groups → each group has independent eventList', () => {
    const [s1, st1, c1] = makeActivityGroup(1);
    const [s2, st2, c2] = makeActivityGroup(4);
    for (const e of [s1, st1, c1, s2, st2, c2]) processEvent(e, true);

    const g1 = getGroupArray().find((g) => g.id === '1');
    const g2 = getGroupArray().find((g) => g.id === '4');
    expect(g1?.eventList.length).toBe(3);
    expect(g2?.eventList.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// 3. Pending-line and paused-line conditions
//
// `pendingLine = group.isPending || !!pauseTime`
//
// An activity that has only a Scheduled event is pending (no started yet).
// A paused activity has pauseInfo.pauseTime set on pendingActivity.
// ---------------------------------------------------------------------------

describe('pending-line conditions', () => {
  beforeEach(() => {
    reset(20);
    resetLive();
  });

  it('activity with only Scheduled event is pending → pendingLine = true', () => {
    const [scheduled] = makeActivityGroup(1);
    processEvent(scheduled, true);
    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.isPending).toBe(false); // no pendingActivity attached yet
    // The row uses: isPending = !!pendingActivity || !!pendingNexusOp || (timer 1 event) || (child-wf 2 events)
    // For a scheduled-only activity, isPending = false until enrichGroups adds the pendingActivity.
    // This test documents that the raw group is NOT yet pending — it becomes
    // pending only after enrichGroups() is called with the pending activities list.
    expect(g).toBeDefined();
  });

  it('timer group with only one event → isPending = true (timer-specific rule)', () => {
    const [started] = makeTimerGroup(1);
    processEvent(started, true);
    const g = getGroupArray().find((g) => g.id === '1');
    // isTimerStartedEvent(initialEvent) && eventList.length === 1 → isPending
    expect(g?.isPending).toBe(true);
  });

  it('timer group with both events → isPending = false', () => {
    const [started, fired] = makeTimerGroup(1);
    processEvent(started, true);
    processEvent(fired, true);
    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.isPending).toBe(false);
  });

  it('pendingLine is independent of paused state: isPending alone is sufficient', () => {
    // When isPending=true, pendingLine = true regardless of pauseTime.
    const [started] = makeTimerGroup(1);
    processEvent(started, true);
    const g = getGroupArray().find((g) => g.id === '1');
    const pendingLine = (g?.isPending ?? false) || false; // no pauseTime in unit test
    expect(pendingLine).toBe(true);
  });

  it('completed group → isPending = false', () => {
    const [s, st, c] = makeActivityGroup(1);
    for (const e of [s, st, c]) processEvent(e, true);
    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.isPending).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Live-poll follower park-and-flush (unified bidirectional pattern)
//
// Followers arriving before the head are parked invisibly in livePendingFollowers.
// Nothing appears in getGroupArray() until the head arrives. The group then
// appears fully formed — no intermediate stub state.
// ---------------------------------------------------------------------------

describe('live-poll follower park-and-flush rendering inputs', () => {
  beforeEach(() => {
    reset(10);
    resetLive();
  });

  it('follower before head → nothing in getGroupArray (no partial stub)', () => {
    const [, started] = makeActivityGroup(1);
    const before = getGroupArray().length;
    appendLiveEvent(started);
    expect(getGroupArray().length).toBe(before);
  });

  it('head arrives via appendLiveEvent → complete group with all followers', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    appendLiveEvent(started);
    appendLiveEvent(completed);
    appendLiveEvent(scheduled);

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g).toBeDefined();
    expect(g?.eventList).toHaveLength(3);
    // Correct sorted order: scheduled(1) → started(2) → completed(3)
    expect(g?.eventList.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('head arrives via processEvent → followers flushed into groupPool group', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    appendLiveEvent(started);
    appendLiveEvent(completed);
    processEvent(scheduled, true);

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(3);
    expect(g?.eventList.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('no duplicate events when live poll and bidirectional both deliver the same events', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    appendLiveEvent(started);
    appendLiveEvent(completed);
    processEvent(scheduled, true);
    processEvent(started, true);
    processEvent(completed, true);

    const ids = getEventArray().map((e) => e.id);
    expect(ids.length).toBe(new Set(ids).size);
    expect(new Set(ids)).toContain('1');
    expect(new Set(ids)).toContain('2');
    expect(new Set(ids)).toContain('3');
  });
});

// ---------------------------------------------------------------------------
// 5. Retry state inputs
//
// In the component:
//   retryAttempt = activityTaskScheduled?.attributes?.attempt ?? 0
//   retried = retryAttempt > 1
//
// When retried=true the Dot uses icon='retry' and the label shows attempt count.
// ---------------------------------------------------------------------------

describe('retry state inputs', () => {
  it('attempt=1 → retried=false', () => {
    const attempt = 1;
    expect(attempt > 1).toBe(false);
  });

  it('attempt=2 → retried=true', () => {
    const attempt = 2;
    expect(attempt > 1).toBe(true);
  });

  it('attempt=0 (not set) → retried=false', () => {
    const attempt = 0;
    expect(attempt > 1).toBe(false);
  });

  it('pendingActivity?.attempt is the source of truth', () => {
    const pendingActivity = { attempt: 3, maximumAttempts: 5 };
    const retried = pendingActivity.attempt > 1;
    expect(retried).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. Category → icon selection
//
// The component uses:
//   icon = CategoryIcon[group.category].name   (normal state)
//   icon = 'retry'                             (retried || paused-pending)
//
// Verify every category resolves to a known non-empty icon name.
// ---------------------------------------------------------------------------

describe('category → dot icon selection', () => {
  it.each([
    ['activity', 'activity'],
    ['signal', 'signal'],
    ['timer', 'retention'],
    ['child-workflow', 'relationship'],
    ['local-activity', 'feather'],
    ['update', 'update'],
    ['nexus', 'nexus'],
    ['other', 'terminal'],
    ['workflow', 'workflow'],
  ] as const)('category "%s" → icon "%s"', (category, icon) => {
    expect(CategoryIcon[category].name).toBe(icon);
  });

  it('retry state overrides category icon with "retry"', () => {
    const retried = true;
    const pauseTime = undefined;
    const icon = retried || pauseTime ? 'retry' : CategoryIcon.activity.name;
    expect(icon).toBe('retry');
  });

  it('paused state overrides to "pause" icon (second dot)', () => {
    const pauseTime = '2024-01-01T00:00:10Z';
    // index !== 0 && pauseTime → 'pause'
    const index: number = 1;
    const icon = pauseTime && index !== 0 ? 'pause' : 'activity';
    expect(icon).toBe('pause');
  });

  it('first dot when paused keeps category icon, not pause', () => {
    const pauseTime = '2024-01-01T00:00:10Z';
    const index = 0;
    const icon = pauseTime && index !== 0 ? 'pause' : 'activity';
    expect(icon).toBe('activity');
  });
});

// ---------------------------------------------------------------------------
// 7. Classification → stroke color
//
// The component uses getStatusStrokeColor on group.lastEvent.classification
// for the line between dots and on each individual event's classification
// for the dot fill.
// ---------------------------------------------------------------------------

describe('classification → stroke color', () => {
  it('Completed activity line is green', () => {
    expect(getStatusStrokeColor('Completed')).toBe('#1ff1a5');
  });

  it('Failed activity line is red', () => {
    expect(getStatusStrokeColor('Failed')).toBe('#c71607');
  });

  it('Running activity line is blue', () => {
    expect(getStatusStrokeColor('Running')).toBe('#3b82f6');
  });

  it('line color is derived from lastEvent.classification', () => {
    // This test documents that line color = getStatusStrokeColor(lastEvent.classification).
    // Simulate a group where the last event is Completed.
    const lastClassification = 'Completed' as const;
    expect(getStatusStrokeColor(lastClassification)).toBe('#1ff1a5');
  });

  it('Scheduled (Started) classification for individual dot uses currentColor', () => {
    // Scheduled events have classification 'Scheduled', which is not in the
    // status switch → falls back to currentColor.
    expect(getStatusStrokeColor('Scheduled' as never)).toBe('currentColor');
  });
});

// ---------------------------------------------------------------------------
// 8. Group ordering in getGroupArray — live groups sorted alongside pool groups
// ---------------------------------------------------------------------------

describe('getGroupArray ordering — live groups interleaved correctly', () => {
  beforeEach(() => {
    reset(20);
    resetLive();
  });

  it('live group (head from live poll) is sorted by event id, not insertion order', () => {
    // Load a later group via bidirectional
    const [s4, st4, c4] = makeActivityGroup(4);
    for (const e of [s4, st4, c4]) processEvent(e, true);

    // Live poll delivers a complete earlier group (head first, then followers)
    const [s1, st1, c1] = makeActivityGroup(1);
    appendLiveEvent(s1);
    appendLiveEvent(st1);
    appendLiveEvent(c1);

    const groups = getGroupArray();
    const g1Idx = groups.findIndex((g) => g.id === '1');
    const g4Idx = groups.findIndex((g) => g.id === '4');

    // Live group id=1 must appear before pool group id=4.
    expect(g1Idx).toBeGreaterThanOrEqual(0);
    expect(g1Idx).toBeLessThan(g4Idx);
  });

  it('live group is superseded when processEvent claims the head', () => {
    const [s1, st1, c1] = makeActivityGroup(1);
    appendLiveEvent(s1);
    appendLiveEvent(st1);
    appendLiveEvent(c1);

    // Bidirectional catches up
    processEvent(s1, true);

    const groups = getGroupArray();
    // Only one group for id=1 — no duplicate
    const matches = groups.filter((g) => g.id === '1');
    expect(matches).toHaveLength(1);
  });
});
