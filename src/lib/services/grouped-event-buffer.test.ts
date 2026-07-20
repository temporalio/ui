import { beforeEach, describe, expect, it } from 'vitest';

import { groupEvents } from '$lib/models/event-groups';
import { toEventHistory } from '$lib/models/event-history';

import {
  appendLiveEvent,
  enrichGroups,
  getEventArray,
  getGroupArray,
  getWorkflowTaskFailedEvent,
  processEvent,
  reset,
} from './grouped-event-buffer';
import {
  makeActivityGroup,
  makeActivityScheduled,
  makeActivityTimeoutGroup,
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
} from './test-helpers/synthetic-events';

// The buffer is a module singleton; reset before each test.
beforeEach(() => {
  reset();
});

const loadAll = (events: ReturnType<typeof makeSyntheticEvents>) => {
  for (const event of events) processEvent(event, true);
};

const firstGroup = () => getGroupArray()[0];

type PendingActivities = Parameters<typeof enrichGroups>[0];
type PendingNexusOperations = Parameters<typeof enrichGroups>[1];

// ---------------------------------------------------------------------------
// Output equivalence with the array-based groupEvents()
// ---------------------------------------------------------------------------

describe('output equivalence with groupEvents', () => {
  it('matches groupEvents for a small ascending load', () => {
    const events = makeSyntheticEvents(30);
    loadAll(events);

    const expected = groupEvents(toEventHistory(events), 'ascending');
    const actual = getGroupArray();

    expect(actual.map((g) => g.id)).toEqual(expected.map((g) => g.id));
    expect(actual.map((g) => g.eventList.length)).toEqual(
      expected.map((g) => g.eventList.length),
    );
  });

  it('includes WorkflowTask groups when present', () => {
    loadAll(makeSyntheticEventsWithWorkflowTasks(30));

    const wftGroups = getGroupArray().filter(
      (g) => g.initialEvent.eventType === 'WorkflowTaskScheduled',
    );
    expect(wftGroups.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Group assembly: park followers until their head arrives
// ---------------------------------------------------------------------------

describe('group assembly', () => {
  it('assembles a 3-event activity group loaded head-first', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    processEvent(scheduled, true);
    processEvent(started, true);
    processEvent(completed, true);

    const group = firstGroup();
    expect(group.eventList.length).toBe(3);
    expect(group.id).toBe('1');
  });

  it('assembles when followers arrive before the head (descending cursor)', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    // Desc cursor delivers completion + start first, then the head.
    processEvent(completed, false);
    processEvent(started, false);
    processEvent(scheduled, true);

    expect(firstGroup().eventList.length).toBe(3);
  });

  it('keeps eventList sorted by id when Completed arrives before Started', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    processEvent(scheduled, true);
    processEvent(completed, false);
    processEvent(started, false);

    expect(firstGroup().eventList.map((e) => e.id)).toEqual([
      String(scheduled.eventId),
      String(started.eventId),
      String(completed.eventId),
    ]);
  });

  it('maintains correct membership across multiple interleaved groups', () => {
    const activity1 = makeActivityGroup(1);
    const activity2 = makeActivityGroup(4);
    const timer = makeTimerGroup(7);
    for (const event of [...activity1, ...activity2, ...timer]) {
      processEvent(event, true);
    }

    const groups = getGroupArray();
    expect(groups[0].eventList.length).toBe(3); // activity
    expect(groups[1].eventList.length).toBe(3); // activity
    expect(groups[2].eventList.length).toBe(2); // timer
  });
});

// ---------------------------------------------------------------------------
// Solo events (non-group heads)
// ---------------------------------------------------------------------------

describe('solo events', () => {
  it('does not register WorkflowExecutionStarted/Completed as groups', () => {
    processEvent(makeWorkflowStarted(1), true);
    processEvent(makeWorkflowCompleted(2), true);
    expect(getGroupArray()).toHaveLength(0);
  });

  it('includes solo events in the flat event array', () => {
    processEvent(makeWorkflowStarted(1), true);
    for (const event of makeActivityGroup(2)) processEvent(event, true);

    const ids = getEventArray().map((e) => e.id);
    expect(ids).toContain('1');
    expect(ids).toEqual([...ids].sort((a, b) => Number(a) - Number(b)));
  });
});

// ---------------------------------------------------------------------------
// Dedup across the fetch cursors and the concurrent live poll
// ---------------------------------------------------------------------------

describe('dedup', () => {
  it('drops a live event the fetch already delivered', () => {
    const [scheduled] = makeActivityGroup(1);
    processEvent(scheduled, true);

    expect(appendLiveEvent(scheduled)).toBe(false);
    expect(getEventArray().filter((e) => e.id === '1')).toHaveLength(1);
  });

  it('drops a fetched event the live poll already delivered', () => {
    const scheduled = makeActivityScheduled(1, 'MyActivity');
    expect(appendLiveEvent(scheduled)).toBe(true);

    processEvent(scheduled, true);
    expect(getEventArray().filter((e) => e.id === '1')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// getGroupArray
// ---------------------------------------------------------------------------

describe('getGroupArray', () => {
  it('returns groups sorted by ascending event id regardless of load order', () => {
    for (const event of makeActivityGroup(4)) processEvent(event, false);
    for (const event of makeActivityGroup(1)) processEvent(event, true);

    const groups = getGroupArray();
    expect(groups.length).toBe(2);
    expect(Number(groups[0].id)).toBeLessThan(Number(groups[1].id));
  });

  it('excludeWorkflowTasks filters WFT groups', () => {
    for (const event of makeWorkflowTaskGroup(1)) processEvent(event, true);
    for (const event of makeActivityGroup(4)) processEvent(event, true);

    expect(getGroupArray().length).toBe(2);
    const noWft = getGroupArray({ excludeWorkflowTasks: true });
    expect(noWft.length).toBe(1);
    expect(noWft[0].initialEvent.eventType).toBe('ActivityTaskScheduled');
  });

  it('is cached and stable until the buffer changes', () => {
    for (const event of makeActivityGroup(1)) processEvent(event, true);
    expect(getGroupArray()).toBe(getGroupArray());

    processEvent(makeActivityGroup(4)[0], true);
    expect(getGroupArray().length).toBe(2);
  });

  it('returns an empty array when only solo events are present', () => {
    processEvent(makeWorkflowStarted(1), true);
    expect(getGroupArray()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// enrichGroups — pending activity/nexus annotation
// ---------------------------------------------------------------------------

describe('enrichGroups', () => {
  it('sets pendingActivity on an in-flight activity group', () => {
    processEvent(makeActivityScheduled(1, 'MyActivity'), true);
    enrichGroups(
      [
        { activityId: '1', state: 'Started', activityType: 'MyActivity' },
      ] as PendingActivities,
      [],
    );

    expect(firstGroup().pendingActivity?.activityId).toBe('1');
  });

  it('does not set pendingActivity on a completed activity group', () => {
    for (const event of makeActivityGroup(1)) processEvent(event, true);
    enrichGroups(
      [{ activityId: '1', state: 'Started' }] as PendingActivities,
      [],
    );

    expect(firstGroup().pendingActivity).toBeUndefined();
  });

  it('clears a previously set pendingActivity when no longer pending', () => {
    processEvent(makeActivityScheduled(1, 'MyActivity'), true);
    enrichGroups(
      [{ activityId: '1', state: 'Started' }] as PendingActivities,
      [],
    );
    expect(firstGroup().pendingActivity).toBeDefined();

    enrichGroups([], []);
    expect(firstGroup().pendingActivity).toBeUndefined();
  });

  it('clears pendingActivity when a live completion extends the group', () => {
    const [scheduled, started, completed] = makeActivityGroup(1);
    processEvent(scheduled, true);
    processEvent(started, true);
    enrichGroups(
      [{ activityId: '1', state: 'Started' }] as PendingActivities,
      [],
    );
    expect(firstGroup().isPending).toBe(true);

    expect(appendLiveEvent(completed)).toBe(true);

    const group = firstGroup();
    expect(group.eventList).toHaveLength(3);
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('clears pendingActivity when a live timeout resolves a short group', () => {
    const [scheduled, timedOut] = makeActivityTimeoutGroup(1);
    processEvent(scheduled, true);
    enrichGroups(
      [{ activityId: '1', state: 'Started' }] as PendingActivities,
      [],
    );
    expect(firstGroup().isPending).toBe(true);

    expect(appendLiveEvent(timedOut)).toBe(true);

    const group = firstGroup();
    expect(group.eventList.map((e) => e.id)).toEqual(['1', '2']);
    expect(group.pendingActivity).toBeUndefined();
    expect(group.isPending).toBe(false);
  });

  it('annotates live-only activity and nexus groups', () => {
    appendLiveEvent(makeActivityScheduled(1, 'MyActivity'));
    appendLiveEvent(makeNexusOperationGroup(4)[0]);

    enrichGroups(
      [
        { activityId: '1', state: 'Started', activityType: 'MyActivity' },
      ] as PendingActivities,
      [{ scheduledEventId: '4' }] as PendingNexusOperations,
    );

    const groups = getGroupArray();
    expect(groups.find((g) => g.id === '1')?.pendingActivity).toBeDefined();
    expect(
      groups.find((g) => g.id === '4')?.pendingNexusOperation,
    ).toBeDefined();
  });

  it('ignores activities not in the pending list', () => {
    processEvent(makeActivityScheduled(1, 'MyActivity'), true);
    enrichGroups([], []);
    expect(firstGroup().pendingActivity).toBeUndefined();
  });

  it('does not touch non-activity groups', () => {
    for (const event of makeTimerGroup(1)) processEvent(event, true);
    enrichGroups(
      [{ activityId: '1', state: 'Started' }] as PendingActivities,
      [],
    );
    expect(firstGroup().pendingActivity).toBeUndefined();
  });

  // Regression: buffer-backed views track groups by reference, so a pending
  // metadata change must produce a NEW group object (otherwise the timeline /
  // event view never re-derives — the "pause doesn't flip" bug).
  it('hands back a new group reference only when pending state changes', () => {
    processEvent(makeActivityScheduled(1, 'MyActivity'), true);
    const before = firstGroup();

    enrichGroups(
      [
        { activityId: '1', state: 'Started', activityType: 'MyActivity' },
      ] as PendingActivities,
      [],
    );
    const afterChange = firstGroup();
    expect(afterChange).not.toBe(before);
    expect(afterChange.pendingActivity).toBeDefined();

    // Re-enriching with the same pending activity objects is a no-op → same ref.
    const pending = [
      { activityId: '1', state: 'Started', activityType: 'MyActivity' },
    ] as PendingActivities;
    enrichGroups(pending, []);
    const a = firstGroup();
    enrichGroups(pending, []);
    expect(firstGroup()).toBe(a);
  });
});

// ---------------------------------------------------------------------------
// getWorkflowTaskFailedEvent — active WFT failure derived from the buffer
// ---------------------------------------------------------------------------

describe('getWorkflowTaskFailedEvent', () => {
  it('returns undefined when no WFT groups exist', () => {
    processEvent(makeActivityScheduled(1), true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns undefined when a WFT group completed normally', () => {
    for (const event of makeWorkflowTaskGroup(1)) processEvent(event, true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns the failed event when a WFT failure has no later completion', () => {
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1), true);

    expect(getWorkflowTaskFailedEvent()?.eventType).toBe('WorkflowTaskFailed');
  });

  it('returns undefined when a later WFT completed (workflow recovered)', () => {
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1), true);
    processEvent(makeWorkflowTaskScheduled(4), true);
    processEvent(makeWorkflowTaskStarted(5, 4), true);
    processEvent(makeWorkflowTaskCompleted(6, 4), true);

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns undefined for a ResetWorkflow-caused failure', () => {
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1, 'ResetWorkflow'), true);

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('returns the most recent failure when multiple WFTs fail', () => {
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1), true);
    processEvent(makeWorkflowTaskScheduled(4), true);
    processEvent(makeWorkflowTaskStarted(5, 4), true);
    processEvent(makeWorkflowTaskFailed(6, 4), true);

    expect(getWorkflowTaskFailedEvent()?.id).toBe('6');
  });

  it('surfaces a WFT failure delivered entirely by the live poll', () => {
    appendLiveEvent(makeWorkflowTaskScheduled(1));
    appendLiveEvent(makeWorkflowTaskStarted(2, 1));
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();

    expect(appendLiveEvent(makeWorkflowTaskFailed(3, 1))).toBe(true);
    expect(getWorkflowTaskFailedEvent()?.id).toBe('3');
  });

  it('surfaces a live failure appended to a fetched WFT head', () => {
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();

    expect(appendLiveEvent(makeWorkflowTaskFailed(3, 1))).toBe(true);
    expect(getWorkflowTaskFailedEvent()?.id).toBe('3');
  });

  it('clears the failure when a later WFT completes via the live poll', () => {
    processEvent(makeWorkflowTaskScheduled(1), true);
    processEvent(makeWorkflowTaskStarted(2, 1), true);
    processEvent(makeWorkflowTaskFailed(3, 1), true);
    expect(getWorkflowTaskFailedEvent()?.id).toBe('3');

    appendLiveEvent(makeWorkflowTaskScheduled(4));
    appendLiveEvent(makeWorkflowTaskStarted(5, 4));
    appendLiveEvent(makeWorkflowTaskCompleted(6, 4));

    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });

  it('does not double-count a live WFT group once the fetch claims its head', () => {
    appendLiveEvent(makeWorkflowTaskScheduled(1));
    appendLiveEvent(makeWorkflowTaskFailed(3, 1));
    processEvent(makeWorkflowTaskScheduled(1), true);

    expect(getWorkflowTaskFailedEvent()?.id).toBe('3');
  });
});

// ---------------------------------------------------------------------------
// reset
// ---------------------------------------------------------------------------

describe('reset', () => {
  it('clears all state for the next workflow', () => {
    for (const event of makeActivityGroup(1)) processEvent(event, true);
    expect(getGroupArray().length).toBe(1);

    reset();
    expect(getGroupArray()).toHaveLength(0);
    expect(getEventArray()).toHaveLength(0);
    expect(getWorkflowTaskFailedEvent()).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Scale smoke test
// ---------------------------------------------------------------------------

describe('scale', () => {
  it('groups a large synthetic history correctly', () => {
    const events = makeSyntheticEvents(5000);
    loadAll(events);

    const expected = groupEvents(toEventHistory(events), 'ascending');
    expect(getGroupArray().map((g) => g.id)).toEqual(expected.map((g) => g.id));
  });
});
