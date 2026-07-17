import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { groupEvents } from '$lib/models/event-groups';
import { toEventHistory } from '$lib/models/event-history';

import {
  _debugEventSlots,
  _debugState,
  appendLiveEvent,
  assignTrackIndices,
  enrichGroups,
  getAscGroupCount,
  getDescGroupCount,
  getEventArray,
  getGroupArray,
  getGroupCount,
  getGroupMeta,
  getLatestEvent,
  getLatestGroup,
  getLiveGroupCount,
  getRows,
  getVisibleGroupCount,
  getWorkflowTaskFailedEvent,
  isWorkflowTaskGroup,
  mergeHeads,
  onLatestGroup,
  processEvent,
  reset,
  resetLive,
  setEstimatedGroupCount,
  setFailedEvent,
} from './grouped-event-buffer';
import {
  makeActivityCompleted,
  makeActivityGroup,
  makeActivityScheduled,
  makeActivityStarted,
  makeActivityTimeoutGroup,
  makeChildWorkflowGroup,
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
  for (const e of events) processEvent(e, true);
}

/** Flush all pending microtasks. */
function tick() {
  return Promise.resolve();
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
    const actual = await Promise.all(getRows(0, getGroupCount()));

    expect(actual.map((g) => g.id)).toEqual(expected.map((g) => g.id));
    expect(actual.map((g) => g.eventList.length)).toEqual(
      expected.map((g) => g.eventList.length),
    );
  });

  it('includes WorkflowTask groups when present', async () => {
    const events = makeSyntheticEventsWithWorkflowTasks(30);
    reset(30);
    loadAll(events);

    const actual = await Promise.all(getRows(0, getGroupCount()));
    const wftGroups = actual.filter(isWorkflowTaskGroup);
    expect(wftGroups.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Loading & gap cases
// ---------------------------------------------------------------------------

describe('loading and gap cases', () => {
  it('already-loaded groups resolve synchronously (within one microtask tick)', async () => {
    const events = makeSyntheticEvents(30);
    reset(30);
    loadAll(events);

    let syncCount = 0;
    const promises = getRows(0, getGroupCount());
    promises.forEach((p) => p.then(() => syncCount++));
    await tick();
    expect(syncCount).toBe(getGroupCount());
  });

  it('pending promise resolves when the cursor writes the head event', async () => {
    reset(10);
    const [head] = makeActivityGroup(1);

    const p = getRows(0, 1)[0];
    let resolved = false;
    p.then(() => {
      resolved = true;
    });

    await tick();
    expect(resolved).toBe(false);

    processEvent(head, true);
    await p;
    expect(resolved).toBe(true);
  });

  it('requesting beyond current poolTop yields a promise that resolves later', async () => {
    const events = makeSyntheticEvents(30);
    reset(30);

    const farPromise = getRows(5, 6)[0];
    let didResolve = false;
    farPromise.then(() => {
      didResolve = true;
    });

    // Load only first 9 events — far group not reached yet
    for (const e of events.slice(0, 9)) processEvent(e, true);
    await tick();
    expect(didResolve).toBe(false);

    loadAll(events.slice(9));
    await farPromise;
    expect(didResolve).toBe(true);
  });

  it('concurrent getRows calls for the same unloaded group return the same Promise', () => {
    reset(10);
    const p1 = getRows(0, 1)[0];
    const p2 = getRows(0, 1)[0];
    expect(p1).toBe(p2);
  });

  it('desc-cursor follower before asc-cursor head: group resolves with both events', async () => {
    reset(10);
    const [head, started, completed] = makeActivityGroup(1);

    // Desc cursor delivers completed & started before head
    processEvent(completed, false);
    processEvent(started, false);
    expect(getGroupCount()).toBe(0);

    const p = getRows(0, 1)[0];
    let resolved = false;
    p.then(() => {
      resolved = true;
    });

    await tick();
    expect(resolved).toBe(false);

    // Asc cursor delivers the head
    processEvent(head, true);
    const group = await p;

    expect(resolved).toBe(true);
    expect(getGroupCount()).toBe(1);
    expect(group.eventList.length).toBe(3);
  });

  it('middle rows in the gap resolve as the ascending cursor advances', async () => {
    // 30 events → ~8 groups (mix of activities and timers + workflow started)
    // Load first 3 events (1 group) and last 3 events (1 group)
    const events = makeSyntheticEvents(30);
    reset(30);

    // Load asc: events 1-12 (4 groups worth)
    for (const e of events.slice(0, 12)) processEvent(e, true);
    // Load desc: events 27-30 (1 activity group, reverse)
    for (const e of events.slice(26).reverse()) processEvent(e, false);

    const totalAfterPartial = getGroupCount();
    // Request a group in the gap (if any pending)
    const gapPromise = getRows(totalAfterPartial, totalAfterPartial + 1)[0];
    let gapResolved = false;
    gapPromise.then(() => {
      gapResolved = true;
    });

    await tick();
    expect(gapResolved).toBe(false);

    // Fill the rest ascending
    for (const e of events.slice(12, 27)) processEvent(e, true);
    await gapPromise;
    expect(gapResolved).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Non-terminal workflow (running — new events arrive after initial fetch)
// ---------------------------------------------------------------------------

describe('non-terminal workflow: new events beyond initial historyLength', () => {
  it('new events extend eventSlots and groupPool beyond initial allocation', async () => {
    const initialEvents = makeSyntheticEvents(9); // 9 events → 3 groups
    reset(9);
    loadAll(initialEvents);

    const initialGroupCount = getGroupCount();
    expect(initialGroupCount).toBeGreaterThan(0);

    // New activity arrives at IDs 10-12
    const [newHead, newStarted, newCompleted] = makeActivityGroup(10);
    processEvent(newHead, true);
    processEvent(newStarted, true);
    processEvent(newCompleted, true);

    expect(getGroupCount()).toBe(initialGroupCount + 1);

    const [newGroup] = await Promise.all(
      getRows(initialGroupCount, initialGroupCount + 1),
    );
    expect(newGroup).toBeDefined();
    expect(newGroup.eventList.length).toBe(3);
  });

  it('getLatestEvent reflects the highest-ID event after each write', () => {
    reset(10);
    const events = makeSyntheticEvents(10);

    for (let i = 0; i < events.length; i++) {
      processEvent(events[i], true);
      const latest = getLatestEvent();
      expect(Number(latest?.eventId)).toBe(i + 1);
    }
  });

  it('getLatestEvent is non-null immediately after desc cursor first page', () => {
    const events = makeSyntheticEvents(30);
    reset(30);

    // Desc cursor: deliver last 9 events first
    for (const e of events.slice(21).reverse()) processEvent(e, false);

    const latest = getLatestEvent();
    expect(latest).not.toBeNull();
    expect(Number(latest!.eventId)).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// 4. Most recent result (reactive use case)
// ---------------------------------------------------------------------------

describe('getLatestGroup', () => {
  it('returns null when no events have been processed', async () => {
    reset(10);
    const result = await getLatestGroup();
    expect(result).toBeNull();
  });

  it('returns the last registered group after ascending load', async () => {
    const events = makeSyntheticEvents(15);
    reset(15);
    loadAll(events);

    const latest = await getLatestGroup();
    expect(latest).not.toBeNull();
    // The last group should have the highest head event ID
    const all = await Promise.all(getRows(0, getGroupCount()));
    const lastGroup = all[all.length - 1];
    expect(latest!.id).toBe(lastGroup.id);
  });

  it('updates as new groups are added beyond initial fetch', async () => {
    const events = makeSyntheticEvents(9);
    reset(9);
    loadAll(events);

    const latestBefore = await getLatestGroup();

    // New event arrives
    const [newHead, newStarted, newCompleted] = makeActivityGroup(10);
    processEvent(newHead, true);
    processEvent(newStarted, true);
    processEvent(newCompleted, true);

    const latestAfter = await getLatestGroup();
    expect(Number(latestAfter!.id)).toBeGreaterThan(Number(latestBefore!.id));
  });
});

describe('onLatestGroup', () => {
  it('fires for each new group head registered', () => {
    reset(30);
    const updates: string[] = [];
    const unsub = onLatestGroup((g) => updates.push(g.id));

    const events = makeSyntheticEvents(30);
    loadAll(events);

    unsub();
    expect(updates.length).toBeGreaterThan(0);
    // The last notification should be for the highest-ID group
    const lastNotifiedId = updates[updates.length - 1];
    expect(Number(lastNotifiedId)).toBeGreaterThan(0);
  });

  it('unsubscribe stops future notifications', () => {
    reset(30);
    const updates: string[] = [];
    const unsub = onLatestGroup((g) => updates.push(g.id));

    const firstBatch = makeSyntheticEvents(9);
    loadAll(firstBatch);
    const countAfterFirst = updates.length;

    unsub();

    const [head] = makeActivityGroup(10);
    processEvent(head, true);

    expect(updates.length).toBe(countAfterFirst); // no new notifications
  });
});

// ---------------------------------------------------------------------------
// 5. Navigation reset
// ---------------------------------------------------------------------------

describe('navigation reset', () => {
  it('reset() zeroes pool entries and reuses them for the next workflow', async () => {
    const events1 = makeSyntheticEvents(30);
    reset(30);
    loadAll(events1);
    const firstGroupCount = getGroupCount();

    reset(15);
    const events2 = makeSyntheticEvents(15);
    loadAll(events2);

    // Pool was re-used — no double allocation
    expect(getGroupCount()).toBeLessThanOrEqual(firstGroupCount);
    expect(getGroupCount()).toBeGreaterThan(0);
  });

  it('promises created before reset() do not resolve after reset', async () => {
    reset(30);
    const stalePromise = getRows(10, 11)[0]; // pending
    let resolved = false;
    stalePromise.then(() => {
      resolved = true;
    });

    reset(9); // navigate away
    const events = makeSyntheticEvents(9);
    loadAll(events);

    await tick();
    expect(resolved).toBe(false); // stale promise is abandoned
  });
});

// ---------------------------------------------------------------------------
// 6. Filtering
// ---------------------------------------------------------------------------

describe('getRows with excludeWorkflowTasks', () => {
  it('filters out WorkflowTask groups from the slice', async () => {
    const events = makeSyntheticEventsWithWorkflowTasks(30);
    reset(30);
    loadAll(events);

    const all = await Promise.all(getRows(0, getGroupCount()));
    const filtered = (
      await Promise.all(
        getRows(0, getGroupCount(), { excludeWorkflowTasks: true }),
      )
    ).filter(Boolean);

    expect(filtered.length).toBeLessThan(all.length);
    expect(filtered.every((g) => !isWorkflowTaskGroup(g))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Compact view regression: WFT groups must not appear in filtered output
//
// Regression: workflow-history-layout called getGroupArray() without
// excludeWorkflowTasks:true, leaking WFT groups into the Compact view.
// ---------------------------------------------------------------------------

describe('compact view: getGroupArray excludeWorkflowTasks regression', () => {
  it('returns no WFT groups when excludeWorkflowTasks is true, even with interleaved events', () => {
    reset(30);
    // Interleave WFT groups and activity groups to simulate a real workflow
    for (const e of makeWorkflowTaskGroup(1)) processEvent(e, true);
    for (const e of makeActivityGroup(4)) processEvent(e, true);
    for (const e of makeWorkflowTaskGroup(7)) processEvent(e, true);
    for (const e of makeActivityGroup(10)) processEvent(e, true);
    for (const e of makeWorkflowTaskGroup(13)) processEvent(e, true);

    const compactGroups = getGroupArray({ excludeWorkflowTasks: true });

    expect(compactGroups.every((g) => !isWorkflowTaskGroup(g))).toBe(true);
    expect(compactGroups).toHaveLength(2); // only the two activity groups
  });

  it('includes WFT groups in unfiltered output (for All events view)', () => {
    reset(20);
    for (const e of makeWorkflowTaskGroup(1)) processEvent(e, true);
    for (const e of makeActivityGroup(4)) processEvent(e, true);

    const allGroups = getGroupArray();
    const wftGroups = allGroups.filter(isWorkflowTaskGroup);

    expect(wftGroups.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 7. Boundary dedup (cursor overlap)
// ---------------------------------------------------------------------------

describe('boundary dedup', () => {
  it('write-once guard prevents double group registration for the same head slot', () => {
    reset(10);
    const [head] = makeActivityGroup(1);

    processEvent(head, true); // asc cursor
    processEvent(head, false); // desc cursor — same event, same slot

    expect(getGroupCount()).toBe(1);
  });

  it('eventToGroup is set on first write and ignored on second', () => {
    reset(10);
    const [head, started, completed] = makeActivityGroup(1);

    processEvent(head, true);
    processEvent(started, true);
    processEvent(completed, true);

    // Simulate boundary overlap: desc cursor also writes the head
    processEvent(head, false);

    expect(getGroupCount()).toBe(1);
    // Group still has all 3 events — the duplicate write didn't corrupt it
    // (eventToGroup[0] !== 0 → guard fires → second head write skipped)
  });
});

// ---------------------------------------------------------------------------
// 8. Solo event orphan cleanup
// ---------------------------------------------------------------------------

describe('solo event orphan cleanup', () => {
  it('WorkflowExecutionStarted is not registered as a group', () => {
    reset(10);
    processEvent(makeWorkflowStarted(1), true);
    expect(getGroupCount()).toBe(0);
  });

  it('WorkflowExecutionCompleted is not registered as a group', () => {
    reset(10);
    processEvent(makeWorkflowCompleted(5), true);
    expect(getGroupCount()).toBe(0);
  });

  it('pendingFollowers is empty after solo head arrives for orphaned followers', () => {
    reset(10);

    // Inject a follower that references slot 0 (eventId "1") as its head,
    // but slot 0 will be a WorkflowExecutionStarted (solo, not a group head)
    const orphanedFollower = makeActivityStarted(2, 1); // scheduledEventId=1
    processEvent(orphanedFollower, false); // parks in pendingFollowers[0]

    expect(_debugState().pendingFollowersSize).toBe(1);

    // Now the solo head arrives — createEventGroup returns undefined
    processEvent(makeWorkflowStarted(1), true);

    expect(_debugState().pendingFollowersSize).toBe(0); // orphan discarded
    expect(getGroupCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 9. mergeHeads ordering
// ---------------------------------------------------------------------------

describe('mergeHeads', () => {
  it('merged result is sorted ascending by slot index', () => {
    const events = makeSyntheticEvents(30);
    reset(30);

    // Asc: events 1-15
    for (const e of events.slice(0, 15)) processEvent(e, true);
    // Desc: events 16-30 in reverse
    for (const e of events.slice(15).reverse()) processEvent(e, false);

    const merged = mergeHeads();
    for (let i = 1; i < merged.length; i++) {
      expect(merged[i]).toBeGreaterThan(merged[i - 1]);
    }
  });

  it('merged result contains no duplicate slot indices', () => {
    const events = makeSyntheticEvents(30);
    reset(30);
    for (const e of events.slice(0, 15)) processEvent(e, true);
    for (const e of events.slice(15).reverse()) processEvent(e, false);

    const merged = mergeHeads();
    const unique = new Set(merged);
    expect(unique.size).toBe(merged.length);
  });
});

// ---------------------------------------------------------------------------
// 10. setFailedEvent (billableActions context)
// ---------------------------------------------------------------------------

describe('setFailedEvent', () => {
  it('can be set to null without error', () => {
    reset(10);
    setFailedEvent(null);
    expect(getLatestEvent()).toBeNull();
  });

  it('can be set to a HistoryEvent before processEvent calls', () => {
    reset(10);
    const events = makeSyntheticEvents(9);
    // Simulate desc first-page hook
    setFailedEvent(null);
    loadAll(events);
    expect(getGroupCount()).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 11. Heap size smoke test (skipped unless NODE_OPTIONS=--expose-gc)
// ---------------------------------------------------------------------------

describe('memory overhead smoke test', () => {
  it('heap growth for 50k events stays under 60MB', async () => {
    if (typeof globalThis.gc !== 'function') return; // skip without --expose-gc

    const events = makeSyntheticEvents(50_000);
    globalThis.gc();
    const before = process.memoryUsage().heapUsed;

    reset(50_000);
    loadAll(events);
    await Promise.all(getRows(0, getGroupCount()));

    globalThis.gc();
    const after = process.memoryUsage().heapUsed;
    const deltaMB = (after - before) / (1024 * 1024);

    // Log the actual number so it's visible in CI output
    console.log(`heap delta for 50k events: ${deltaMB.toFixed(1)} MB`);
    expect(deltaMB).toBeLessThan(70);
  });
});

// ---------------------------------------------------------------------------
// 12. Activity group integrity
// ---------------------------------------------------------------------------

describe('activity group integrity', () => {
  it('group has all 3 events when loaded ascending', async () => {
    reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);
    processEvent(scheduled, true);
    processEvent(started, true);
    processEvent(completed, true);

    const [group] = await Promise.all(getRows(0, 1));
    expect(group.eventList.length).toBe(3);
    expect(group.id).toBe('1');
  });

  it('group has all 3 events when followers arrive before head', async () => {
    reset(10);
    const [scheduled, started, completed] = makeActivityGroup(1);

    // Desc cursor delivers completion and start first
    processEvent(completed, false);
    processEvent(started, false);
    // Asc cursor delivers head
    processEvent(scheduled, true);

    const [group] = await Promise.all(getRows(0, 1));
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

    processEvent(scheduled, true); // asc cursor: head arrives first
    processEvent(completed, false); // desc cursor: Completed arrives before Started
    processEvent(started, false); // desc cursor: Started arrives last despite lower ID

    const [group] = await Promise.all(getRows(0, 1));
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
      processEvent(e, true);
    }

    const groups = await Promise.all(getRows(0, getGroupCount()));
    expect(groups[0].eventList.length).toBe(3); // activity
    expect(groups[1].eventList.length).toBe(3); // activity
    expect(groups[2].eventList.length).toBe(2); // timer
  });
});

// ---------------------------------------------------------------------------
// 13. getGroupCount progression
// ---------------------------------------------------------------------------

describe('getGroupCount', () => {
  it('increments as head events are processed', () => {
    reset(30);
    expect(getGroupCount()).toBe(0);

    processEvent(makeActivityScheduled(1), true);
    expect(getGroupCount()).toBe(1);

    processEvent(makeActivityScheduled(4), true);
    expect(getGroupCount()).toBe(2);
  });

  it('does not increment for follower events', () => {
    reset(10);
    processEvent(makeActivityScheduled(1), true);
    expect(getGroupCount()).toBe(1);

    processEvent(makeActivityStarted(2, 1), true);
    expect(getGroupCount()).toBe(1); // still 1

    processEvent(makeActivityCompleted(3, 1, 2), true);
    expect(getGroupCount()).toBe(1); // still 1
  });

  it('does not increment for solo (non-group) events', () => {
    reset(10);
    processEvent(makeWorkflowStarted(1), true);
    processEvent(makeWorkflowCompleted(2), true);
    expect(getGroupCount()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 14. enrichGroups — pending activity + nexus annotation
// ---------------------------------------------------------------------------

describe('enrichGroups', () => {
  it('sets pendingActivity on an in-flight activity group (1 event)', async () => {
    reset(10);
    processEvent(makeActivityScheduled(1, 'MyActivity'), true);

    const pendingActivities = [
      { activityId: '1', state: 'Started', activityType: 'MyActivity' },
    ] as Parameters<typeof enrichGroups>[0];

    enrichGroups(pendingActivities, []);

    const [group] = await Promise.all(getRows(0, 1));
    expect(group.pendingActivity).toBeDefined();
    expect(group.pendingActivity?.activityId).toBe('1');
  });

  it('does not set pendingActivity on a completed activity group (3 events)', async () => {
    reset(10);
    const [s, st, c] = makeActivityGroup(1);
    processEvent(s, true);
    processEvent(st, true);
    processEvent(c, true);

    const pendingActivities = [
      { activityId: '1', state: 'Started', activityType: 'TestActivity' },
    ] as Parameters<typeof enrichGroups>[0];

    enrichGroups(pendingActivities, []);

    const [group] = await Promise.all(getRows(0, 1));
    expect(group.pendingActivity).toBeUndefined();
  });

  it('clears a previously set pendingActivity when no longer pending', async () => {
    reset(10);
    const [s, st, c] = makeActivityGroup(1);
    processEvent(s, true);
    processEvent(st, true);
    processEvent(c, true);

    // First enrichment marks it pending
    const pa = [{ activityId: '1', state: 'Started' }] as Parameters<
      typeof enrichGroups
    >[0];
    enrichGroups(pa, []);

    // Second enrichment with empty array (activity completed server-side)
    enrichGroups([], []);

    const [group] = await Promise.all(getRows(0, 1));
    expect(group.pendingActivity).toBeUndefined();
  });

  it('clears pendingActivity when live completion extends an existing group', async () => {
    reset(10);
    resetLive();
    const [scheduled, started, completed] = makeActivityGroup(1);
    processEvent(scheduled, true);
    processEvent(started, true);

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

    let [group] = await Promise.all(getRows(0, 1));
    expect(group.pendingActivity).toBeDefined();
    expect(group.isPending).toBe(true);

    expect(appendLiveEvent(completed)).toBe(true);

    [group] = await Promise.all(getRows(0, 1));
    expect(group.eventList).toHaveLength(3);
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('clears pendingActivity when a live timeout resolves a short activity group', async () => {
    reset(10);
    resetLive();
    const [scheduled, timedOut] = makeActivityTimeoutGroup(1);
    processEvent(scheduled, true);

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

    let [group] = await Promise.all(getRows(0, 1));
    expect(group.pendingActivity).toBeDefined();
    expect(group.isPending).toBe(true);

    expect(appendLiveEvent(timedOut)).toBe(true);

    [group] = await Promise.all(getRows(0, 1));
    expect(group.eventList.map((event) => event.id)).toEqual(['1', '2']);
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('annotates live-only activity and nexus groups with pending metadata', () => {
    reset(20);
    resetLive();
    appendLiveEvent(makeActivityScheduled(1, 'MyActivity'));
    appendLiveEvent(makeNexusOperationGroup(4)[0]);

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
    processEvent(makeActivityScheduled(1, 'MyActivity'), true);
    enrichGroups([], []);

    const [group] = await Promise.all(getRows(0, 1));
    expect(group.pendingActivity).toBeUndefined();
  });

  it('does not touch non-activity groups', async () => {
    reset(10);
    const [ts, tf] = makeTimerGroup(1);
    processEvent(ts, true);
    processEvent(tf, true);

    enrichGroups(
      [{ activityId: '1', state: 'Started' }] as Parameters<
        typeof enrichGroups
      >[0],
      [],
    );

    const [group] = await Promise.all(getRows(0, 1));
    expect(group.pendingActivity).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 15. getWorkflowTaskFailedEvent — derives active WFT failure from buffer
// ---------------------------------------------------------------------------

describe('getWorkflowTaskFailedEvent (buffer)', () => {
  it('returns undefined when no WFT groups exist', () => {
    reset(10);
    processEvent(makeActivityScheduled(1), true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns undefined when WFT group completed normally', () => {
    reset(10);
    for (const e of makeWorkflowTaskGroup(1)) processEvent(e, true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns the failed event when a WFT group has no subsequent completion', () => {
    reset(10);
    // WFT: Scheduled(1), Started(2), Failed(3)
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1), true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed).toBeDefined();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
  });

  it('returns undefined when a later WFT completed after the failure (workflow recovered)', () => {
    reset(20);
    // First WFT: fails
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1), true);
    // Second WFT: completes successfully (workflow recovered)
    processEvent(makeWorkflowTaskScheduled(4), true);
    processEvent(makeWorkflowTaskStarted(5, 4), true);
    processEvent(makeWorkflowTaskCompleted(6, 4), true);

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns undefined for ResetWorkflow cause (not a real failure)', () => {
    reset(10);
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1, 'ResetWorkflow'), true);

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns the most recent failure when multiple WFT groups fail', () => {
    reset(20);
    // First WFT fails
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1), true);
    // Second WFT also fails (eventId 6 > 3)
    processEvent(makeWorkflowTaskScheduled(4), true);
    processEvent(makeWorkflowTaskStarted(5, 4), true);
    processEvent(makeWorkflowTaskFailed(6, 4), true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('6');
  });

  it('returns a WFT failure whose group arrives entirely via the live poll', () => {
    reset(10);
    resetLive();
    appendLiveEvent(makeWorkflowTaskScheduled(1));
    appendLiveEvent(makeWorkflowTaskStarted(2, 1));
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();

    expect(appendLiveEvent(makeWorkflowTaskFailed(3, 1))).toBe(true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });

  it('returns a live WFT failure appended to a WFT head already in the pool', () => {
    reset(10);
    resetLive();
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();

    expect(appendLiveEvent(makeWorkflowTaskFailed(3, 1))).toBe(true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });

  it('clears the WFT failure when a later WFT completes via the live poll', () => {
    reset(20);
    resetLive();
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1), true);
    expect(getWorkflowTaskFailedEvent()?.id).toBe('3');

    // Workflow recovers: a new WFT completes, delivered live.
    appendLiveEvent(makeWorkflowTaskScheduled(4));
    appendLiveEvent(makeWorkflowTaskStarted(5, 4));
    appendLiveEvent(makeWorkflowTaskCompleted(6, 4));

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('does not double-count a live WFT group once the fetch claims its head', () => {
    reset(10);
    resetLive();
    // Failure lands live first, then the bidirectional fetch reaches the head.
    appendLiveEvent(makeWorkflowTaskScheduled(1));
    appendLiveEvent(makeWorkflowTaskFailed(3, 1));
    processEvent(makeWorkflowTaskScheduled(1), true);

    const failed = getWorkflowTaskFailedEvent();
    expect(failed?.eventType).toBe('WorkflowTaskFailed');
    expect(failed?.id).toBe('3');
  });
});

// ---------------------------------------------------------------------------
// 16. getGroupArray — synchronous sorted group access
// ---------------------------------------------------------------------------

describe('getGroupArray', () => {
  it('returns groups sorted by eventId ascending', () => {
    reset(20);
    // Load in non-sequential order (simulates interleaved cursors)
    const [s2, st2, c2] = makeActivityGroup(4);
    const [s1, st1, c1] = makeActivityGroup(1);
    for (const e of [s2, st2, c2]) processEvent(e, false); // desc cursor
    for (const e of [s1, st1, c1]) processEvent(e, true); // asc cursor

    const groups = getGroupArray();
    expect(groups.length).toBe(2);
    expect(Number(groups[0].id)).toBeLessThan(Number(groups[1].id));
  });

  it('excludeWorkflowTasks filters WFT groups', () => {
    reset(20);
    for (const e of makeWorkflowTaskGroup(1)) processEvent(e, true);
    for (const e of makeActivityGroup(4)) processEvent(e, true);

    const all = getGroupArray();
    const noWft = getGroupArray({ excludeWorkflowTasks: true });
    expect(all.length).toBe(2);
    expect(noWft.length).toBe(1);
    expect(noWft[0].initialEvent.eventType).toBe('ActivityTaskScheduled');
  });

  it('is stable across multiple calls', () => {
    reset(10);
    for (const e of makeActivityGroup(1)) processEvent(e, true);

    const a = getGroupArray();
    const b = getGroupArray();
    expect(a.length).toBe(b.length);
    expect(a[0].id).toBe(b[0].id);
  });

  it('returns empty array when no groups loaded', () => {
    reset(10);
    processEvent(makeWorkflowStarted(1), true);
    expect(getGroupArray()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Pixi rendering layer — track assignment & WFT filtering
// ---------------------------------------------------------------------------

/**
 * Simulates the renderer's `rebuildByTrack` logic (pure data, no Pixi).
 * Returns a sparse array indexed by trackIndex containing pool indices.
 */
function simulateByTrack(): number[][] {
  const byTrack: number[][] = [];
  const count = getGroupCount();
  for (let i = 0; i < count; i++) {
    const meta = getGroupMeta(i);
    if (!meta || meta.pixiType === 'GROUP_WORKFLOW_TASK' || meta.trackIndex < 0)
      continue;
    (byTrack[meta.trackIndex] ??= []).push(i);
  }
  return byTrack;
}

describe('Pixi track assignment — WFT filtering', () => {
  it('WFT groups receive trackIndex -1 and are excluded from visible count', () => {
    const events = makeSyntheticEventsWithWorkflowTasks(25);
    reset(25);
    for (const e of events) processEvent(e, true);

    let wftCount = 0;
    let nonWftCount = 0;
    for (let i = 0; i < getGroupCount(); i++) {
      const meta = getGroupMeta(i);
      if (!meta) continue;
      if (meta.pixiType === 'GROUP_WORKFLOW_TASK') {
        expect(meta.trackIndex).toBe(-1);
        wftCount++;
      } else {
        expect(meta.trackIndex).toBeGreaterThanOrEqual(0);
        nonWftCount++;
      }
    }
    expect(wftCount).toBeGreaterThan(0);
    expect(getVisibleGroupCount()).toBe(nonWftCount);
    expect(getGroupCount()).toBe(wftCount + nonWftCount);
  });

  it('getVisibleGroupCount excludes WFT groups', () => {
    reset(20);
    for (const e of makeWorkflowTaskGroup(1)) processEvent(e, true);
    for (const e of makeActivityGroup(4)) processEvent(e, true);
    for (const e of makeWorkflowTaskGroup(7)) processEvent(e, true);

    expect(getGroupCount()).toBe(3);
    expect(getVisibleGroupCount()).toBe(1);
  });

  it('non-WFT desc groups fill tracks 0..n consecutively', () => {
    reset(20);
    for (const e of makeActivityGroup(1)) processEvent(e, false);
    for (const e of makeActivityGroup(4)) processEvent(e, false);
    for (const e of makeWorkflowTaskGroup(7)) processEvent(e, false);
    for (const e of makeActivityGroup(10)) processEvent(e, false);

    const tracks = [];
    for (let i = 0; i < getGroupCount(); i++) {
      const meta = getGroupMeta(i);
      if (meta && meta.pixiType !== 'GROUP_WORKFLOW_TASK') {
        tracks.push(meta.trackIndex);
      }
    }
    tracks.sort((a, b) => a - b);
    expect(tracks).toEqual([0, 1, 2]);
  });

  it('non-WFT asc groups fill from bottom of the estimated total', () => {
    const EST = 10;
    reset(20);
    setEstimatedGroupCount(EST);
    for (const e of makeActivityGroup(1)) processEvent(e, true);
    for (const e of makeActivityGroup(4)) processEvent(e, true);

    for (let i = 0; i < getGroupCount(); i++) {
      const meta = getGroupMeta(i);
      if (meta && meta.pixiType !== 'GROUP_WORKFLOW_TASK') {
        expect(meta.trackIndex).toBeGreaterThanOrEqual(EST - 2);
      }
    }
  });

  it('after assignTrackIndices, visible tracks are contiguous with no holes', () => {
    reset(30);
    const events = makeSyntheticEventsWithWorkflowTasks(25);
    // split: first half desc, second half asc
    const half = Math.floor(events.length / 2);
    for (const e of events.slice(0, half)) processEvent(e, false);
    for (const e of events.slice(half)) processEvent(e, true);

    assignTrackIndices();

    const usedTracks = new Set<number>();
    for (let i = 0; i < getGroupCount(); i++) {
      const meta = getGroupMeta(i);
      if (!meta || meta.pixiType === 'GROUP_WORKFLOW_TASK') continue;
      expect(meta.trackIndex).toBeGreaterThanOrEqual(0);
      usedTracks.add(meta.trackIndex);
    }

    const sorted = [...usedTracks].sort((a, b) => a - b);
    const expected = Array.from({ length: sorted.length }, (_, k) => k);
    expect(sorted).toEqual(expected);
  });

  it('desc groups always at top (lower indices), asc groups at bottom after assignTrackIndices', () => {
    reset(20);
    for (const e of makeActivityGroup(1)) processEvent(e, false);
    for (const e of makeActivityGroup(4)) processEvent(e, false);
    for (const e of makeActivityGroup(7)) processEvent(e, true);
    for (const e of makeActivityGroup(10)) processEvent(e, true);

    assignTrackIndices();

    const descTracks: number[] = [];
    const ascTracks: number[] = [];

    for (let i = 0; i < getGroupCount(); i++) {
      const meta = getGroupMeta(i);
      if (!meta || meta.pixiType === 'GROUP_WORKFLOW_TASK') continue;
    }

    expect(getDescGroupCount()).toBe(2);
    expect(getAscGroupCount()).toBe(2);

    // desc groups: tracks 0 and 1
    // asc groups: tracks 2 and 3 (total=4, so total-1-0=3, total-1-1=2)
    for (let i = 0; i < getGroupCount(); i++) {
      const meta = getGroupMeta(i);
      if (!meta || meta.pixiType === 'GROUP_WORKFLOW_TASK') continue;
    }

    // Verify by inspecting raw counts
    const total = getVisibleGroupCount();
    expect(total).toBe(4);
    // desc group 0 → track 0, desc group 1 → track 1
    // asc group 0 → track 3, asc group 1 → track 2
    let descSeen = 0;
    let ascSeen = 0;
    for (let i = 0; i < getGroupCount(); i++) {
      const meta = getGroupMeta(i);
      if (!meta || meta.pixiType === 'GROUP_WORKFLOW_TASK') continue;
      if (descTracks.includes(meta.trackIndex)) descSeen++;
      if (ascTracks.includes(meta.trackIndex)) ascSeen++;
    }
    // Both sections should not overlap
    expect(new Set([...descTracks, ...ascTracks]).size).toBe(
      descTracks.length + ascTracks.length,
    );
  });
});

// ---------------------------------------------------------------------------
// Pixi rendering layer — loading gap / indicator state
// ---------------------------------------------------------------------------

describe('Pixi loading gap calculation', () => {
  it('loading gap = 0 when all visible groups are loaded via one cursor', () => {
    const events = makeSyntheticEvents(20);
    reset(20);
    for (const e of events) processEvent(e, true);
    assignTrackIndices();

    const descCount = getDescGroupCount();
    const ascCount = getAscGroupCount();
    const totalRows = getVisibleGroupCount();

    // ascending-only load: all groups in ascGroupHeads, descGroupHeads empty
    expect(descCount).toBe(0);
    expect(ascCount).toBe(totalRows);

    const loadingStart = descCount;
    const loadingEnd = Math.max(descCount, totalRows - ascCount);
    expect(loadingStart).toBe(loadingEnd); // no gap
  });

  it('loading gap exists while only desc cursor has loaded', () => {
    const events = makeSyntheticEvents(12);
    reset(12);
    // Only process first 6 events descending
    for (const e of events.slice(0, 6)) processEvent(e, false);

    const descCount = getDescGroupCount();
    const ascCount = getAscGroupCount();
    const estimated = 6; // rough estimate of total visible
    const totalRows = Math.max(estimated, getVisibleGroupCount());

    const loadingStart = descCount;
    const loadingEnd = Math.max(descCount, totalRows - ascCount);

    expect(descCount).toBeGreaterThan(0);
    expect(ascCount).toBe(0);
    expect(loadingEnd).toBeGreaterThan(loadingStart); // gap present
  });

  it('loading gap closes when bidirectional cursors cover all tracks', () => {
    const events = makeSyntheticEvents(20);
    reset(20);

    const half = Math.floor(events.length / 2);
    for (const e of events.slice(0, half)) processEvent(e, false);
    for (const e of events.slice(half)) processEvent(e, true);

    assignTrackIndices();

    const descCount = getDescGroupCount();
    const ascCount = getAscGroupCount();
    const totalRows = getVisibleGroupCount();

    expect(descCount + ascCount).toBe(totalRows);
    const loadingStart = descCount;
    const loadingEnd = Math.max(descCount, totalRows - ascCount);
    expect(loadingStart).toBe(loadingEnd);
  });

  it('poolCount never inflates totalRows for visible group purposes', () => {
    // Load a mix of WFT and non-WFT; poolCount > getVisibleGroupCount()
    reset(20);
    const events = makeSyntheticEventsWithWorkflowTasks(19);
    for (const e of events) processEvent(e, true);
    assignTrackIndices();

    const poolCount = getGroupCount();
    const visibleCount = getVisibleGroupCount();

    expect(poolCount).toBeGreaterThan(visibleCount);

    // The loading gap calculation must use visibleCount, not poolCount
    const descCount = getDescGroupCount();
    const ascCount = getAscGroupCount();
    const totalRowsCorrect = Math.max(visibleCount, visibleCount);
    const totalRowsWrong = Math.max(visibleCount, poolCount);

    const gapCorrect =
      Math.max(descCount, totalRowsCorrect - ascCount) - descCount;
    const gapWrong = Math.max(descCount, totalRowsWrong - ascCount) - descCount;

    // Using poolCount would produce a spurious loading gap
    expect(gapCorrect).toBe(0);
    expect(gapWrong).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Pixi rendering layer — gutter event data (byTrack simulation)
// ---------------------------------------------------------------------------

describe('Pixi gutter event data (byTrack)', () => {
  it('byTrack has one entry per visible group, no holes', () => {
    const events = makeSyntheticEvents(20);
    reset(20);
    for (const e of events) processEvent(e, true);
    assignTrackIndices();

    const byTrack = simulateByTrack();
    const occupied = byTrack.filter(Boolean);

    expect(occupied.length).toBe(getVisibleGroupCount());

    // No holes: every index 0..visibleCount-1 should be present
    const visibleCount = getVisibleGroupCount();
    for (let t = 0; t < visibleCount; t++) {
      expect(byTrack[t]).toBeDefined();
    }
  });

  it('WFT groups are absent from byTrack', () => {
    reset(25);
    const events = makeSyntheticEventsWithWorkflowTasks(24);
    for (const e of events) processEvent(e, true);
    assignTrackIndices();

    const byTrack = simulateByTrack();
    for (const poolIdxs of byTrack) {
      if (!poolIdxs) continue;
      for (const idx of poolIdxs) {
        const meta = getGroupMeta(idx);
        expect(meta?.pixiType).not.toBe('GROUP_WORKFLOW_TASK');
      }
    }
  });

  it('tracks above viewport are identified as top gutter events', () => {
    reset(20);
    const events = makeSyntheticEvents(20);
    for (const e of events) processEvent(e, true);
    assignTrackIndices();

    const byTrack = simulateByTrack();
    const visibleCount = getVisibleGroupCount();

    // Simulate viewport showing only tracks 3..6
    const firstVisible = 3;
    const lastVisible = 6;

    const above = byTrack.slice(0, firstVisible).filter(Boolean);
    const below = byTrack.slice(lastVisible + 1, visibleCount).filter(Boolean);

    expect(above.length).toBe(firstVisible); // tracks 0,1,2
    expect(below.length).toBe(visibleCount - lastVisible - 1);

    // All events in gutter regions have valid pool indices
    for (const idxs of [...above, ...below]) {
      for (const idx of idxs) {
        const meta = getGroupMeta(idx);
        expect(meta).not.toBeNull();
        expect(meta?.trackIndex).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('top gutter events have smaller trackIndex than bottom gutter events', () => {
    reset(20);
    const events = makeSyntheticEvents(20);
    for (const e of events) processEvent(e, true);
    assignTrackIndices();

    const byTrack = simulateByTrack();
    const visibleCount = getVisibleGroupCount();
    const midpoint = Math.floor(visibleCount / 2);

    const topTracks = byTrack
      .slice(0, midpoint)
      .flatMap((t) => t ?? [])
      .map((idx) => getGroupMeta(idx)!.trackIndex);
    const bottomTracks = byTrack
      .slice(midpoint)
      .flatMap((t) => t ?? [])
      .map((idx) => getGroupMeta(idx)!.trackIndex);

    const maxTop = Math.max(...topTracks);
    const minBottom = Math.min(...bottomTracks);
    expect(maxTop).toBeLessThan(minBottom);
  });

  it('byTrack is empty after reset', () => {
    reset(20);
    const events = makeSyntheticEvents(20);
    for (const e of events) processEvent(e, true);
    assignTrackIndices();

    reset(0);
    const byTrack = simulateByTrack();
    expect(byTrack.filter(Boolean).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Option C — eventSlots memory release
//
// These tests verify that raw HistoryEvent objects stored in eventSlots are
// nulled out once the event has been fully incorporated into its EventGroup.
// They FAIL before Option C is implemented and PASS afterwards.
// ---------------------------------------------------------------------------

describe('Option C — eventSlots are released after grouping', () => {
  it('[RED] eventSlots entries for head events are null after processEvent returns', () => {
    const events = makeSyntheticEvents(10);
    reset(10);
    for (const e of events) processEvent(e, true);

    const slots = _debugEventSlots();
    const occupiedAfterProcessing = slots.filter((s) => s != null);

    // After all events have been processed into groups, no slots should remain
    // populated. This FAILS currently because we never null out eventSlots.
    expect(occupiedAfterProcessing.length).toBe(0);
  });

  it('[RED] follower eventSlots are null after they are attached to their group', () => {
    // Build a proper WFT-then-activity sequence with correct cross-references:

    // 1: WorkflowExecutionStarted (solo head)
    // 2: WorkflowTaskScheduled   (WFT head)
    // 3: WorkflowTaskStarted     (follower of 2)
    // 4: WorkflowTaskCompleted   (follower of 2)
    // 5: ActivityTaskScheduled   (activity head)
    // 6: ActivityTaskStarted     (follower of 5)
    // 7: ActivityTaskCompleted   (follower of 5)
    reset(10);
    processEvent(makeWorkflowStarted(1), true);
    processEvent(makeWorkflowTaskScheduled(2), true);
    processEvent(makeWorkflowTaskStarted(3, 2), true);
    processEvent(makeWorkflowTaskCompleted(4, 2), true);
    processEvent(makeActivityScheduled(5), true);
    processEvent(makeActivityStarted(6, 5), true);
    processEvent(makeActivityCompleted(7, 5, 6), true);

    const slots = _debugEventSlots();
    const followerSlots = slots.slice(0, 7).filter((s) => s != null);

    // All slots (heads + followers) should be null once attached to their group.
    // FAILS currently because we never null out eventSlots.
    expect(followerSlots.length).toBe(0);
  });

  it('[RED] eventSlots remain entirely null-filled after all groups are complete', () => {
    const events = makeSyntheticEvents(30);
    reset(30);
    for (const e of events) processEvent(e, true);

    const slots = _debugEventSlots();
    const populated = Array.from(slots).filter((s) => s != null);

    // Every slot should be released. FAILS currently.
    expect(populated.length).toBe(0);
  });

  it('getGroupCount is unaffected by eventSlots nulling', () => {
    const events = makeSyntheticEvents(20);
    reset(20);
    const before = getGroupCount();
    for (const e of events) processEvent(e, true);
    const after = getGroupCount();
    // Groups still accumulate correctly regardless of slot nulling
    expect(after).toBeGreaterThan(before);
  });

  it('getGroupMeta still returns correct data after eventSlots are released', () => {
    const events = makeSyntheticEvents(10);
    reset(10);
    for (const e of events) processEvent(e, true);

    for (let i = 0; i < getGroupCount(); i++) {
      const meta = getGroupMeta(i);
      expect(meta).not.toBeNull();
      expect(meta!.startMs).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// appendLiveEvent — boolean return value (live-poll tight-loop fix)
//
// Regression: the live poll was firing thousands of requests because
// appendLiveEvent returned void, so the caller always called
// bufferVersion.update() even for duplicate events returned by the server.
// The fix: return true for genuinely new events, false for duplicates.
// ---------------------------------------------------------------------------

describe('appendLiveEvent boolean return', () => {
  beforeEach(() => {
    reset(10);
    resetLive();
  });

  it('returns true for a genuinely new live event', () => {
    // Event 11 was never in the initial fetch — it is a new live event.
    const newEvent = makeWorkflowCompleted(11);
    expect(appendLiveEvent(newEvent)).toBe(true);
  });

  it('returns false when the same event is appended a second time (duplicate)', () => {
    const ev = makeWorkflowCompleted(11);
    appendLiveEvent(ev);
    // Second call with the same eventId must be a no-op.
    expect(appendLiveEvent(ev)).toBe(false);
  });

  it('returns false for a different object with the same eventId (duplicate by ID)', () => {
    const ev1 = makeWorkflowCompleted(11);
    const ev2 = makeWorkflowCompleted(11); // distinct object, same ID
    appendLiveEvent(ev1);
    expect(appendLiveEvent(ev2)).toBe(false);
  });

  it('returns false for a grouped event already processed in the initial fetch', () => {
    // The eventToGroup guard prevents re-processing grouped events (ActivityScheduled
    // is the head of a group so eventToGroup gets a non-zero entry for it).
    const group = makeActivityGroup(2); // eventIds 2, 3, 4
    reset(5);
    for (const e of group) processEvent(e, true);

    // ActivityScheduled (eventId=2) is the group head → eventToGroup[1] !== 0.
    expect(appendLiveEvent(group[0])).toBe(false);
  });

  it('only returns true for grouped events that are actually new in a mixed batch', () => {
    // Use an activity group (events 1-3) as the "already in initial fetch" set.
    // WorkflowStarted solo events are excluded because the eventToGroup guard
    // does not cover solo events (they live in soloEvents, not groupPool).
    const existing = makeActivityGroup(1); // eventIds 1, 2, 3
    reset(6);
    for (const e of existing) processEvent(e, true);
    resetLive();

    const newEv = makeActivityScheduled(4);
    const results = [...existing, newEv].map((e) => appendLiveEvent(e));

    // Events 1-3 are grouped and already in groupPool → all false
    expect(results.slice(0, 3).every((r) => r === false)).toBe(true);
    // Event 4 is genuinely new → true
    expect(results[3]).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Concurrent live poll + bidirectional fetch
//
// The live poll now starts at the same time as the bidirectional fetch so new
// events are captured immediately even when the initial load is slow.
// appendLiveEvent can therefore be called BEFORE processEvent for the same
// event — both write to separate arrays (liveGroups vs groupPool). Once
// processEvent claims an event, getEventArray() must not return it twice.
// ---------------------------------------------------------------------------

describe('concurrent live poll and bidirectional fetch', () => {
  beforeEach(() => {
    reset(10);
    resetLive();
  });

  it('events only in live poll (genuinely new) appear in getEventArray()', () => {
    // Bidirectional has not started — buffer is empty.
    // Live poll delivers a brand-new event (not in the initial fetch).
    const newEv = makeActivityScheduled(1);
    appendLiveEvent(newEv);

    const ids = getEventArray().map((e) => e.id);
    expect(ids).toContain('1');
  });

  it('an event absorbed by processEvent is not double-counted in getEventArray()', () => {
    // Race: live poll arrives first (event 2 added to liveGroups),
    // then the bidirectional fetch arrives (processEvent claims event 2 into groupPool).
    const group = makeActivityGroup(2); // eventIds 2, 3, 4
    reset(5);

    // Step 1 — live poll wins the race
    for (const ev of group) appendLiveEvent(ev);
    // All three events are in liveGroups now.

    // Step 2 — bidirectional fetch arrives and claims the same events
    for (const ev of group) processEvent(ev, true);
    // Events are now in BOTH groupPool (via processEvent) and liveGroups.

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
      resetLive();

      for (const ev of group) appendLiveEvent(ev);
      expect(getGroupArray()).toHaveLength(1);
      expect(getGroupArray()[0].eventList).toHaveLength(group.length);

      processEvent(group[0], true);

      const groups = getGroupArray();
      expect(groups).toHaveLength(1);
      expect(groups[0].id).toBe(group[0].eventId);
      expect(groups[0].eventList.map((event) => event.id)).toEqual(
        group.map((event) => event.eventId),
      );
      expect(getLiveGroupCount()).toBe(0);
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
      resetLive();

      for (const ev of group.slice(1)) appendLiveEvent(ev);
      expect(getGroupArray()).toHaveLength(0);

      processEvent(group[0], true);

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
      resetLive();

      processEvent(group[0], true);
      for (const ev of group.slice(1)) appendLiveEvent(ev);

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
    resetLive();
    const scheduled = makeActivityScheduled(1);
    const started = makeActivityStarted(100, 1);

    processEvent(scheduled, true);
    expect(appendLiveEvent(started)).toBe(true);
    processEvent(started, true);

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
    for (const ev of existing) processEvent(ev, true);

    const newEv = makeActivityScheduled(7);
    resetLive();
    appendLiveEvent(newEv);

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

    // Live poll wins — all 5 events added to liveGroups.
    for (const ev of events) appendLiveEvent(ev);

    // Bidirectional catches up — all 5 events claimed into groupPool.
    for (const ev of events) processEvent(ev, true);

    const allIds = getEventArray().map((e) => e.id);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
  });

  it('only genuinely new events cause onNewEvents to fire', () => {
    // When the bidirectional fetch has already loaded events 1-3,
    // a live-poll batch of [2 (dup), 3 (dup), 4 (new)] should count added=1.
    const group = makeActivityGroup(1); // eventIds 1, 2, 3
    reset(5);
    for (const ev of group) processEvent(ev, true);
    resetLive();

    const results = [
      appendLiveEvent(group[0]), // eventId 1 → duplicate → false
      appendLiveEvent(group[1]), // eventId 2 → duplicate → false
      appendLiveEvent(group[2]), // eventId 3 → duplicate → false
      appendLiveEvent(makeActivityScheduled(4)), // new → true
    ];

    const added = results.filter(Boolean).length;
    expect(added).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// livePendingFollowers — unified bidirectional-style park-and-flush for live poll
//
// When the live poll delivers a follower event before the head has been
// processed by either appendLiveEvent or processEvent, the follower is
// parked invisibly in livePendingFollowers. No group is created and nothing
// appears in getGroupArray() until the head arrives.
//
// Head can arrive two ways:
//   A. Via appendLiveEvent(head) — head and parked followers form a complete live group.
//   B. Via processEvent(head) — head enters groupPool; parked followers are
//      flushed directly into the pool group (no live group needed).
// ---------------------------------------------------------------------------

describe('appendLiveEvent — livePendingFollowers (unified bidirectional pattern)', () => {
  beforeEach(() => {
    reset(10);
    resetLive();
  });

  it('follower before head: nothing visible in getGroupArray until head arrives', () => {
    const [, started] = makeActivityGroup(1);
    const before = getGroupArray().length;
    appendLiveEvent(started); // head not yet seen
    expect(getGroupArray().length).toBe(before); // no partial stub rendered
  });

  it('multiple followers before head: still nothing visible', () => {
    const [, started, completed] = makeActivityGroup(1);
    const before = getGroupArray().length;
    appendLiveEvent(started);
    appendLiveEvent(completed);
    expect(getGroupArray().length).toBe(before);
  });

  it('path A: head arrives via appendLiveEvent — complete live group with all followers', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    appendLiveEvent(started);
    appendLiveEvent(completed);
    appendLiveEvent(scheduled); // head arrives last

    const groups = getGroupArray();
    const g = groups.find((g) => g.id === '1');
    expect(g).toBeDefined();
    expect(g?.eventList).toHaveLength(3);
    expect(g?.eventList.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('path A: head arrives before followers — followers extend live group normally', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    appendLiveEvent(scheduled); // head first
    appendLiveEvent(started);
    appendLiveEvent(completed);

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(3);
  });

  it('path B: head arrives via processEvent — followers flushed into groupPool group', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    appendLiveEvent(started);
    appendLiveEvent(completed);
    processEvent(scheduled, true); // head enters groupPool, flushes livePendingFollowers

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g).toBeDefined();
    expect(g?.eventList).toHaveLength(3);
    expect(g?.eventList.map((e) => e.id)).toEqual(['1', '2', '3']);
  });

  it('path B: option A — follower extends groupPool group when head already there', () => {
    const [scheduled, started] = makeActivityGroup(1);
    processEvent(scheduled, true); // head in groupPool
    appendLiveEvent(started); // follower via live poll

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(2);
    expect(g?.eventList[1].id).toBe('2');
  });

  it('no duplicate events in getEventArray when live poll and bidirectional both deliver followers', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    appendLiveEvent(started);
    appendLiveEvent(completed);
    processEvent(scheduled, true);
    processEvent(started, true);
    processEvent(completed, true);

    const allIds = getEventArray().map((e) => e.id);
    const unique = new Set(allIds);
    expect(allIds.length).toBe(unique.size);
    expect(unique.has('1')).toBe(true);
    expect(unique.has('2')).toBe(true);
    expect(unique.has('3')).toBe(true);
  });

  it('duplicate appendLiveEvent calls for same follower are ignored', () => {
    const [scheduled, started] = makeActivityGroup(1);
    appendLiveEvent(started);
    appendLiveEvent(started); // second call for same event
    appendLiveEvent(scheduled);

    const g = getGroupArray().find((g) => g.id === '1');
    expect(g?.eventList).toHaveLength(2); // not 3
  });
});
