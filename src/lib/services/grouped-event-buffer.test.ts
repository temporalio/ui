import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { groupEvents } from '$lib/models/event-groups';
import type { EventGroup } from '$lib/models/event-groups/event-groups';
import { toEvent, toEventHistory } from '$lib/models/event-history';
import type { HistoryEvent } from '$lib/types/events';

vi.mock('$lib/models/event-history', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('$lib/models/event-history')>();
  return { ...actual, toEvent: vi.fn(actual.toEvent) };
});

import {
  createGroupedEventBuffer,
  type GroupedEventBuffer,
  isWorkflowTaskGroup,
  type LazyGroup,
  materializeGroup,
} from './grouped-event-buffer';
import { SHARED_WITH_EVENT_GROUP } from './test-helpers/lazy-group-fields';
import {
  makeActivityGroup,
  makeActivityScheduled,
  makeActivityStarted,
  makeActivityTimedOut,
  makeActivityTimeoutGroup,
  makeChildWorkflowGroup,
  makeLocalActivityGroup,
  makeLocalActivityMarker,
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
  for (const e of events) buffer.ingestHistoryEvent(e);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let buffer: GroupedEventBuffer;

beforeEach(() => {
  buffer = createGroupedEventBuffer();
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
    buffer.reset(30);
    loadAll(events);

    const workflowEvents = toEventHistory(events);
    const expected = groupEvents(workflowEvents, 'ascending');
    const actual = buffer.getGroupArray();

    expect(actual.map((g) => g.id)).toEqual(expected.map((g) => g.id));
    expect(actual.map((g) => g.eventList.length)).toEqual(
      expected.map((g) => g.eventList.length),
    );
  });

  it('includes WorkflowTask groups when present', async () => {
    const events = makeSyntheticEventsWithWorkflowTasks(30);
    buffer.reset(30);
    loadAll(events);

    const actual = buffer.getGroupArray();
    const wftGroups = actual.filter(isWorkflowTaskGroup);
    expect(wftGroups.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Follower / head arrival ordering
// ---------------------------------------------------------------------------

describe('follower before head', () => {
  it('desc-cursor followers arriving before the asc-cursor head land in the group', () => {
    buffer.reset(10);
    const [head, started, completed] = makeActivityGroup(1);

    // Desc cursor delivers completed & started before head
    buffer.ingestHistoryEvent(completed);
    buffer.ingestHistoryEvent(started);
    expect(buffer.getGroupArray()).toHaveLength(0);

    // Asc cursor delivers the head
    buffer.ingestHistoryEvent(head);

    const groups = buffer.getGroupArray();
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
    buffer.reset(9);
    loadAll(initialEvents);

    const initialGroupCount = buffer.getGroupArray().length;
    expect(initialGroupCount).toBeGreaterThan(0);

    // New activity arrives at IDs 10-12
    const [newHead, newStarted, newCompleted] = makeActivityGroup(10);
    buffer.ingestHistoryEvent(newHead);
    buffer.ingestHistoryEvent(newStarted);
    buffer.ingestHistoryEvent(newCompleted);

    const groups = buffer.getGroupArray();
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
    buffer.reset(30);
    loadAll(events1);
    const firstGroupCount = buffer.getGroupArray().length;

    buffer.reset(15);
    const events2 = makeSyntheticEvents(15);
    loadAll(events2);

    // Pool was re-used — no double allocation
    expect(buffer.getGroupArray().length).toBeLessThanOrEqual(firstGroupCount);
    expect(buffer.getGroupArray().length).toBeGreaterThan(0);
  });

  it('groups from the previous workflow do not survive reset()', () => {
    buffer.reset(30);
    loadAll(makeSyntheticEvents(30));
    expect(buffer.getGroupArray().length).toBeGreaterThan(0);

    buffer.reset(9); // navigate away
    expect(buffer.getGroupArray()).toHaveLength(0);

    loadAll(makeSyntheticEvents(9));
    const ids = buffer.getGroupArray().map((group) => Number(group.id));
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
    buffer.reset(30);
    // Interleave WFT groups and activity groups to simulate a real workflow
    for (const e of makeWorkflowTaskGroup(1)) buffer.ingestHistoryEvent(e);
    for (const e of makeActivityGroup(4)) buffer.ingestHistoryEvent(e);
    for (const e of makeWorkflowTaskGroup(7)) buffer.ingestHistoryEvent(e);
    for (const e of makeActivityGroup(10)) buffer.ingestHistoryEvent(e);
    for (const e of makeWorkflowTaskGroup(13)) buffer.ingestHistoryEvent(e);

    const compactGroups = buffer.getGroupArray({ excludeWorkflowTasks: true });

    expect(compactGroups.every((g) => !isWorkflowTaskGroup(g))).toBe(true);
    expect(compactGroups).toHaveLength(2); // only the two activity groups
  });

  it('includes WFT groups in unfiltered output (for All events view)', () => {
    buffer.reset(20);
    for (const e of makeWorkflowTaskGroup(1)) buffer.ingestHistoryEvent(e);
    for (const e of makeActivityGroup(4)) buffer.ingestHistoryEvent(e);

    const allGroups = buffer.getGroupArray();
    const wftGroups = allGroups.filter(isWorkflowTaskGroup);

    expect(wftGroups.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 6. Boundary dedup (cursor overlap)
// ---------------------------------------------------------------------------

describe('boundary dedup', () => {
  it('write-once guard prevents double group registration for the same head slot', () => {
    buffer.reset(10);
    const [head] = makeActivityGroup(1);

    buffer.ingestHistoryEvent(head); // asc cursor
    buffer.ingestHistoryEvent(head); // desc cursor — same event, same slot

    expect(buffer.getGroupArray().length).toBe(1);
  });

  it('a redelivered head does not corrupt an already-built group', () => {
    buffer.reset(10);
    const [head, started, completed] = makeActivityGroup(1);

    buffer.ingestHistoryEvent(head);
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);

    // Simulate boundary overlap: desc cursor also writes the head
    buffer.ingestHistoryEvent(head);

    expect(buffer.getGroupArray()).toHaveLength(1);
    expect(buffer.getGroupArray()[0].eventList).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// 7. Solo event orphan cleanup
// ---------------------------------------------------------------------------

describe('solo event orphan cleanup', () => {
  it('WorkflowExecutionStarted is not registered as a group', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeWorkflowStarted(1));
    expect(buffer.getGroupArray().length).toBe(0);
  });

  it('WorkflowExecutionCompleted is not registered as a group', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeWorkflowCompleted(5));
    expect(buffer.getGroupArray().length).toBe(0);
  });

  it('followers of a solo head form no group but stay in the event list', () => {
    buffer.reset(10);

    // A follower that references slot 0 (eventId "1") as its head, where slot 0
    // turns out to be a WorkflowExecutionStarted — solo, not a group head.
    buffer.ingestHistoryEvent(makeActivityStarted(2, 1));
    buffer.ingestHistoryEvent(makeWorkflowStarted(1));

    expect(buffer.getGroupArray()).toHaveLength(0);
    expect(buffer.getEventArray().map((event) => event.id)).toEqual(['1', '2']);
  });
});

// ---------------------------------------------------------------------------
// 8. setFailedEvent (billableActions context)
// ---------------------------------------------------------------------------

describe('setFailedEvent', () => {
  it('can be set to null without error', () => {
    buffer.reset(10);
    buffer.setFailedEvent(null);
    expect(buffer.getGroupArray()).toHaveLength(0);
  });

  it('can be set to a HistoryEvent before ingestHistoryEvent calls', () => {
    buffer.reset(10);
    const events = makeSyntheticEvents(9);
    // Simulate desc first-page hook
    buffer.setFailedEvent(null);
    loadAll(events);
    expect(buffer.getGroupArray().length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 9. Marker billable-action dedup
//
// Several markers can share one workflow task, which bills once between them.
// Both cursors and the live poll ingest into the same buffer, so the order the
// markers land in must not change the total.
// ---------------------------------------------------------------------------

describe('marker billable actions', () => {
  const toEventSpy = vi.mocked(toEvent);

  const totalBillableActions = () =>
    buffer
      .getEventArray()
      .reduce((sum, event) => sum + (event.billableActions ?? 0), 0);

  // IDs 11-13, all emitted by the workflow task completed at event 10.
  const markers = [11, 12, 13].map((id) => makeLocalActivityMarker(id, 10));

  it('bills one workflow task once in ascending id order', () => {
    buffer.reset(20);
    for (const marker of markers) buffer.ingestHistoryEvent(marker);
    expect(totalBillableActions()).toBe(1);
  });

  it('bills one workflow task once in descending id order', () => {
    buffer.reset(20);
    for (const marker of markers.toReversed()) {
      buffer.ingestHistoryEvent(marker);
    }
    expect(totalBillableActions()).toBe(1);
  });

  it('bills one workflow task once when its markers interleave', () => {
    buffer.reset(20);
    buffer.ingestHistoryEvent(markers[2]);
    buffer.ingestHistoryEvent(markers[0]);
    buffer.ingestHistoryEvent(markers[1]);
    expect(totalBillableActions()).toBe(1);
  });

  it('bills distinct workflow tasks separately', () => {
    buffer.reset(20);
    buffer.ingestHistoryEvent(makeLocalActivityMarker(11, 10));
    buffer.ingestHistoryEvent(makeLocalActivityMarker(13, 12));
    expect(totalBillableActions()).toBe(2);
  });

  // Both cursors can deliver the same event. Conversion is what charges, so the
  // write-once guard has to reject a redelivery before toWorkflowEvent runs.
  it('converts a redelivered event once, so it bills once', () => {
    buffer.reset(20);
    toEventSpy.mockClear();
    const scheduled = makeActivityScheduled(1, 'Act');

    expect(buffer.ingestHistoryEvent(scheduled)).toBe(true);
    expect(buffer.ingestHistoryEvent(scheduled)).toBe(false);

    expect(toEventSpy).toHaveBeenCalledTimes(1);
    expect(totalBillableActions()).toBe(1);
  });

  it('converts a redelivered marker once, so its task stays charged', () => {
    buffer.reset(20);
    toEventSpy.mockClear();

    buffer.ingestHistoryEvent(markers[0]);
    buffer.ingestHistoryEvent(markers[0]);
    buffer.ingestHistoryEvent(markers[1]);

    expect(toEventSpy).toHaveBeenCalledTimes(2);
    expect(totalBillableActions()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 10. Heap size smoke test (skipped unless NODE_OPTIONS=--expose-gc)
// ---------------------------------------------------------------------------

describe('memory overhead smoke test', () => {
  it('heap growth for 50k events stays under 70MB', async () => {
    if (typeof globalThis.gc !== 'function') return; // skip without --expose-gc

    const events = makeSyntheticEvents(50_000);
    globalThis.gc();
    const before = process.memoryUsage().heapUsed;

    buffer.reset(50_000);
    loadAll(events);
    buffer.getGroupArray();

    globalThis.gc();
    const after = process.memoryUsage().heapUsed;
    const deltaMB = (after - before) / (1024 * 1024);

    // Log the actual number so it's visible in CI output
    console.log(`heap delta for 50k events: ${deltaMB.toFixed(1)} MB`);
    expect(deltaMB).toBeLessThan(70);
  });
});

// ---------------------------------------------------------------------------
// 11. Activity group integrity
// ---------------------------------------------------------------------------

describe('activity group integrity', () => {
  it('group has all 3 events when loaded ascending', async () => {
    buffer.reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(scheduled);
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);

    const [group] = buffer.getGroupArray();
    expect(group.eventList.length).toBe(3);
    expect(group.id).toBe('1');
  });

  it('group has all 3 events when followers arrive before head', async () => {
    buffer.reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);

    // Desc cursor delivers completion and start first
    buffer.ingestHistoryEvent(completed);
    buffer.ingestHistoryEvent(started);
    // Asc cursor delivers head
    buffer.ingestHistoryEvent(scheduled);

    const [group] = buffer.getGroupArray();
    expect(group.eventList.length).toBe(3);
  });

  it('eventList is sorted by event ID when desc cursor delivers Completed before Started', async () => {
    // Real-world scenario: descending cursor fetches events newest-first,
    // so ActivityTaskCompleted (higher ID) arrives before ActivityTaskStarted
    // (lower ID). insertEventById must keep the list in ascending ID order so
    // that isMiddleEvent, isConsecutiveGroup, and the detail panel all see
    // [Scheduled, Started, Completed] rather than [Scheduled, Completed, Started].
    buffer.reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);

    buffer.ingestHistoryEvent(scheduled); // asc cursor: head arrives first
    buffer.ingestHistoryEvent(completed); // desc cursor: Completed arrives before Started
    buffer.ingestHistoryEvent(started); // desc cursor: Started arrives last despite lower ID

    const [group] = buffer.getGroupArray();
    expect(group.eventList.map((e) => e.id)).toEqual([
      String(scheduled.eventId),
      String(started.eventId),
      String(completed.eventId),
    ]);
  });

  it('multiple groups maintain correct event membership', async () => {
    buffer.reset(20);
    const group1Events = makeActivityGroup(1);
    const group2Events = makeActivityGroup(4);
    const group3Events = makeTimerGroup(7);

    for (const e of [...group1Events, ...group2Events, ...group3Events]) {
      buffer.ingestHistoryEvent(e);
    }

    const groups = buffer.getGroupArray();
    expect(groups[0].eventList.length).toBe(3); // activity
    expect(groups[1].eventList.length).toBe(3); // activity
    expect(groups[2].eventList.length).toBe(2); // timer
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 12. setPendingMetadata — pending activity + nexus annotation
// ---------------------------------------------------------------------------

describe('setPendingMetadata', () => {
  it('sets pendingActivity on an in-flight activity group (1 event)', async () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));

    const pendingActivities = [
      { activityId: '1', state: 'Started', activityType: 'MyActivity' },
    ] as Parameters<typeof buffer.setPendingMetadata>[0];

    buffer.setPendingMetadata(pendingActivities, []);

    const [group] = buffer.getGroupArray();
    expect(group.pendingActivity).toBeDefined();
    expect(group.pendingActivity?.activityId).toBe('1');
  });

  it('swaps in a fresh group reference when pending state changes', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    const before = buffer.getGroupArray().find((g) => g.id === '1');

    buffer.setPendingMetadata(
      [
        { activityId: '1', state: 'Started', activityType: 'MyActivity' },
      ] as Parameters<typeof buffer.setPendingMetadata>[0],
      [],
    );

    const after = buffer.getGroupArray().find((g) => g.id === '1');
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
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    const pending = [
      { activityId: '1', state: 'Started', activityType: 'MyActivity' },
    ] as Parameters<typeof buffer.setPendingMetadata>[0];

    buffer.setPendingMetadata(pending, []);
    const first = buffer.getGroupArray().find((g) => g.id === '1');
    buffer.setPendingMetadata(pending, []);
    const second = buffer.getGroupArray().find((g) => g.id === '1');

    expect(second).toBe(first);
  });

  it('does not set pendingActivity on a completed activity group (3 events)', async () => {
    buffer.reset(10);
    const [s, st, c] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(s);
    buffer.ingestHistoryEvent(st);
    buffer.ingestHistoryEvent(c);

    const pendingActivities = [
      { activityId: '1', state: 'Started', activityType: 'TestActivity' },
    ] as Parameters<typeof buffer.setPendingMetadata>[0];

    buffer.setPendingMetadata(pendingActivities, []);

    const [group] = buffer.getGroupArray();
    expect(group.pendingActivity).toBeUndefined();
  });

  it('clears a previously set pendingActivity when no longer pending', async () => {
    buffer.reset(10);
    const [s, st, c] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(s);
    buffer.ingestHistoryEvent(st);
    buffer.ingestHistoryEvent(c);

    // First enrichment marks it pending
    const pa = [{ activityId: '1', state: 'Started' }] as Parameters<
      typeof buffer.setPendingMetadata
    >[0];
    buffer.setPendingMetadata(pa, []);

    // Second enrichment with empty array (activity completed server-side)
    buffer.setPendingMetadata([], []);

    const [group] = buffer.getGroupArray();
    expect(group.pendingActivity).toBeUndefined();
  });

  it('clears pendingActivity when live completion extends an existing group', async () => {
    buffer.reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(scheduled);
    buffer.ingestHistoryEvent(started);

    buffer.setPendingMetadata(
      [
        {
          activityId: '1',
          state: 'Started',
          activityType: 'TestActivity',
        },
      ] as Parameters<typeof buffer.setPendingMetadata>[0],
      [],
    );

    let [group] = buffer.getGroupArray();
    expect(group.pendingActivity).toBeDefined();
    expect(group.isPending).toBe(true);

    expect(buffer.ingestHistoryEvent(completed)).toBe(true);

    [group] = buffer.getGroupArray();
    expect(group.eventList).toHaveLength(3);
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('clears pendingActivity when a live timeout resolves a short activity group', async () => {
    buffer.reset(10);
    const [scheduled, timedOut] = makeActivityTimeoutGroup(1);
    buffer.ingestHistoryEvent(scheduled);

    buffer.setPendingMetadata(
      [
        {
          activityId: '1',
          state: 'Started',
          activityType: 'TestActivity',
        },
      ] as Parameters<typeof buffer.setPendingMetadata>[0],
      [],
    );

    let [group] = buffer.getGroupArray();
    expect(group.pendingActivity).toBeDefined();
    expect(group.isPending).toBe(true);

    expect(buffer.ingestHistoryEvent(timedOut)).toBe(true);

    [group] = buffer.getGroupArray();
    expect(group.eventList.map((event) => event.id)).toEqual(['1', '2']);
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('annotates live-only activity and nexus groups with pending metadata', () => {
    buffer.reset(20);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    buffer.ingestHistoryEvent(makeNexusOperationGroup(4)[0]);

    buffer.setPendingMetadata(
      [
        {
          activityId: '1',
          state: 'Started',
          activityType: 'MyActivity',
        },
      ] as Parameters<typeof buffer.setPendingMetadata>[0],
      [
        {
          scheduledEventId: '4',
        },
      ] as Parameters<typeof buffer.setPendingMetadata>[1],
    );

    const groups = buffer.getGroupArray();
    expect(
      groups.find((group) => group.id === '1')?.pendingActivity,
    ).toBeDefined();
    expect(
      groups.find((group) => group.id === '4')?.pendingNexusOperation,
    ).toBeDefined();
  });

  it('ignores activities not in the pending list', async () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    buffer.setPendingMetadata([], []);

    const [group] = buffer.getGroupArray();
    expect(group.pendingActivity).toBeUndefined();
  });

  it('does not touch non-activity groups', async () => {
    buffer.reset(10);
    const [ts, tf] = makeTimerGroup(1);
    buffer.ingestHistoryEvent(ts);
    buffer.ingestHistoryEvent(tf);

    buffer.setPendingMetadata(
      [{ activityId: '1', state: 'Started' }] as Parameters<
        typeof buffer.setPendingMetadata
      >[0],
      [],
    );

    const [group] = buffer.getGroupArray();
    expect(group.pendingActivity).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 13. getWorkflowTaskFailedEvent — derives active WFT failure from buffer
// ---------------------------------------------------------------------------

describe('getWorkflowTaskFailedEvent (buffer)', () => {
  it('returns undefined when no WFT groups exist', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1));
    expect(buffer.getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns undefined when WFT group completed normally', () => {
    buffer.reset(10);
    for (const e of makeWorkflowTaskGroup(1)) buffer.ingestHistoryEvent(e);
    expect(buffer.getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns the failed event when a WFT group has no subsequent completion', () => {
    buffer.reset(10);
    // WFT: Scheduled(1), Started(2), Failed(3)
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(2, 1));
    buffer.ingestHistoryEvent(makeWorkflowTaskFailed(3, 1));

    const failed = buffer.getWorkflowTaskFailedEvent();
    expect(failed).toBeDefined();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
  });

  it('returns undefined when a later WFT completed after the failure (workflow recovered)', () => {
    buffer.reset(20);
    // First WFT: fails
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(2, 1));
    buffer.ingestHistoryEvent(makeWorkflowTaskFailed(3, 1));
    // Second WFT: completes successfully (workflow recovered)
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(4));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(5, 4));
    buffer.ingestHistoryEvent(makeWorkflowTaskCompleted(6, 4));

    expect(buffer.getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns undefined for ResetWorkflow cause (not a real failure)', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(2, 1));
    buffer.ingestHistoryEvent(makeWorkflowTaskFailed(3, 1, 'ResetWorkflow'));

    expect(buffer.getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns the most recent failure when multiple WFT groups fail', () => {
    buffer.reset(20);
    // First WFT fails
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(2, 1));
    buffer.ingestHistoryEvent(makeWorkflowTaskFailed(3, 1));
    // Second WFT also fails (eventId 6 > 3)
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(4));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(5, 4));
    buffer.ingestHistoryEvent(makeWorkflowTaskFailed(6, 4));

    const failed = buffer.getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('6');
  });

  it('returns a WFT failure whose group arrives entirely via the live poll', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(2, 1));
    expect(buffer.getWorkflowTaskFailedEvent()).toBeUndefined();

    expect(buffer.ingestHistoryEvent(makeWorkflowTaskFailed(3, 1))).toBe(true);

    const failed = buffer.getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });

  it('returns a live WFT failure appended to a WFT head already in the pool', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(2, 1));
    expect(buffer.getWorkflowTaskFailedEvent()).toBeUndefined();

    expect(buffer.ingestHistoryEvent(makeWorkflowTaskFailed(3, 1))).toBe(true);

    const failed = buffer.getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });

  it('clears the WFT failure when a later WFT completes via the live poll', () => {
    buffer.reset(20);
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(2, 1));
    buffer.ingestHistoryEvent(makeWorkflowTaskFailed(3, 1));
    expect(buffer.getWorkflowTaskFailedEvent()?.id).toBe('3');

    // Workflow recovers: a new WFT completes, delivered live.
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(4));
    buffer.ingestHistoryEvent(makeWorkflowTaskStarted(5, 4));
    buffer.ingestHistoryEvent(makeWorkflowTaskCompleted(6, 4));

    expect(buffer.getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('does not double-count a live WFT group once the fetch claims its head', () => {
    buffer.reset(10);
    // Failure lands live first, then the bidirectional fetch reaches the head.
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));
    buffer.ingestHistoryEvent(makeWorkflowTaskFailed(3, 1));
    buffer.ingestHistoryEvent(makeWorkflowTaskScheduled(1));

    const failed = buffer.getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });
});

// ---------------------------------------------------------------------------
// 14. getGroupArray — synchronous sorted group access
// ---------------------------------------------------------------------------

describe('getGroupArray', () => {
  it('returns groups sorted by eventId ascending', () => {
    buffer.reset(20);
    // Load in non-sequential order (simulates interleaved cursors)
    const [s2, st2, c2] = makeActivityGroup(4);
    const [s1, st1, c1] = makeActivityGroup(1);
    for (const e of [s2, st2, c2]) buffer.ingestHistoryEvent(e); // desc cursor
    for (const e of [s1, st1, c1]) buffer.ingestHistoryEvent(e); // asc cursor

    const groups = buffer.getGroupArray();
    expect(groups.length).toBe(2);
    expect(Number(groups[0].id)).toBeLessThan(Number(groups[1].id));
  });

  it('excludeWorkflowTasks filters WFT groups', () => {
    buffer.reset(20);
    for (const e of makeWorkflowTaskGroup(1)) buffer.ingestHistoryEvent(e);
    for (const e of makeActivityGroup(4)) buffer.ingestHistoryEvent(e);

    const all = buffer.getGroupArray();
    const noWft = buffer.getGroupArray({ excludeWorkflowTasks: true });
    expect(all.length).toBe(2);
    expect(noWft.length).toBe(1);
    expect(noWft[0].initialEvent.eventType).toBe('ActivityTaskScheduled');
  });

  it('is stable across multiple calls', () => {
    buffer.reset(10);
    for (const e of makeActivityGroup(1)) buffer.ingestHistoryEvent(e);

    const a = buffer.getGroupArray();
    const b = buffer.getGroupArray();
    expect(a.length).toBe(b.length);
    expect(a[0].id).toBe(b[0].id);
  });

  it('returns empty array when no groups loaded', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeWorkflowStarted(1));
    expect(buffer.getGroupArray()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Pixi rendering layer — loading gap / indicator state
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ingestHistoryEvent — boolean return value (live-poll tight-loop fix)
//
// Regression: the live poll was firing thousands of requests because ingestion
// returned void, so the caller treated every response as progress even when the
// server redelivered events it already had.
// ---------------------------------------------------------------------------

describe('ingestHistoryEvent boolean return', () => {
  beforeEach(() => {
    buffer.reset(10);
  });

  it('returns true for a genuinely new live event', () => {
    // Event 11 was never in the initial fetch — it is a new live event.
    const newEvent = makeWorkflowCompleted(11);
    expect(buffer.ingestHistoryEvent(newEvent)).toBe(true);
  });

  it('returns false when the same event is appended a second time (duplicate)', () => {
    const ev = makeWorkflowCompleted(11);
    buffer.ingestHistoryEvent(ev);
    // Second call with the same eventId must be a no-op.
    expect(buffer.ingestHistoryEvent(ev)).toBe(false);
  });

  it('returns false for a different object with the same eventId (duplicate by ID)', () => {
    const ev1 = makeWorkflowCompleted(11);
    const ev2 = makeWorkflowCompleted(11); // distinct object, same ID
    buffer.ingestHistoryEvent(ev1);
    expect(buffer.ingestHistoryEvent(ev2)).toBe(false);
  });

  it('returns false for a grouped event already seen in the initial fetch', () => {
    const group = makeActivityGroup(2); // eventIds 2, 3, 4
    buffer.reset(5);
    for (const e of group) buffer.ingestHistoryEvent(e);

    expect(buffer.ingestHistoryEvent(group[0])).toBe(false);
  });

  it('only returns true for grouped events that are actually new in a mixed batch', () => {
    // An activity group (events 1-3) stands in for the initial fetch's events.
    const existing = makeActivityGroup(1); // eventIds 1, 2, 3
    buffer.reset(6);
    for (const e of existing) buffer.ingestHistoryEvent(e);

    const newEv = makeActivityScheduled(4);
    const results = [...existing, newEv].map((e) =>
      buffer.ingestHistoryEvent(e),
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
    buffer.reset(10);
  });

  it('events only in live poll (genuinely new) appear in getEventArray()', () => {
    // Bidirectional has not started — buffer is empty.
    // Live poll delivers a brand-new event (not in the initial fetch).
    const newEv = makeActivityScheduled(1);
    buffer.ingestHistoryEvent(newEv);

    const ids = buffer.getEventArray().map((e) => e.id);
    expect(ids).toContain('1');
  });

  it('an event delivered by both producers is not double-counted in getEventArray()', () => {
    const group = makeActivityGroup(2); // eventIds 2, 3, 4
    buffer.reset(5);

    // Live poll wins the race, then the bidirectional fetch redelivers.
    for (const ev of group) buffer.ingestHistoryEvent(ev);
    for (const ev of group) buffer.ingestHistoryEvent(ev);

    // getEventArray() must return each event exactly once.
    const allIds = buffer.getEventArray().map((e) => e.id);
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
      buffer.reset(10);

      for (const ev of group) buffer.ingestHistoryEvent(ev);
      expect(buffer.getGroupArray()).toHaveLength(1);
      expect(buffer.getGroupArray()[0].eventList).toHaveLength(group.length);

      buffer.ingestHistoryEvent(group[0]);

      const groups = buffer.getGroupArray();
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
      buffer.reset(10);

      for (const ev of group.slice(1)) buffer.ingestHistoryEvent(ev);
      expect(buffer.getGroupArray()).toHaveLength(0);

      buffer.ingestHistoryEvent(group[0]);

      const groups = buffer.getGroupArray();
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
      buffer.reset(10);

      buffer.ingestHistoryEvent(group[0]);
      for (const ev of group.slice(1)) buffer.ingestHistoryEvent(ev);

      const groups = buffer.getGroupArray();
      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe(group[0].eventId);
      expect(groups[0].eventList.map((event) => event.id)).toEqual(
        group.map((event) => event.eventId),
      );
    },
  );

  it('does not duplicate a far-ahead live follower when history later processes it', () => {
    buffer.reset(5);
    const scheduled = makeActivityScheduled(1);
    const started = makeActivityStarted(100, 1);

    buffer.ingestHistoryEvent(scheduled);
    expect(buffer.ingestHistoryEvent(started)).toBe(true);
    buffer.ingestHistoryEvent(started);

    const groups = buffer.getGroupArray();
    expect(groups).toHaveLength(1);
    expect(groups[0].eventList.map((event) => event.id)).toEqual(['1', '100']);
    expect(
      buffer.getEventArray().filter((event) => event.id === '100'),
    ).toHaveLength(1);
  });

  it('new events from live poll remain after bidirectional fetch completes', () => {
    // Bidirectional loads events 1-6; live poll delivers event 7 (new).
    const existing = makeSyntheticEvents(6);
    buffer.reset(8);
    for (const ev of existing) buffer.ingestHistoryEvent(ev);

    const newEv = makeActivityScheduled(7);
    buffer.ingestHistoryEvent(newEv);

    const ids = buffer.getEventArray().map((e) => e.id);
    // Events 1-6 from bidirectional + event 7 from live poll.
    expect(ids).toContain('7');
    // Events from bidirectional still present.
    expect(ids).toContain('1');
  });

  it('live poll events that race with bidirectional do not cause duplicates across a full batch', () => {
    // Simulate: live poll delivers events 1-5 before the bidirectional fetch
    // has processed any of them. Then the bidirectional processes all 5.
    const events = makeSyntheticEvents(5);
    buffer.reset(5);

    // Live poll wins the race and ingests all 5 events.
    for (const ev of events) buffer.ingestHistoryEvent(ev);

    // Bidirectional catches up and redelivers the same 5 events.
    for (const ev of events) buffer.ingestHistoryEvent(ev);

    const allIds = buffer.getEventArray().map((e) => e.id);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
  });

  it('only genuinely new events report as added', () => {
    // When the bidirectional fetch has already loaded events 1-3,
    // a live-poll batch of [2 (dup), 3 (dup), 4 (new)] should count added=1.
    const group = makeActivityGroup(1); // eventIds 1, 2, 3
    buffer.reset(5);
    for (const ev of group) buffer.ingestHistoryEvent(ev);

    const results = [
      buffer.ingestHistoryEvent(group[0]), // eventId 1 → duplicate → false
      buffer.ingestHistoryEvent(group[1]), // eventId 2 → duplicate → false
      buffer.ingestHistoryEvent(group[2]), // eventId 3 → duplicate → false
      buffer.ingestHistoryEvent(makeActivityScheduled(4)), // new → true
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
    buffer.reset(10);
  });

  it('follower before head: nothing visible in getGroupArray until head arrives', () => {
    const [, started] = makeActivityGroup(1);
    const before = buffer.getGroupArray().length;
    buffer.ingestHistoryEvent(started); // head not yet seen
    expect(buffer.getGroupArray().length).toBe(before); // no partial stub rendered
  });

  it('multiple followers before head: still nothing visible', () => {
    const [, started, completed] = makeActivityGroup(1);
    const before = buffer.getGroupArray().length;
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);
    expect(buffer.getGroupArray().length).toBe(before);
  });

  it('head last: group is complete with all followers', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);
    buffer.ingestHistoryEvent(scheduled); // head arrives last

    const groups = buffer.getGroupArray();
    const g = groups.find((g) => g.id === '1');
    expect(g).toBeDefined();
    expect(g?.eventList).toHaveLength(3);
    expect(g?.eventList.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('head first: later followers extend the group', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(scheduled); // head first
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);

    const g = buffer.getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(3);
  });

  it('head from the fetch cursor: earlier live followers are picked up', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);
    buffer.ingestHistoryEvent(scheduled); // head arrives from the desc cursor

    const g = buffer.getGroupArray().find((g) => g.id === '1');
    expect(g).toBeDefined();
    expect(g?.eventList).toHaveLength(3);
    expect(g?.eventList.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('live follower extends a group whose head came from the fetch', () => {
    const [scheduled, started] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(scheduled); // head from the fetch
    buffer.ingestHistoryEvent(started); // follower from the live poll

    const g = buffer.getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(2);
    expect(g?.eventList[1].id).toBe('2');
  });

  it('no duplicate events when both producers deliver the same followers', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);
    buffer.ingestHistoryEvent(scheduled);
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);

    const allIds = buffer.getEventArray().map((e) => e.id);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
    expect(unique.has('1')).toBe(true);
    expect(unique.has('2')).toBe(true);
    expect(unique.has('3')).toBe(true);
  });

  it('duplicate calls for the same follower are ignored', () => {
    const [scheduled, started] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(started); // second call for same event
    buffer.ingestHistoryEvent(scheduled);

    const g = buffer.getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(2); // not 3
  });
});

// ---------------------------------------------------------------------------
// 15. Group reference identity
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
    buffer.reset(10);
  });

  it('returns the identical reference for a group that has not changed', () => {
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'Act'));
    const first = buffer.getGroupArray()[0];

    buffer.ingestHistoryEvent(makeActivityScheduled(5, 'Other'));
    const second = buffer.getGroupArray().find((group) => group.id === '1');

    expect(second).toBe(first);
  });

  it('hands back a fresh reference when a live completion extends a group', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(scheduled);
    buffer.ingestHistoryEvent(started);

    const before = buffer.getGroupArray()[0];
    expect(before.eventList).toHaveLength(2);
    expect(before.finalClassification).toBe('Started');

    expect(buffer.ingestHistoryEvent(completed)).toBe(true);

    const after = buffer.getGroupArray()[0];
    expect(after).not.toBe(before);
    expect(after.eventList).toHaveLength(3);
    expect(after.finalClassification).toBe('Completed');
  });

  it('leaves the previous reference as an intact snapshot of the old state', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(scheduled);
    buffer.ingestHistoryEvent(started);
    const before = buffer.getGroupArray()[0];

    buffer.ingestHistoryEvent(completed);

    expect(before.eventList).toHaveLength(2);
    expect(before.finalClassification).toBe('Started');
  });

  it('hands back a fresh reference when enrich changes pending metadata', () => {
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'Act'));
    const before = buffer.getGroupArray()[0];

    buffer.setPendingMetadata(
      [
        { activityId: '1', state: 'Started', activityType: 'Act' },
      ] as Parameters<typeof buffer.setPendingMetadata>[0],
      [],
    );

    const after = buffer.getGroupArray()[0];
    expect(after).not.toBe(before);
    expect(after.pendingActivity).toBeDefined();
  });

  it('keeps references stable across repeated reads with no writes', () => {
    for (const event of makeActivityGroup(1)) buffer.ingestHistoryEvent(event);
    for (const event of makeTimerGroup(4)) buffer.ingestHistoryEvent(event);

    const first = buffer.getGroupArray();
    const second = buffer.getGroupArray();

    expect(second).toBe(first);
    expect(buffer.getGroupArray({ excludeWorkflowTasks: true })).toEqual(first);
  });

  it('swaps only the groups that changed', () => {
    for (const event of makeActivityGroup(1)) buffer.ingestHistoryEvent(event);
    const [scheduled, started, completed] = makeActivityGroup(4);
    buffer.ingestHistoryEvent(scheduled);
    buffer.ingestHistoryEvent(started);

    const before = buffer.getGroupArray();
    buffer.ingestHistoryEvent(completed);
    const after = buffer.getGroupArray();

    expect(after[0]).toBe(before[0]);
    expect(after[1]).not.toBe(before[1]);
  });
});

// ---------------------------------------------------------------------------
// 16. Arrival-order independence
//
// Pending metadata is applied when the group is built rather than written into
// it on arrival, so a terminal event and a stale pending entry resolve the same
// way regardless of which lands first.
// ---------------------------------------------------------------------------

describe('arrival-order independence', () => {
  const pending = [
    { activityId: '1', state: 'Started', activityType: 'Act' },
  ] as Parameters<typeof buffer.setPendingMetadata>[0];

  it('drops pending metadata when the completion arrives after enrich', () => {
    buffer.reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(scheduled);
    buffer.setPendingMetadata(pending, []);
    expect(buffer.getGroupArray()[0].isPending).toBe(true);

    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);

    const group = buffer.getGroupArray()[0];
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('applies pending metadata to a head that arrives afterwards', () => {
    buffer.reset(10);
    // The run refresh can list an activity before its ActivityTaskScheduled has
    // been ingested; the buffer holds the metadata and applies it on arrival.
    buffer.setPendingMetadata(pending, []);
    expect(buffer.getLazyGroups()).toHaveLength(0);

    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'Act'));

    const [lazy] = buffer.getLazyGroups();
    expect(lazy.pendingActivity).toBeDefined();
    expect(lazy.isPending).toBe(true);
    expect(materializeGroup(lazy).isPending).toBe(true);
  });

  // Sorting reads the lazy value and the row renders the materialized one, so a
  // disagreement hoists a finished activity to the top. Nothing re-enriches
  // here on purpose — a closed run stops refreshing.
  it('agrees on isPending when the completion lands after the metadata', () => {
    buffer.reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);

    buffer.ingestHistoryEvent(scheduled);
    buffer.setPendingMetadata(pending, []);
    expect(buffer.getLazyGroups()[0].isPending).toBe(true);

    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);

    const [lazy] = buffer.getLazyGroups();
    expect(lazy.isPending).toBe(false);
    expect(lazy.isPending).toBe(materializeGroup(lazy).isPending);
    expect(lazy.pendingActivity).toBeUndefined();
  });

  it('ignores a stale pending entry for an already-completed activity', () => {
    buffer.reset(10);
    for (const event of makeActivityGroup(1)) buffer.ingestHistoryEvent(event);
    // The run still lists it — the history says otherwise and wins.
    buffer.setPendingMetadata(pending, []);

    const [lazy] = buffer.getLazyGroups();
    expect(lazy.isPending).toBe(false);
    expect(materializeGroup(lazy).isPending).toBe(false);
  });

  it('drops pending metadata when enrich runs after the completion', () => {
    buffer.reset(10);
    for (const event of makeActivityGroup(1)) buffer.ingestHistoryEvent(event);
    buffer.setPendingMetadata(pending, []);

    const group = buffer.getGroupArray()[0];
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  // Ported from #3787, where it guarded a stale local reference during the
  // park-and-flush. There is no parking here, but the behaviour it asserts —
  // followers landing before their head still produce the right failure state —
  // is the same guarantee.
  it('keeps a timed-out activity failed when its head arrives last', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityStarted(2, 1));
    buffer.ingestHistoryEvent(makeActivityTimedOut(3, 1));
    buffer.ingestHistoryEvent(makeActivityScheduled(1));

    const [lazy] = buffer.getLazyGroups();
    const group = materializeGroup(lazy);
    expect(group.eventList.map((event) => event.id)).toEqual(['1', '2', '3']);
    expect(group.isFailureOrTimedOut).toBe(true);
    expect(lazy.finalClassification).toBe('TimedOut');
  });

  it('groups events identically whichever cursor delivers them', () => {
    const group = makeActivityGroup(1);

    buffer.reset(10);
    for (const event of group) buffer.ingestHistoryEvent(event);
    const ascending = buffer.getGroupArray()[0];

    buffer.reset(10);
    for (const event of group.toReversed()) buffer.ingestHistoryEvent(event);
    const descending = buffer.getGroupArray()[0];

    expect(descending.eventList.map((event) => event.id)).toEqual(
      ascending.eventList.map((event) => event.id),
    );
    expect(descending.timestamp).toBe(ascending.timestamp);
    expect(descending.finalClassification).toBe(ascending.finalClassification);
    expect(descending.billableActions).toBe(ascending.billableActions);
  });
});

// ---------------------------------------------------------------------------
// 17. Lazy / materialized group agreement
//
// Views filter and sort on LazyGroup but render a materialized EventGroup, so
// every getter on the record must agree with the same field on the group. A
// divergence would silently filter one set and draw another.
// ---------------------------------------------------------------------------

const SHARED_FIELDS = Object.entries(SHARED_WITH_EVENT_GROUP)
  .filter(([, shared]) => shared)
  .map(([field]) => field) as (keyof LazyGroup & keyof EventGroup)[];

describe('lazy and materialized group agreement', () => {
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

  // Every prefix, not just the complete group: the fetch renders groups from
  // their head onwards, so the partially loaded states are real.
  it.each(cases)('agrees at every prefix of a %s group', (_, build) => {
    const events = build(1);

    for (let count = 1; count <= events.length; count++) {
      buffer.reset(20);
      for (const event of events.slice(0, count)) {
        buffer.ingestHistoryEvent(event);
      }

      const [lazy] = buffer.getLazyGroups();
      const group = materializeGroup(lazy);

      for (const field of SHARED_FIELDS) {
        expect(
          lazy[field],
          `${field} disagreed with ${count} of ${events.length} events loaded`,
        ).toBe(group[field]);
      }
      expect(lazy.eventCount).toBe(count);
    }
  });

  it('agrees on isPending once pending metadata is attached', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'Act'));
    buffer.setPendingMetadata(
      [
        { activityId: '1', state: 'Started', activityType: 'Act' },
      ] as Parameters<typeof buffer.setPendingMetadata>[0],
      [],
    );

    const [lazy] = buffer.getLazyGroups();
    expect(lazy.isPending).toBe(true);
    expect(lazy.isPending).toBe(materializeGroup(lazy).isPending);
  });

  it('exposes no lazy for an event that heads no group', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeWorkflowStarted(1));
    expect(buffer.getLazyGroups()).toHaveLength(0);
    expect(buffer.getEventArray()).toHaveLength(1);
  });

  it('matches getGroupArray one-for-one', () => {
    buffer.reset(40);
    for (const event of makeSyntheticEventsWithWorkflowTasks(30)) {
      buffer.ingestHistoryEvent(event);
    }

    const lazyGroups = buffer.getLazyGroups({ excludeWorkflowTasks: true });
    const groups = buffer.getGroupArray({ excludeWorkflowTasks: true });

    expect(lazyGroups.map((lazy) => lazy.id)).toEqual(groups.map((g) => g.id));
    expect(lazyGroups.map(materializeGroup)).toEqual(groups);
  });

  it('passes an already-materialized group straight through', () => {
    buffer.reset(10);
    for (const event of makeActivityGroup(1)) buffer.ingestHistoryEvent(event);

    const group = materializeGroup(buffer.getLazyGroups()[0]);
    // Views may be handed groups built outside the buffer, which already
    // satisfy LazyGroup — materializing one again must be a no-op.
    expect(materializeGroup(group)).toBe(group);
  });

  it('returns the identical group for an unchanged lazy', () => {
    buffer.reset(10);
    for (const event of makeActivityGroup(1)) buffer.ingestHistoryEvent(event);

    const [lazy] = buffer.getLazyGroups();
    expect(materializeGroup(lazy)).toBe(materializeGroup(lazy));
  });
});

describe('getPendingActivityScheduledEvent', () => {
  const pending = (overrides: Record<string, unknown> = {}) =>
    [
      {
        activityId: '1',
        state: 'Started',
        activityType: 'MyActivity',
        ...overrides,
      },
    ] as Parameters<typeof buffer.setPendingMetadata>[0];

  it('returns the head event of a pending activity group', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    buffer.setPendingMetadata(pending(), []);

    const scheduled = buffer.getPendingActivityScheduledEvent('1');
    expect(scheduled?.id).toBe('1');
    expect(scheduled?.eventType).toBe('ActivityTaskScheduled');
  });

  it('is undefined until the head event is ingested', () => {
    buffer.reset(10);
    buffer.setPendingMetadata(pending(), []);
    expect(buffer.getPendingActivityScheduledEvent('1')).toBeUndefined();

    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    expect(buffer.getPendingActivityScheduledEvent('1')?.id).toBe('1');
  });

  it('is undefined for an activity the history has resolved', () => {
    buffer.reset(10);
    const [scheduled, timedOut] = makeActivityTimeoutGroup(1);
    buffer.ingestHistoryEvent(scheduled);
    buffer.setPendingMetadata(pending(), []);
    expect(buffer.getPendingActivityScheduledEvent('1')).toBeDefined();

    buffer.ingestHistoryEvent(timedOut);
    expect(buffer.getPendingActivityScheduledEvent('1')).toBeUndefined();
  });

  it('is undefined once the activity is no longer pending', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    buffer.setPendingMetadata(pending(), []);
    buffer.setPendingMetadata([], []);

    expect(buffer.getPendingActivityScheduledEvent('1')).toBeUndefined();
  });

  it('is cleared by reset', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    buffer.setPendingMetadata(pending(), []);

    buffer.reset(10);
    expect(buffer.getPendingActivityScheduledEvent('1')).toBeUndefined();
  });

  it('bumps the lazy group version without changing its identity when only the options change', () => {
    buffer.reset(10);
    buffer.ingestHistoryEvent(makeActivityScheduled(1, 'MyActivity'));
    buffer.setPendingMetadata(
      pending({ activityOptions: { retryPolicy: { maximumAttempts: 3 } } }),
      [],
    );

    const [lazyBefore] = buffer.getLazyGroups();
    const versionBefore = lazyBefore.version;
    const groupBefore = materializeGroup(lazyBefore);

    buffer.setPendingMetadata(
      pending({ activityOptions: { retryPolicy: { maximumAttempts: 10 } } }),
      [],
    );

    const [lazyAfter] = buffer.getLazyGroups();
    // The record identity is stable for the life of the run, so consumers that
    // derive off the lazy group alone must compare version, not reference.
    expect(lazyAfter).toBe(lazyBefore);
    expect(lazyAfter.version).toBeGreaterThan(versionBefore);
    expect(materializeGroup(lazyAfter)).not.toBe(groupBefore);
    expect(
      materializeGroup(lazyAfter).pendingActivity?.activityOptions?.retryPolicy
        ?.maximumAttempts,
    ).toBe(10);
  });
});

describe('event group labels', () => {
  const label = {
    metadata: { encoding: btoa('json/plain') },
    data: btoa(JSON.stringify('Checkout')),
  };
  const withMarker = (
    event: HistoryEvent,
    marker: { id: string; label?: typeof label },
  ) =>
    ({
      ...event,
      eventGroupMarkers: [{ label: marker }],
    }) as unknown as HistoryEvent;

  it('resolves a label from an event ingested later', () => {
    const [started, fired] = makeTimerGroup(1);
    buffer.ingestHistoryEvent(withMarker(fired, { id: 'group-1' }));
    buffer.ingestHistoryEvent(withMarker(started, { id: 'group-1', label }));

    expect(buffer.getEventArray().map((event) => event.eventGroups)).toEqual([
      [{ key: 'label:group-1', kind: 'label', id: 'group-1', label }],
      [{ key: 'label:group-1', kind: 'label', id: 'group-1', label }],
    ]);
  });

  it('does not carry labels across a reset', () => {
    const [started, fired] = makeTimerGroup(1);
    buffer.ingestHistoryEvent(withMarker(started, { id: 'group-1', label }));

    buffer.reset(0);
    buffer.ingestHistoryEvent(withMarker(fired, { id: 'group-1' }));

    expect(buffer.getEventArray()[0].eventGroups).toEqual([
      { key: 'label:group-1', kind: 'label', id: 'group-1' },
    ]);
  });
});

describe('event group index', () => {
  const marker = (id: string) => ({ label: { id } });
  const withMarkers = (
    event: HistoryEvent,
    eventGroupMarkers: { label: { id: string } }[],
  ) => ({ ...event, eventGroupMarkers }) as unknown as HistoryEvent;

  it('lists event groups in order of their first event with event counts', () => {
    const [scheduled, started, completed] = makeActivityGroup(5);
    const [timerStarted, timerFired] = makeTimerGroup(1);
    buffer.ingestHistoryEvent(
      withMarkers(scheduled, [marker('b'), marker('a')]),
    );
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);
    buffer.ingestHistoryEvent(withMarkers(timerStarted, [marker('a')]));
    buffer.ingestHistoryEvent(timerFired);

    expect(
      buffer
        .getEventGroupOptions()
        .map(({ group, eventCount, firstEventId }) => ({
          key: group.key,
          eventCount,
          firstEventId,
        })),
    ).toEqual([
      { key: 'label:a', eventCount: 2, firstEventId: 1 },
      { key: 'label:b', eventCount: 1, firstEventId: 5 },
    ]);
  });

  it('matches whole lifecycle groups that contain a marked event', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    const [timerStarted, timerFired] = makeTimerGroup(4);
    buffer.ingestHistoryEvent(withMarkers(scheduled, [marker('a')]));
    buffer.ingestHistoryEvent(started);
    buffer.ingestHistoryEvent(completed);
    buffer.ingestHistoryEvent(timerStarted);
    buffer.ingestHistoryEvent(timerFired);

    const matcher = buffer.getEventGroupMatcher(['label:a'])!;

    expect(matcher.hasGroup('1')).toBe(true);
    expect(matcher.hasGroup('4')).toBe(false);
    expect(
      buffer
        .getEventArray()
        .filter((event) => matcher.hasEvent(event))
        .map(({ id }) => id),
    ).toEqual(['1', '2', '3']);
  });

  it('matches any of the selected event groups', () => {
    const [timerStarted, timerFired] = makeTimerGroup(1);
    const [otherStarted, otherFired] = makeTimerGroup(3);
    buffer.ingestHistoryEvent(withMarkers(timerStarted, [marker('a')]));
    buffer.ingestHistoryEvent(timerFired);
    buffer.ingestHistoryEvent(withMarkers(otherStarted, [marker('b')]));
    buffer.ingestHistoryEvent(otherFired);

    const matcher = buffer.getEventGroupMatcher(['label:a', 'label:b'])!;

    expect(matcher.hasGroup('1')).toBe(true);
    expect(matcher.hasGroup('3')).toBe(true);
  });

  it('ignores selected keys that are not in the run', () => {
    const [timerStarted, timerFired] = makeTimerGroup(1);
    buffer.ingestHistoryEvent(withMarkers(timerStarted, [marker('a')]));
    buffer.ingestHistoryEvent(timerFired);

    expect(buffer.getEventGroupMatcher(['label:missing'])).toBeUndefined();
    expect(buffer.getEventGroupMatcher([])).toBeUndefined();
    expect(
      buffer.getEventGroupMatcher(['label:missing', 'label:a'])?.hasGroup('1'),
    ).toBe(true);
  });

  it('indexes events that arrive before their lifecycle group head', () => {
    const [timerStarted, timerFired] = makeTimerGroup(1);
    buffer.ingestHistoryEvent(withMarkers(timerFired, [marker('a')]));
    buffer.ingestHistoryEvent(timerStarted);

    expect(buffer.getEventGroupMatcher(['label:a'])?.hasGroup('1')).toBe(true);
  });

  it('clears the index on reset', () => {
    const [timerStarted] = makeTimerGroup(1);
    buffer.ingestHistoryEvent(withMarkers(timerStarted, [marker('a')]));

    buffer.reset(0);

    expect(buffer.getEventGroupOptions()).toEqual([]);
    expect(buffer.getEventGroupMatcher(['label:a'])).toBeUndefined();
  });
});
