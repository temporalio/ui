import { describe, expect, it } from 'vitest';

import {
  getFailedOrPendingEvents,
  getFailedOrPendingGroups,
} from './get-failed-or-pending';

const completedEvent = {
  classification: 'Completed',
  eventType: 'test',
};
const failedEvent = {
  classification: 'Failed',
  eventType: 'test',
};
const timedOutEvent = {
  classification: 'TimedOut',
  eventType: 'test',
};
const canceledEvent = {
  classification: 'Canceled',
  eventType: 'test',
};
const terminatedEvent = {
  classification: 'Terminated',
  eventType: 'test',
};
const pendingActivity = {
  activityType: { name: 'test' },
};
const failedLocalEvent = {
  eventType: 'test',
  markerRecordedEventAttributes: {
    markerName: 'LocalActivity',
    failure: true,
  },
};

const completedEventGroup = {
  events: [completedEvent],
  classification: 'Completed',
  isPending: false,
};
const failedEventGroup = {
  events: [failedEvent],
  classification: 'Failed',
  isPending: false,
};
const pendingEventGroup = {
  events: [failedEvent],
  classification: 'Failed',
  isPending: true,
};

describe('getFailedOrPendingEvents', () => {
  it('should return all items if not filtering for failed event', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, failedEvent],
      false,
    );
    expect(filteredEvents.length).toEqual(2);
  });
  it('should return no items if no failed/timedout/pending events', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, canceledEvent, terminatedEvent],
      true,
    );
    expect(filteredEvents.length).toEqual(0);
  });
  it('should return filtered items for failed event', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, failedEvent],
      true,
    );
    expect(filteredEvents.length).toEqual(1);
  });
  it('should return filtered items for timed out event', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, timedOutEvent],
      true,
    );
    expect(filteredEvents.length).toEqual(1);
  });
  it('should return filtered items for pending events', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, pendingActivity, pendingActivity],
      true,
    );
    expect(filteredEvents.length).toEqual(2);
  });
  it('should return filtered items for failed local event', () => {
    const filteredEvents = getFailedOrPendingEvents(
      [completedEvent, failedLocalEvent],
      true,
    );
    expect(filteredEvents.length).toEqual(1);
  });
});

describe('getFailedOrPendingGroups', () => {
  it('should return all items if not filtering for failed group', () => {
    const filteredGroups = getFailedOrPendingGroups(
      [completedEventGroup, completedEventGroup],
      false,
    );
    expect(filteredGroups.length).toEqual(2);
  });
  it('should return no items if no failed/canceled/pending  group', () => {
    const filteredGroups = getFailedOrPendingGroups(
      [completedEventGroup, completedEventGroup],
      true,
    );
    expect(filteredGroups.length).toEqual(0);
  });
  it('should return filtered items for failed group', () => {
    const filteredGroups = getFailedOrPendingGroups(
      [completedEventGroup, failedEventGroup],
      true,
    );
    expect(filteredGroups.length).toEqual(1);
  });
  it('should return filtered items for pending group', () => {
    const filteredGroups = getFailedOrPendingGroups(
      [completedEventGroup, pendingEventGroup],
      true,
    );
    expect(filteredGroups.length).toEqual(1);
  });
});
