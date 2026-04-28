import { describe, expect, it } from 'vitest';

import type { EventGroup } from '$lib/models/event-groups/event-groups';

import {
  eventGroupUsesCurrentDuration,
  formatEventGroupDuration,
  getEventGroupDurationEnd,
} from './event-group-duration';

const event = (id: string, eventTime: string) => ({ id, eventTime });

const group = ({
  initialEvent = event('1', '2026-04-28T10:00:00Z'),
  lastEvent = event('2', '2026-04-28T10:05:00Z'),
  isPending = false,
  pendingActivity = undefined,
  pendingNexusOperation = undefined,
}: Partial<EventGroup> = {}): EventGroup =>
  ({
    initialEvent,
    lastEvent,
    isPending,
    pendingActivity,
    pendingNexusOperation,
  }) as EventGroup;

describe('eventGroupUsesCurrentDuration', () => {
  it('uses the current time for pending activity groups', () => {
    const pendingActivityGroup = group({
      isPending: true,
      pendingActivity: {
        activityId: 'activity-id',
      } as EventGroup['pendingActivity'],
    });

    expect(eventGroupUsesCurrentDuration(pendingActivityGroup)).toBe(true);
  });

  it('uses the current time for pending Nexus operation groups', () => {
    const pendingNexusGroup = group({
      isPending: true,
      pendingNexusOperation: {
        scheduledEventId: '1',
      } as EventGroup['pendingNexusOperation'],
    });

    expect(eventGroupUsesCurrentDuration(pendingNexusGroup)).toBe(true);
  });

  it('does not use the current time for closed groups', () => {
    expect(eventGroupUsesCurrentDuration(group())).toBe(false);
  });

  it('does not use the current time for pending non-activity groups', () => {
    expect(eventGroupUsesCurrentDuration(group({ isPending: true }))).toBe(
      false,
    );
  });
});

describe('getEventGroupDurationEnd', () => {
  it('returns the last event time for closed groups', () => {
    const closedGroup = group();

    expect(getEventGroupDurationEnd(closedGroup, '2026-04-28T10:20:00Z')).toBe(
      closedGroup.lastEvent.eventTime,
    );
  });

  it('returns the current time for pending activity and Nexus groups', () => {
    const currentTime = '2026-04-28T10:20:00Z';

    expect(
      getEventGroupDurationEnd(
        group({
          isPending: true,
          pendingActivity: {
            activityId: 'activity-id',
          } as EventGroup['pendingActivity'],
        }),
        currentTime,
      ),
    ).toBe(currentTime);

    expect(
      getEventGroupDurationEnd(
        group({
          isPending: true,
          pendingNexusOperation: {
            scheduledEventId: '1',
          } as EventGroup['pendingNexusOperation'],
        }),
        currentTime,
      ),
    ).toBe(currentTime);
  });
});

describe('formatEventGroupDuration', () => {
  it('formats closed groups from scheduled event time to last event time', () => {
    expect(formatEventGroupDuration({ group: group() })).toBe('5m');
  });

  it('formats pending activity groups from scheduled event time to current time', () => {
    expect(
      formatEventGroupDuration({
        group: group({
          isPending: true,
          pendingActivity: {
            activityId: 'activity-id',
          } as EventGroup['pendingActivity'],
        }),
        currentTime: '2026-04-28T10:20:00Z',
      }),
    ).toBe('20m');
  });
});
