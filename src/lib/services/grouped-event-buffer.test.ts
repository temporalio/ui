import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { groupEvents } from '$lib/models/event-groups';
import { toEventHistory } from '$lib/models/event-history';
import type { HistoryEvent } from '$lib/types/events';

import {
  enrichGroups,
  getEventArray,
  getGroupArray,
  getGroupSummaries,
  getWorkflowTaskFailedEvent,
  ingestHistoryEvent,
  isWorkflowTaskGroup,
  materializeGroup,
  reset,
  setFailedEvent,
} from './grouped-event-buffer';
import {
  makeActivityGroup,
  makeActivityScheduled,
  makeActivityStarted,
  makeActivityTimeoutGroup,
  makeChildWorkflowGroup,
  makeLocalActivityGroup,
  makeNexusOperationGroup,
  makeSyntheticEvents,
  makeSyntheticEventsWithWorkflowTasks,
  makeTimerGroup,
  makeWorkflowCompleted,
  makeWorkflowStarted,
  makeWorkflowTaskCompleted,
  makeWorkflowTaskFailed,
  makeWorkflowTaskGroup,
  makeWorkflowTaskScheduled,
  makeWorkflowTaskStarted,
  makeWorkflowUpdateGroup,
} from './test-helpers/synthetic-events';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Load all events ascending (simulates asc-cursor-wins scenario). */
function loadAll(events: ReturnType<typeof makeSyntheticEvents>) {
  for (const e of events) ingestHistoryEvent(e, true);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  reset(0);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// 1. Correctness: output equivalence with groupEvents
// ---------------------------------------------------------------------------

describe('output equivalence with groupEvents', () => {
  it('matches groupEvents for a small ascending load', async () => {
    const events = makeSyntheticEvents(30);
    reset(30);
    loadAll(events);

    const workflowEvents = toEventHistory(events);
    const expected = groupEvents(workflowEvents, 'ascending');
    const actual = getGroupArray();

    expect(actual.map((g) => g.id)).toEqual(expected.map((g) => g.id));
    expect(actual.map((g) => g.eventList.length)).toEqual(
      expected.map((g) => g.eventList.length),
    );
  });

  it('includes WorkflowTask groups when present', async () => {
    const events = makeSyntheticEventsWithWorkflowTasks(30);
    reset(30);
    loadAll(events);

    const actual = getGroupArray();
    const wftGroups = actual.filter(isWorkflowTaskGroup);
    expect(wftGroups.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Follower / head arrival ordering
// ---------------------------------------------------------------------------

describe('follower before head', () => {
  it('desc-cursor followers arriving before the asc-cursor head land in the group', () => {
    reset(10);
    const [head, started, completed] = makeActivityGroup(1);

    // Desc cursor delivers completed & started before head
    ingestHistoryEvent(completed, false);
    ingestHistoryEvent(started, false);
    expect(getGroupArray()).toHaveLength(0);

    // Asc cursor delivers the head
    ingestHistoryEvent(head, true);

    const groups = getGroupArray();
    expect(groups).toHaveLength(1);
    expect(groups[0].eventList).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// 3. Non-terminal workflow (running — new events arrive after initial fetch)
// ---------------------------------------------------------------------------

describe('non-terminal workflow: new events beyond initial historyLength', () => {
  it('new events extend the slot arrays beyond the initial allocation', () => {
    const initialEvents = makeSyntheticEvents(9); // 9 events → 3 groups
    reset(9);
    loadAll(initialEvents);

    const initialGroupCount = getGroupArray().length;
    expect(initialGroupCount).toBeGreaterThan(0);

    // New activity arrives at IDs 10-12
    const [newHead, newStarted, newCompleted] = makeActivityGroup(10);
    ingestHistoryEvent(newHead, true);
    ingestHistoryEvent(newStarted, true);
    ingestHistoryEvent(newCompleted, true);

    const groups = getGroupArray();
    expect(groups).toHaveLength(initialGroupCount + 1);

    const newGroup = groups.find((group) => group.id === '10');
    expect(newGroup).toBeDefined();
    expect(newGroup?.eventList).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// 4. Navigation reset
// ---------------------------------------------------------------------------
describe('navigation reset', () => {
  it('reset() zeroes pool entries and reuses them for the next workflow', async () => {
    const events1 = makeSyntheticEvents(30);
    reset(30);
    loadAll(events1);
    const firstGroupCount = getGroupArray().length;

    reset(15);
    const events2 = makeSyntheticEvents(15);
    loadAll(events2);

    // Pool was re-used — no double allocation
    expect(getGroupArray().length).toBeLessThanOrEqual(firstGroupCount);
    expect(getGroupArray().length).toBeGreaterThan(0);
  });

  it('groups from the previous workflow do not survive reset()', () => {
    reset(30);
    loadAll(makeSyntheticEvents(30));
    expect(getGroupArray().length).toBeGreaterThan(0);

    reset(9); // navigate away
    expect(getGroupArray()).toHaveLength(0);

    loadAll(makeSyntheticEvents(9));
    const ids = getGroupArray().map((group) => Number(group.id));
    expect(Math.max(...ids)).toBeLessThanOrEqual(9);
  });
});

// ---------------------------------------------------------------------------
// 5. Compact view regression: WFT groups must not appear in filtered output
//
// Regression: workflow-history-layout called getGroupArray() without
// excludeWorkflowTasks:true, leaking WFT groups into the Compact view.
// ---------------------------------------------------------------------------

describe('compact view: getGroupArray excludeWorkflowTasks regression', () => {
  it('returns no WFT groups when excludeWorkflowTasks is true, even with interleaved events', () => {
    reset(30);
    // Interleave WFT groups and activity groups to simulate a real workflow
    for (const e of makeWorkflowTaskGroup(1)) ingestHistoryEvent(e, true);
    for (const e of makeActivityGroup(4)) ingestHistoryEvent(e, true);
    for (const e of makeWorkflowTaskGroup(7)) ingestHistoryEvent(e, true);
    for (const e of makeActivityGroup(10)) ingestHistoryEvent(e, true);
    for (const e of makeWorkflowTaskGroup(13)) ingestHistoryEvent(e, true);

    const compactGroups = getGroupArray({ excludeWorkflowTasks: true });

    expect(compactGroups.every((g) => !isWorkflowTaskGroup(g))).toBe(true);
    expect(compactGroups).toHaveLength(2); // only the two activity groups
  });

  it('includes WFT groups in unfiltered output (for All events view)', () => {
    reset(20);
    for (const e of makeWorkflowTaskGroup(1)) ingestHistoryEvent(e, true);
    for (const e of makeActivityGroup(4)) ingestHistoryEvent(e, true);

    const allGroups = getGroupArray();
    const wftGroups = allGroups.filter(isWorkflowTaskGroup);

    expect(wftGroups.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 6. Boundary dedup (cursor overlap)
// ---------------------------------------------------------------------------

describe('boundary dedup', () => {
  it('write-once guard prevents double group registration for the same head slot', () => {
    reset(10);
    const [head] = makeActivityGroup(1);

    ingestHistoryEvent(head, true); // asc cursor
    ingestHistoryEvent(head, false); // desc cursor — same event, same slot

    expect(getGroupArray().length).toBe(1);
  });

  it('a redelivered head does not corrupt an already-built group', () => {
    reset(10);
    const [head, started, completed] = makeActivityGroup(1);

    ingestHistoryEvent(head, true);
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);

    // Simulate boundary overlap: desc cursor also writes the head
    ingestHistoryEvent(head, false);

    expect(getGroupArray()).toHaveLength(1);
    expect(getGroupArray()[0].eventList).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// 7. Solo event orphan cleanup
// ---------------------------------------------------------------------------

describe('solo event orphan cleanup', () => {
  it('WorkflowExecutionStarted is not registered as a group', () => {
    reset(10);
    ingestHistoryEvent(makeWorkflowStarted(1), true);
    expect(getGroupArray().length).toBe(0);
  });

  it('WorkflowExecutionCompleted is not registered as a group', () => {
    reset(10);
    ingestHistoryEvent(makeWorkflowCompleted(5), true);
    expect(getGroupArray().length).toBe(0);
  });

  it('followers of a solo head form no group but stay in the event list', () => {
    reset(10);

    // A follower that references slot 0 (eventId "1") as its head, where slot 0
    // turns out to be a WorkflowExecutionStarted — solo, not a group head.
    ingestHistoryEvent(makeActivityStarted(2, 1), false);
    ingestHistoryEvent(makeWorkflowStarted(1), true);

    expect(getGroupArray()).toHaveLength(0);
    expect(getEventArray().map((event) => event.id)).toEqual(['1', '2']);
  });
});

// ---------------------------------------------------------------------------
// 8. setFailedEvent (billableActions context)
// ---------------------------------------------------------------------------

describe('setFailedEvent', () => {
  it('can be set to null without error', () => {
    reset(10);
    setFailedEvent(null);
    expect(getGroupArray()).toHaveLength(0);
  });

  it('can be set to a HistoryEvent before ingestHistoryEvent calls', () => {
    reset(10);
    const events = makeSyntheticEvents(9);
    // Simulate desc first-page hook
    setFailedEvent(null);
    loadAll(events);
    expect(getGroupArray().length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 9. Heap size smoke test (skipped unless NODE_OPTIONS=--expose-gc)
// ---------------------------------------------------------------------------

describe('memory overhead smoke test', () => {
  it('heap growth for 50k events stays under 70MB', async () => {
    if (typeof globalThis.gc !== 'function') return; // skip without --expose-gc

    const events = makeSyntheticEvents(50_000);
    globalThis.gc();
    const before = process.memoryUsage().heapUsed;

    reset(50_000);
    loadAll(events);
    getGroupArray();

    globalThis.gc();
    const after = process.memoryUsage().heapUsed;
    const deltaMB = (after - before) / (1024 * 1024);

    // Log the actual number so it's visible in CI output
    console.log(`heap delta for 50k events: ${deltaMB.toFixed(1)} MB`);
    expect(deltaMB).toBeLessThan(70);
  });
});

// ---------------------------------------------------------------------------
// 10. Activity group integrity
// ---------------------------------------------------------------------------

describe('activity group integrity', () => {
  it('group has all 3 events when loaded ascending', async () => {
    reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(scheduled, true);
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);

    const [group] = getGroupArray();
    expect(group.eventList.length).toBe(3);
    expect(group.id).toBe('1');
  });

  it('group has all 3 events when followers arrive before head', async () => {
    reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);

    // Desc cursor delivers completion and start first
    ingestHistoryEvent(completed, false);
    ingestHistoryEvent(started, false);
    // Asc cursor delivers head
    ingestHistoryEvent(scheduled, true);

    const [group] = getGroupArray();
    expect(group.eventList.length).toBe(3);
  });

  it('eventList is sorted by event ID when desc cursor delivers Completed before Started', async () => {
    // Real-world scenario: descending cursor fetches events newest-first,
    // so ActivityTaskCompleted (higher ID) arrives before ActivityTaskStarted
    // (lower ID). insertEventById must keep the list in ascending ID order so
    // that isMiddleEvent, isConsecutiveGroup, and the detail panel all see
    // [Scheduled, Started, Completed] rather than [Scheduled, Completed, Started].
    reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);

    ingestHistoryEvent(scheduled, true); // asc cursor: head arrives first
    ingestHistoryEvent(completed, false); // desc cursor: Completed arrives before Started
    ingestHistoryEvent(started, false); // desc cursor: Started arrives last despite lower ID

    const [group] = getGroupArray();
    expect(group.eventList.map((e) => e.id)).toEqual([
      String(scheduled.eventId),
      String(started.eventId),
      String(completed.eventId),
    ]);
  });

  it('multiple groups maintain correct event membership', async () => {
    reset(20);
    const group1Events = makeActivityGroup(1);
    const group2Events = makeActivityGroup(4);
    const group3Events = makeTimerGroup(7);

    for (const e of [...group1Events, ...group2Events, ...group3Events]) {
      ingestHistoryEvent(e, true);
    }

    const groups = getGroupArray();
    expect(groups[0].eventList.length).toBe(3); // activity
    expect(groups[1].eventList.length).toBe(3); // activity
    expect(groups[2].eventList.length).toBe(2); // timer
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 11. enrichGroups — pending activity + nexus annotation
// ---------------------------------------------------------------------------

describe('enrichGroups', () => {
  it('sets pendingActivity on an in-flight activity group (1 event)', async () => {
    reset(10);
    ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'), true);

    const pendingActivities = [
      { activityId: '1', state: 'Started', activityType: 'MyActivity' },
    ] as Parameters<typeof enrichGroups>[0];

    enrichGroups(pendingActivities, []);

    const [group] = getGroupArray();
    expect(group.pendingActivity).toBeDefined();
    expect(group.pendingActivity?.activityId).toBe('1');
  });

  it('swaps in a fresh group reference when pending state changes', () => {
    reset(10);
    ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'), true);
    const before = getGroupArray().find((g) => g.id === '1');

    enrichGroups(
      [
        { activityId: '1', state: 'Started', activityType: 'MyActivity' },
      ] as Parameters<typeof enrichGroups>[0],
      [],
    );

    const after = getGroupArray().find((g) => g.id === '1');
    // Reference-tracking views only re-derive when the object identity changes;
    // a pause/unpause appends no history event, so the ref swap is the signal.
    expect(after).not.toBe(before);
    expect(after?.pendingActivity?.activityId).toBe('1');
    // The rebuilt group keeps the prototype-backed getters and owns its own
    // eventList — the previous reference is a complete, untouched snapshot.
    expect(after?.isPending).toBe(true);
    expect(after?.eventList).not.toBe(before?.eventList);
    expect(after?.eventList).toEqual(before?.eventList);
    expect(before?.pendingActivity).toBeUndefined();
  });

  it('reuses the group reference when pending state is unchanged', () => {
    reset(10);
    ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'), true);
    const pending = [
      { activityId: '1', state: 'Started', activityType: 'MyActivity' },
    ] as Parameters<typeof enrichGroups>[0];

    enrichGroups(pending, []);
    const first = getGroupArray().find((g) => g.id === '1');
    enrichGroups(pending, []);
    const second = getGroupArray().find((g) => g.id === '1');

    expect(second).toBe(first);
  });

  it('does not set pendingActivity on a completed activity group (3 events)', async () => {
    reset(10);
    const [s, st, c] = makeActivityGroup(1);
    ingestHistoryEvent(s, true);
    ingestHistoryEvent(st, true);
    ingestHistoryEvent(c, true);

    const pendingActivities = [
      { activityId: '1', state: 'Started', activityType: 'TestActivity' },
    ] as Parameters<typeof enrichGroups>[0];

    enrichGroups(pendingActivities, []);

    const [group] = getGroupArray();
    expect(group.pendingActivity).toBeUndefined();
  });

  it('clears a previously set pendingActivity when no longer pending', async () => {
    reset(10);
    const [s, st, c] = makeActivityGroup(1);
    ingestHistoryEvent(s, true);
    ingestHistoryEvent(st, true);
    ingestHistoryEvent(c, true);

    // First enrichment marks it pending
    const pa = [{ activityId: '1', state: 'Started' }] as Parameters<
      typeof enrichGroups
    >[0];
    enrichGroups(pa, []);

    // Second enrichment with empty array (activity completed server-side)
    enrichGroups([], []);

    const [group] = getGroupArray();
    expect(group.pendingActivity).toBeUndefined();
  });

  it('clears pendingActivity when live completion extends an existing group', async () => {
    reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(scheduled, true);
    ingestHistoryEvent(started, true);

    enrichGroups(
      [
        {
          activityId: '1',
          state: 'Started',
          activityType: 'TestActivity',
        },
      ] as Parameters<typeof enrichGroups>[0],
      [],
    );

    let [group] = getGroupArray();
    expect(group.pendingActivity).toBeDefined();
    expect(group.isPending).toBe(true);

    expect(ingestHistoryEvent(completed, true)).toBe(true);

    [group] = getGroupArray();
    expect(group.eventList).toHaveLength(3);
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('clears pendingActivity when a live timeout resolves a short activity group', async () => {
    reset(10);
    const [scheduled, timedOut] = makeActivityTimeoutGroup(1);
    ingestHistoryEvent(scheduled, true);

    enrichGroups(
      [
        {
          activityId: '1',
          state: 'Started',
          activityType: 'TestActivity',
        },
      ] as Parameters<typeof enrichGroups>[0],
      [],
    );

    let [group] = getGroupArray();
    expect(group.pendingActivity).toBeDefined();
    expect(group.isPending).toBe(true);

    expect(ingestHistoryEvent(timedOut, true)).toBe(true);

    [group] = getGroupArray();
    expect(group.eventList.map((event) => event.id)).toEqual(['1', '2']);
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('annotates live-only activity and nexus groups with pending metadata', () => {
    reset(20);
    ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'), true);
    ingestHistoryEvent(makeNexusOperationGroup(4)[0], true);

    enrichGroups(
      [
        {
          activityId: '1',
          state: 'Started',
          activityType: 'MyActivity',
        },
      ] as Parameters<typeof enrichGroups>[0],
      [
        {
          scheduledEventId: '4',
        },
      ] as Parameters<typeof enrichGroups>[1],
    );

    const groups = getGroupArray();
    expect(
      groups.find((group) => group.id === '1')?.pendingActivity,
    ).toBeDefined();
    expect(
      groups.find((group) => group.id === '4')?.pendingNexusOperation,
    ).toBeDefined();
  });

  it('ignores activities not in the pending list', async () => {
    reset(10);
    ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'), true);
    enrichGroups([], []);

    const [group] = getGroupArray();
    expect(group.pendingActivity).toBeUndefined();
  });

  it('does not touch non-activity groups', async () => {
    reset(10);
    const [ts, tf] = makeTimerGroup(1);
    ingestHistoryEvent(ts, true);
    ingestHistoryEvent(tf, true);

    enrichGroups(
      [{ activityId: '1', state: 'Started' }] as Parameters<
        typeof enrichGroups
      >[0],
      [],
    );

    const [group] = getGroupArray();
    expect(group.pendingActivity).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 12. getWorkflowTaskFailedEvent — derives active WFT failure from buffer
// ---------------------------------------------------------------------------

describe('getWorkflowTaskFailedEvent (buffer)', () => {
  it('returns undefined when no WFT groups exist', () => {
    reset(10);
    ingestHistoryEvent(makeActivityScheduled(1), true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns undefined when WFT group completed normally', () => {
    reset(10);
    for (const e of makeWorkflowTaskGroup(1)) ingestHistoryEvent(e, true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns the failed event when a WFT group has no subsequent completion', () => {
    reset(10);
    // WFT: Scheduled(1), Started(2), Failed(3)
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(2, 1), true);
    ingestHistoryEvent(makeWorkflowTaskFailed(3, 1), true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed).toBeDefined();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
  });

  it('returns undefined when a later WFT completed after the failure (workflow recovered)', () => {
    reset(20);
    // First WFT: fails
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(2, 1), true);
    ingestHistoryEvent(makeWorkflowTaskFailed(3, 1), true);
    // Second WFT: completes successfully (workflow recovered)
    ingestHistoryEvent(makeWorkflowTaskScheduled(4), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(5, 4), true);
    ingestHistoryEvent(makeWorkflowTaskCompleted(6, 4), true);

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns undefined for ResetWorkflow cause (not a real failure)', () => {
    reset(10);
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(2, 1), true);
    ingestHistoryEvent(makeWorkflowTaskFailed(3, 1, 'ResetWorkflow'), true);

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns the most recent failure when multiple WFT groups fail', () => {
    reset(20);
    // First WFT fails
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(2, 1), true);
    ingestHistoryEvent(makeWorkflowTaskFailed(3, 1), true);
    // Second WFT also fails (eventId 6 > 3)
    ingestHistoryEvent(makeWorkflowTaskScheduled(4), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(5, 4), true);
    ingestHistoryEvent(makeWorkflowTaskFailed(6, 4), true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('6');
  });

  it('returns a WFT failure whose group arrives entirely via the live poll', () => {
    reset(10);
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(2, 1), true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();

    expect(ingestHistoryEvent(makeWorkflowTaskFailed(3, 1), true)).toBe(true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });

  it('returns a live WFT failure appended to a WFT head already in the pool', () => {
    reset(10);
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(2, 1), true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();

    expect(ingestHistoryEvent(makeWorkflowTaskFailed(3, 1), true)).toBe(true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });

  it('clears the WFT failure when a later WFT completes via the live poll', () => {
    reset(20);
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(2, 1), true);
    ingestHistoryEvent(makeWorkflowTaskFailed(3, 1), true);
    expect(getWorkflowTaskFailedEvent()?.id).toBe('3');

    // Workflow recovers: a new WFT completes, delivered live.
    ingestHistoryEvent(makeWorkflowTaskScheduled(4), true);
    ingestHistoryEvent(makeWorkflowTaskStarted(5, 4), true);
    ingestHistoryEvent(makeWorkflowTaskCompleted(6, 4), true);

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('does not double-count a live WFT group once the fetch claims its head', () => {
    reset(10);
    // Failure lands live first, then the bidirectional fetch reaches the head.
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);
    ingestHistoryEvent(makeWorkflowTaskFailed(3, 1), true);
    ingestHistoryEvent(makeWorkflowTaskScheduled(1), true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });
});

// ---------------------------------------------------------------------------
// 13. getGroupArray — synchronous sorted group access
// ---------------------------------------------------------------------------

describe('getGroupArray', () => {
  it('returns groups sorted by eventId ascending', () => {
    reset(20);
    // Load in non-sequential order (simulates interleaved cursors)
    const [s2, st2, c2] = makeActivityGroup(4);
    const [s1, st1, c1] = makeActivityGroup(1);
    for (const e of [s2, st2, c2]) ingestHistoryEvent(e, false); // desc cursor
    for (const e of [s1, st1, c1]) ingestHistoryEvent(e, true); // asc cursor

    const groups = getGroupArray();
    expect(groups.length).toBe(2);
    expect(Number(groups[0].id)).toBeLessThan(Number(groups[1].id));
  });

  it('excludeWorkflowTasks filters WFT groups', () => {
    reset(20);
    for (const e of makeWorkflowTaskGroup(1)) ingestHistoryEvent(e, true);
    for (const e of makeActivityGroup(4)) ingestHistoryEvent(e, true);

    const all = getGroupArray();
    const noWft = getGroupArray({ excludeWorkflowTasks: true });
    expect(all.length).toBe(2);
    expect(noWft.length).toBe(1);
    expect(noWft[0].initialEvent.eventType).toBe('ActivityTaskScheduled');
  });

  it('is stable across multiple calls', () => {
    reset(10);
    for (const e of makeActivityGroup(1)) ingestHistoryEvent(e, true);

    const a = getGroupArray();
    const b = getGroupArray();
    expect(a.length).toBe(b.length);
    expect(a[0].id).toBe(b[0].id);
  });

  it('returns empty array when no groups loaded', () => {
    reset(10);
    ingestHistoryEvent(makeWorkflowStarted(1), true);
    expect(getGroupArray()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Pixi rendering layer — loading gap / indicator state
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ingestHistoryEvent — boolean return value (live-poll tight-loop fix)
//
// Regression: the live poll was firing thousands of requests because ingestion
// returned void, so the caller always called bufferVersion.update() even for
// duplicate events returned by the server. The fix: return true for genuinely
// new events, false for duplicates.
// ---------------------------------------------------------------------------

describe('ingestHistoryEvent boolean return', () => {
  beforeEach(() => {
    reset(10);
  });

  it('returns true for a genuinely new live event', () => {
    // Event 11 was never in the initial fetch — it is a new live event.
    const newEvent = makeWorkflowCompleted(11);
    expect(ingestHistoryEvent(newEvent, true)).toBe(true);
  });

  it('returns false when the same event is appended a second time (duplicate)', () => {
    const ev = makeWorkflowCompleted(11);
    ingestHistoryEvent(ev, true);
    // Second call with the same eventId must be a no-op.
    expect(ingestHistoryEvent(ev, true)).toBe(false);
  });

  it('returns false for a different object with the same eventId (duplicate by ID)', () => {
    const ev1 = makeWorkflowCompleted(11);
    const ev2 = makeWorkflowCompleted(11); // distinct object, same ID
    ingestHistoryEvent(ev1, true);
    expect(ingestHistoryEvent(ev2, true)).toBe(false);
  });

  it('returns false for a grouped event already seen in the initial fetch', () => {
    const group = makeActivityGroup(2); // eventIds 2, 3, 4
    reset(5);
    for (const e of group) ingestHistoryEvent(e, true);

    expect(ingestHistoryEvent(group[0], true)).toBe(false);
  });

  it('only returns true for grouped events that are actually new in a mixed batch', () => {
    // An activity group (events 1-3) stands in for the initial fetch's events.
    const existing = makeActivityGroup(1); // eventIds 1, 2, 3
    reset(6);
    for (const e of existing) ingestHistoryEvent(e, true);

    const newEv = makeActivityScheduled(4);
    const results = [...existing, newEv].map((e) =>
      ingestHistoryEvent(e, true),
    );

    // Events 1-3 were already ingested → all false
    expect(results.slice(0, 3).every((r) => r === false)).toBe(true);
    // Event 4 is genuinely new → true
    expect(results[3]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Concurrent live poll + bidirectional fetch
//
// The live poll starts at the same time as the bidirectional fetch so new
// events are captured immediately even when the initial load is slow. Both
// producers call ingestHistoryEvent, in either order, for overlapping events —
// the buffer must store each event exactly once.
// ---------------------------------------------------------------------------

describe('concurrent live poll and bidirectional fetch', () => {
  beforeEach(() => {
    reset(10);
  });

  it('events only in live poll (genuinely new) appear in getEventArray()', () => {
    // Bidirectional has not started — buffer is empty.
    // Live poll delivers a brand-new event (not in the initial fetch).
    const newEv = makeActivityScheduled(1);
    ingestHistoryEvent(newEv, true);

    const ids = getEventArray().map((e) => e.id);
    expect(ids).toContain('1');
  });

  it('an event delivered by both producers is not double-counted in getEventArray()', () => {
    const group = makeActivityGroup(2); // eventIds 2, 3, 4
    reset(5);

    // Live poll wins the race, then the bidirectional fetch redelivers.
    for (const ev of group) ingestHistoryEvent(ev, true);
    for (const ev of group) ingestHistoryEvent(ev, true);

    // getEventArray() must return each event exactly once.
    const allIds = getEventArray().map((e) => e.id);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);

    // The group's events must still be present.
    expect(unique.has('2')).toBe(true);
    expect(unique.has('3')).toBe(true);
    expect(unique.has('4')).toBe(true);
  });

  it.each([
    ['activity', () => makeActivityGroup(2)],
    ['timer', () => makeTimerGroup(2)],
    ['child workflow', () => makeChildWorkflowGroup(2)],
    ['workflow task', () => makeWorkflowTaskGroup(2)],
    ['update', () => makeWorkflowUpdateGroup(2)],
    ['nexus', () => makeNexusOperationGroup(2)],
  ])(
    'keeps live %s followers visible when bidirectional fetch later claims the head',
    (_, buildGroup) => {
      const group = buildGroup();
      reset(10);

      for (const ev of group) ingestHistoryEvent(ev, true);
      expect(getGroupArray()).toHaveLength(1);
      expect(getGroupArray()[0].eventList).toHaveLength(group.length);

      ingestHistoryEvent(group[0], true);

      const groups = getGroupArray();
      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe(group[0].eventId);
      expect(groups[0].eventList.map((event) => event.id)).toEqual(
        group.map((event) => event.eventId),
      );
    },
  );

  it.each([
    ['activity', () => makeActivityGroup(2)],
    ['timer', () => makeTimerGroup(2)],
    ['child workflow', () => makeChildWorkflowGroup(2)],
    ['workflow task', () => makeWorkflowTaskGroup(2)],
    ['update', () => makeWorkflowUpdateGroup(2)],
    ['nexus', () => makeNexusOperationGroup(2)],
  ])(
    'flushes live %s followers parked before the history head arrives',
    (_, buildGroup) => {
      const group = buildGroup();
      reset(10);

      for (const ev of group.slice(1)) ingestHistoryEvent(ev, true);
      expect(getGroupArray()).toHaveLength(0);

      ingestHistoryEvent(group[0], true);

      const groups = getGroupArray();
      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe(group[0].eventId);
      expect(groups[0].eventList.map((event) => event.id)).toEqual(
        group.map((event) => event.eventId),
      );
    },
  );

  it.each([
    ['activity', () => makeActivityGroup(2)],
    ['timer', () => makeTimerGroup(2)],
    ['child workflow', () => makeChildWorkflowGroup(2)],
    ['workflow task', () => makeWorkflowTaskGroup(2)],
    ['update', () => makeWorkflowUpdateGroup(2)],
    ['nexus', () => makeNexusOperationGroup(2)],
  ])(
    'attaches live %s followers to an existing history group head',
    (_, buildGroup) => {
      const group = buildGroup();
      reset(10);

      ingestHistoryEvent(group[0], true);
      for (const ev of group.slice(1)) ingestHistoryEvent(ev, true);

      const groups = getGroupArray();
      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe(group[0].eventId);
      expect(groups[0].eventList.map((event) => event.id)).toEqual(
        group.map((event) => event.eventId),
      );
    },
  );

  it('does not duplicate a far-ahead live follower when history later processes it', () => {
    reset(5);
    const scheduled = makeActivityScheduled(1);
    const started = makeActivityStarted(100, 1);

    ingestHistoryEvent(scheduled, true);
    expect(ingestHistoryEvent(started, true)).toBe(true);
    ingestHistoryEvent(started, true);

    const groups = getGroupArray();
    expect(groups).toHaveLength(1);
    expect(groups[0].eventList.map((event) => event.id)).toEqual(['1', '100']);
    expect(getEventArray().filter((event) => event.id === '100')).toHaveLength(
      1,
    );
  });

  it('new events from live poll remain after bidirectional fetch completes', () => {
    // Bidirectional loads events 1-6; live poll delivers event 7 (new).
    const existing = makeSyntheticEvents(6);
    reset(8);
    for (const ev of existing) ingestHistoryEvent(ev, true);

    const newEv = makeActivityScheduled(7);
    ingestHistoryEvent(newEv, true);

    const ids = getEventArray().map((e) => e.id);
    // Events 1-6 from bidirectional + event 7 from live poll.
    expect(ids).toContain('7');
    // Events from bidirectional still present.
    expect(ids).toContain('1');
  });

  it('live poll events that race with bidirectional do not cause duplicates across a full batch', () => {
    // Simulate: live poll delivers events 1-5 before the bidirectional fetch
    // has processed any of them. Then the bidirectional processes all 5.
    const events = makeSyntheticEvents(5);
    reset(5);

    // Live poll wins the race and ingests all 5 events.
    for (const ev of events) ingestHistoryEvent(ev, true);

    // Bidirectional catches up and redelivers the same 5 events.
    for (const ev of events) ingestHistoryEvent(ev, true);

    const allIds = getEventArray().map((e) => e.id);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
  });

  it('only genuinely new events report as added', () => {
    // When the bidirectional fetch has already loaded events 1-3,
    // a live-poll batch of [2 (dup), 3 (dup), 4 (new)] should count added=1.
    const group = makeActivityGroup(1); // eventIds 1, 2, 3
    reset(5);
    for (const ev of group) ingestHistoryEvent(ev, true);

    const results = [
      ingestHistoryEvent(group[0], true), // eventId 1 → duplicate → false
      ingestHistoryEvent(group[1], true), // eventId 2 → duplicate → false
      ingestHistoryEvent(group[2], true), // eventId 3 → duplicate → false
      ingestHistoryEvent(makeActivityScheduled(4), true), // new → true
    ];

    const added = results.filter(Boolean).length;
    expect(added).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Followers ingested before their head
//
// A follower can arrive before its head from either producer. Its group record
// is created immediately but has no head event, so the group stays out of
// getGroupArray() — nothing partial is ever rendered — and appears complete the
// moment the head lands, whichever order the remaining events came in.
// ---------------------------------------------------------------------------

describe('followers ingested before their head', () => {
  beforeEach(() => {
    reset(10);
  });

  it('follower before head: nothing visible in getGroupArray until head arrives', () => {
    const [, started] = makeActivityGroup(1);
    const before = getGroupArray().length;
    ingestHistoryEvent(started, true); // head not yet seen
    expect(getGroupArray().length).toBe(before); // no partial stub rendered
  });

  it('multiple followers before head: still nothing visible', () => {
    const [, started, completed] = makeActivityGroup(1);
    const before = getGroupArray().length;
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);
    expect(getGroupArray().length).toBe(before);
  });

  it('head last: group is complete with all followers', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);
    ingestHistoryEvent(scheduled, true); // head arrives last

    const groups = getGroupArray();
    const g = groups.find((g) => g.id === '1');
    expect(g).toBeDefined();
    expect(g?.eventList).toHaveLength(3);
    expect(g?.eventList.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('head first: later followers extend the group', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(scheduled, true); // head first
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(3);
  });

  it('head from the fetch cursor: earlier live followers are picked up', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);
    ingestHistoryEvent(scheduled, false); // head arrives from the desc cursor

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g).toBeDefined();
    expect(g?.eventList).toHaveLength(3);
    expect(g?.eventList.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('live follower extends a group whose head came from the fetch', () => {
    const [scheduled, started] = makeActivityGroup(1);
    ingestHistoryEvent(scheduled, false); // head from the fetch
    ingestHistoryEvent(started, true); // follower from the live poll

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(2);
    expect(g?.eventList[1].id).toBe('2');
  });

  it('no duplicate events when both producers deliver the same followers', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);
    ingestHistoryEvent(scheduled, true);
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);

    const allIds = getEventArray().map((e) => e.id);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
    expect(unique.has('1')).toBe(true);
    expect(unique.has('2')).toBe(true);
    expect(unique.has('3')).toBe(true);
  });

  it('duplicate calls for the same follower are ignored', () => {
    const [scheduled, started] = makeActivityGroup(1);
    ingestHistoryEvent(started, true);
    ingestHistoryEvent(started, true); // second call for same event
    ingestHistoryEvent(scheduled, true);

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(2); // not 3
  });
});

// ---------------------------------------------------------------------------
// 17. Group reference identity
//
// Group objects are derived and memoized on a per-group version, so identity is
// a pure function of content: any change a rendered view must see yields a new
// reference, and anything unchanged reads back as the same object. Consumers
// depend on both halves — the timeline row pool keys on group identity, so a
// missed swap leaves a completed activity rendering as in-progress, and a
// gratuitous swap re-renders every row on every poll.
// ---------------------------------------------------------------------------

describe('group reference identity', () => {
  beforeEach(() => {
    reset(10);
  });

  it('returns the identical reference for a group that has not changed', () => {
    ingestHistoryEvent(makeActivityScheduled(1, 'Act'), true);
    const first = getGroupArray()[0];

    ingestHistoryEvent(makeActivityScheduled(5, 'Other'), true);
    const second = getGroupArray().find((group) => group.id === '1');

    expect(second).toBe(first);
  });

  it('hands back a fresh reference when a live completion extends a group', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(scheduled, true);
    ingestHistoryEvent(started, true);

    const before = getGroupArray()[0];
    expect(before.eventList).toHaveLength(2);
    expect(before.finalClassification).toBe('Started');

    expect(ingestHistoryEvent(completed, true)).toBe(true);

    const after = getGroupArray()[0];
    expect(after).not.toBe(before);
    expect(after.eventList).toHaveLength(3);
    expect(after.finalClassification).toBe('Completed');
  });

  it('leaves the previous reference as an intact snapshot of the old state', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(scheduled, true);
    ingestHistoryEvent(started, true);
    const before = getGroupArray()[0];

    ingestHistoryEvent(completed, true);

    expect(before.eventList).toHaveLength(2);
    expect(before.finalClassification).toBe('Started');
  });

  it('hands back a fresh reference when enrich changes pending metadata', () => {
    ingestHistoryEvent(makeActivityScheduled(1, 'Act'), true);
    const before = getGroupArray()[0];

    enrichGroups(
      [
        { activityId: '1', state: 'Started', activityType: 'Act' },
      ] as Parameters<typeof enrichGroups>[0],
      [],
    );

    const after = getGroupArray()[0];
    expect(after).not.toBe(before);
    expect(after.pendingActivity).toBeDefined();
  });

  it('keeps references stable across repeated reads with no writes', () => {
    for (const event of makeActivityGroup(1)) ingestHistoryEvent(event, true);
    for (const event of makeTimerGroup(4)) ingestHistoryEvent(event, true);

    const first = getGroupArray();
    const second = getGroupArray();

    expect(second).toBe(first);
    expect(getGroupArray({ excludeWorkflowTasks: true })).toEqual(first);
  });

  it('swaps only the groups that changed', () => {
    for (const event of makeActivityGroup(1)) ingestHistoryEvent(event, true);
    const [scheduled, started, completed] = makeActivityGroup(4);
    ingestHistoryEvent(scheduled, true);
    ingestHistoryEvent(started, true);

    const before = getGroupArray();
    ingestHistoryEvent(completed, true);
    const after = getGroupArray();

    expect(after[0]).toBe(before[0]);
    expect(after[1]).not.toBe(before[1]);
  });
});

// ---------------------------------------------------------------------------
// 18. Arrival-order independence
//
// Pending metadata is applied when the group is built rather than written into
// it on arrival, so a terminal event and a stale pending entry resolve the same
// way regardless of which lands first.
// ---------------------------------------------------------------------------

describe('arrival-order independence', () => {
  const pending = [
    { activityId: '1', state: 'Started', activityType: 'Act' },
  ] as Parameters<typeof enrichGroups>[0];

  it('drops pending metadata when the completion arrives after enrich', () => {
    reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);
    ingestHistoryEvent(scheduled, true);
    enrichGroups(pending, []);
    expect(getGroupArray()[0].isPending).toBe(true);

    ingestHistoryEvent(started, true);
    ingestHistoryEvent(completed, true);

    const group = getGroupArray()[0];
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('drops pending metadata when enrich runs after the completion', () => {
    reset(10);
    for (const event of makeActivityGroup(1)) ingestHistoryEvent(event, true);
    enrichGroups(pending, []);

    const group = getGroupArray()[0];
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('groups events identically whichever cursor delivers them', () => {
    const group = makeActivityGroup(1);

    reset(10);
    for (const event of group) ingestHistoryEvent(event, true);
    const ascending = getGroupArray()[0];

    reset(10);
    for (const event of [...group].reverse()) ingestHistoryEvent(event, false);
    const descending = getGroupArray()[0];

    expect(descending.eventList.map((event) => event.id)).toEqual(
      ascending.eventList.map((event) => event.id),
    );
    expect(descending.timestamp).toBe(ascending.timestamp);
    expect(descending.finalClassification).toBe(ascending.finalClassification);
    expect(descending.billableActions).toBe(ascending.billableActions);
  });
});

// ---------------------------------------------------------------------------
// 19. Summary / group agreement
//
// Views filter and sort on GroupSummary but render a materialized EventGroup, so
// every getter on the record must agree with the same field on the group. A
// divergence would silently filter one set and draw another.
// ---------------------------------------------------------------------------

describe('summary and group agreement', () => {
  const cases: [string, (start: number) => HistoryEvent[]][] = [
    ['activity', (start) => makeActivityGroup(start)],
    ['activity timeout', (start) => makeActivityTimeoutGroup(start)],
    ['timer', (start) => makeTimerGroup(start)],
    ['child workflow', (start) => makeChildWorkflowGroup(start)],
    ['workflow task', (start) => makeWorkflowTaskGroup(start)],
    ['update', (start) => makeWorkflowUpdateGroup(start)],
    ['nexus', (start) => makeNexusOperationGroup(start)],
    ['local activity', (start) => makeLocalActivityGroup(start)],
  ];

  it.each(cases)('agrees for a complete %s group', (_, build) => {
    reset(20);
    for (const event of build(1)) ingestHistoryEvent(event, true);

    const [summary] = getGroupSummaries();
    const group = materializeGroup(summary);

    expect(summary.id).toBe(group.id);
    expect(summary.eventCount).toBe(group.eventList.length);
    expect(summary.initialEvent).toBe(group.initialEvent);
    expect(summary.lastEvent).toBe(group.lastEvent);
    expect(summary.category).toBe(group.category);
    expect(summary.classification).toBe(group.classification);
    expect(summary.finalClassification).toBe(group.finalClassification);
    expect(summary.isPending).toBe(group.isPending);
  });

  it.each(cases)('agrees for a partially loaded %s group', (_, build) => {
    reset(20);
    const events = build(1);
    // Head only — the state in which pending groups are rendered.
    ingestHistoryEvent(events[0], true);

    const [summary] = getGroupSummaries();
    const group = materializeGroup(summary);

    expect(summary.eventCount).toBe(group.eventList.length);
    expect(summary.lastEvent).toBe(group.lastEvent);
    expect(summary.finalClassification).toBe(group.finalClassification);
    expect(summary.isPending).toBe(group.isPending);
  });

  it('agrees on isPending once pending metadata is attached', () => {
    reset(10);
    ingestHistoryEvent(makeActivityScheduled(1, 'Act'), true);
    enrichGroups(
      [
        { activityId: '1', state: 'Started', activityType: 'Act' },
      ] as Parameters<typeof enrichGroups>[0],
      [],
    );

    const [summary] = getGroupSummaries();
    expect(summary.isPending).toBe(true);
    expect(summary.isPending).toBe(materializeGroup(summary).isPending);
  });

  it('exposes no summary for an event that heads no group', () => {
    reset(10);
    ingestHistoryEvent(makeWorkflowStarted(1), true);
    expect(getGroupSummaries()).toHaveLength(0);
    expect(getEventArray()).toHaveLength(1);
  });

  it('matches getGroupArray one-for-one', () => {
    reset(40);
    for (const event of makeSyntheticEventsWithWorkflowTasks(30)) {
      ingestHistoryEvent(event, true);
    }

    const summaries = getGroupSummaries({ excludeWorkflowTasks: true });
    const groups = getGroupArray({ excludeWorkflowTasks: true });

    expect(summaries.map((s) => s.id)).toEqual(groups.map((g) => g.id));
    expect(summaries.map(materializeGroup)).toEqual(groups);
  });

  it('passes an already-materialized group straight through', () => {
    reset(10);
    for (const event of makeActivityGroup(1)) ingestHistoryEvent(event, true);

    const group = materializeGroup(getGroupSummaries()[0]);
    // Views may be handed groups built outside the buffer, which already
    // satisfy GroupSummary — materializing one again must be a no-op.
    expect(materializeGroup(group)).toBe(group);
  });

  it('returns the identical group for an unchanged summary', () => {
    reset(10);
    for (const event of makeActivityGroup(1)) ingestHistoryEvent(event, true);

    const [summary] = getGroupSummaries();
    expect(materializeGroup(summary)).toBe(materializeGroup(summary));
  });
});
