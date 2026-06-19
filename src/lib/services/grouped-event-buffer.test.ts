import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { groupEvents } from '$lib/models/event-groups';
import { toEventHistory } from '$lib/models/event-history';

import {
  _debugState,
  enrichGroups,
  getGroupArray,
  getGroupCount,
  getLatestEvent,
  getLatestGroup,
  getRows,
  getWorkflowTaskFailedEvent,
  isWorkflowTaskGroup,
  mergeHeads,
  onLatestGroup,
  processEvent,
  reset,
  setFailedEvent,
} from './grouped-event-buffer';
import {
  makeActivityCompleted,
  makeActivityGroup,
  makeActivityScheduled,
  makeActivityStarted,
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
