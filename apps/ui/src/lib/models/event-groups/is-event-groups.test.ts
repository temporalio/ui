import { describe, expect, it } from 'vitest';

import { isEventGroup, isEventGroups } from '.';
import type { EventGroup, EventGroups } from './event-groups';

import eventGroupsFixture from '$fixtures/event-groups.completed.json';
import eventsFixture from '$fixtures/events.completed.json';

describe('isEventGroups', () => {
  it('should return true for event groups', () => {
    expect(isEventGroups(eventGroupsFixture)).toBe(true);
  });

  it('should return false for events', () => {
    expect(isEventGroups(eventsFixture)).toBe(false);
  });

  it('should return false if given an undefined value', () => {
    expect(isEventGroups(undefined as EventGroups)).toBe(false);
  });

  it('should return false if given null', () => {
    expect(isEventGroups(null as EventGroups)).toBe(false);
  });
});

describe('isEventGroup', () => {
  it('should return false if given an undefined value', () => {
    expect(isEventGroup(undefined as EventGroup)).toBe(false);
  });

  it('should return false if given null', () => {
    expect(isEventGroup(null as EventGroup)).toBe(false);
  });
});
