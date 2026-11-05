import { flushSync } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { WorkflowEvent } from '$lib/types/events';

import { createGroupedEventBuffer } from './grouped-event-buffer';
import {
  makeActivityGroup,
  makeTimerGroup,
  makeWorkflowTaskGroup,
} from './test-helpers/synthetic-events';

import { EventBufferView } from './grouped-event-buffer.svelte';

const cleanups: (() => void)[] = [];

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
  vi.restoreAllMocks();
});

describe('EventBufferView direct lookups', () => {
  it('reacts to head and follower arrivals, pending metadata, and reset without flattening', async () => {
    const buffer = createGroupedEventBuffer();
    buffer.reset(20);
    const history = new EventBufferView(buffer);
    cleanups.push(() => history.dispose());
    const events = vi.spyOn(buffer, 'getEventArray');
    const groups = vi.spyOn(buffer, 'getGroupArray');
    const lazyGroups = vi.spyOn(buffer, 'getLazyGroups');
    const eventLookup = vi.spyOn(buffer, 'getEvent');
    const groupLookup = vi.spyOn(buffer, 'getEventGroup');
    const snapshots: {
      event: WorkflowEvent | undefined;
      group: EventGroup | undefined;
    }[] = [];
    cleanups.push(
      $effect.root(() => {
        $effect(() => {
          snapshots.push({
            event: history.event('2'),
            group: history.eventGroup('2', { excludeWorkflowTasks: true }),
          });
        });
      }),
    );
    flushSync();
    expect(snapshots).toEqual([{ event: undefined, group: undefined }]);
    const [head, started, completed] = makeActivityGroup(1);
    buffer.ingestHistoryEvent(started);
    await Promise.resolve();
    flushSync();
    expect(snapshots).toHaveLength(2);
    expect(snapshots.at(-1)?.event?.id).toBe('2');
    expect(snapshots.at(-1)?.group).toBeUndefined();
    buffer.ingestHistoryEvent(head);
    await Promise.resolve();
    flushSync();
    expect(snapshots.at(-1)?.group?.eventCount).toBe(2);
    buffer.setPendingMetadata(
      [{ id: '1', activityId: '1', state: 'Started' }],
      [],
    );
    await Promise.resolve();
    flushSync();
    expect(snapshots.at(-1)?.group?.isPending).toBe(true);
    buffer.ingestHistoryEvent(completed);
    await Promise.resolve();
    flushSync();
    expect(snapshots.at(-1)?.group?.eventCount).toBe(3);
    expect(snapshots.at(-1)?.group?.isPending).toBe(false);
    const beforeUnrelated = snapshots.at(-1);
    for (const event of makeTimerGroup(10)) buffer.ingestHistoryEvent(event);
    await Promise.resolve();
    flushSync();
    expect(snapshots).toHaveLength(6);
    expect(snapshots.at(-1)?.event).toBe(beforeUnrelated?.event);
    expect(snapshots.at(-1)?.group).toBe(beforeUnrelated?.group);
    buffer.reset(20);
    flushSync();
    expect(snapshots.at(-1)).toEqual({ event: undefined, group: undefined });
    expect(eventLookup).toHaveBeenCalledWith('2');
    expect(groupLookup).toHaveBeenCalledWith('2', {
      excludeWorkflowTasks: true,
    });
    expect(events).not.toHaveBeenCalled();
    expect(groups).not.toHaveBeenCalled();
    expect(lazyGroups).not.toHaveBeenCalled();
  });

  it('forwards filtering and invalid IDs and isolates views', async () => {
    const buffer = createGroupedEventBuffer();
    const otherBuffer = createGroupedEventBuffer();
    buffer.reset(3);
    otherBuffer.reset(3);
    const history = new EventBufferView(buffer);
    const other = new EventBufferView(otherBuffer);
    cleanups.push(
      () => history.dispose(),
      () => other.dispose(),
    );
    for (const event of makeWorkflowTaskGroup(1))
      buffer.ingestHistoryEvent(event);
    for (const event of makeTimerGroup(1))
      otherBuffer.ingestHistoryEvent(event);
    await Promise.resolve();
    expect(history.event('2')?.eventType).toBe('WorkflowTaskStarted');
    expect(history.eventGroup('2')?.id).toBe('1');
    expect(
      history.eventGroup('2', { excludeWorkflowTasks: true }),
    ).toBeUndefined();
    expect(history.eventGroup('2', { excludeWorkflowTasks: false })).toBe(
      history.eventGroup('1'),
    );
    expect(other.event('2')?.eventType).toBe('TimerFired');
    expect(other.eventGroup('2')?.category).toBe('timer');
    expect(history.event('2-request-id')).toBeUndefined();
    expect(history.eventGroup('2-request-id')).toBeUndefined();
    buffer.reset(0);
    expect(history.event('2')).toBeUndefined();
    expect(history.eventGroup('2')).toBeUndefined();
    expect(other.event('2')?.eventType).toBe('TimerFired');
  });
});
