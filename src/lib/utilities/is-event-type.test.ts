// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../events.d.ts" />

import { expect } from 'vitest';
import { describe, it } from 'vitest';
import { isLocalActivityMarkerEvent } from './is-event-type';
import { createEvent } from '../models/event-history';

const baseEvent = {
  id: '1',
  eventTime: '2022-12-12T00:17:18.840595463Z',
  version: '0',
  taskId: '28312355',
} as const;

describe('isLocalActivityMarkerEvent', () => {
  it('should return false if it is not a MarkerRecordedEvent', () => {
    const event = createEvent({
      ...baseEvent,
      eventType: 'WorkflowTaskStarted',
      workflowTaskStartedEventAttributes: {
        scheduledEventId: '10',
        identity: '50509@MacBook-Pro-2.lan1@',
        requestId: 'ba23ccc5-86f1-46cb-9a6b-a578b2d66ed8',
      },
    });

    expect(isLocalActivityMarkerEvent(event)).toBe(false);
  });

  it('should return false if the event does not have "markerRecordedEventAttributes"', () => {
    const event = createEvent({
      ...baseEvent,
      eventType: 'MarkerRecorded',
      workflowTaskStartedEventAttributes: {
        scheduledEventId: '10',
        identity: '50509@MacBook-Pro-2.lan1@',
        requestId: 'ba23ccc5-86f1-46cb-9a6b-a578b2d66ed8',
      },
    });

    expect(isLocalActivityMarkerEvent(event)).toBe(false);
  });

  it('should return false the markerName is not "LocalActivity"', () => {
    const event = createEvent({
      ...baseEvent,
      eventType: 'MarkerRecorded',
      markerRecordedEventAttributes: {
        markerName: 'Version',
      },
    });

    expect(isLocalActivityMarkerEvent(event)).toBe(false);
  });

  it('should return false if the event does not have ActivityType or activity_type in its payload', () => {
    const event = createEvent({
      ...baseEvent,
      eventType: 'MarkerRecorded',
      markerRecordedEventAttributes: {
        markerName: 'LocalActivity',
      },
    });

    expect(isLocalActivityMarkerEvent(event)).toBe(false);
  });

  it('should return true if the event has ActivityType in its payload', () => {
    const event = createEvent({
      ...baseEvent,
      eventType: 'MarkerRecorded',
      markerRecordedEventAttributes: {
        markerName: 'LocalActivity',
        details: {
          data: {
            payloads: [
              {
                ActivityType: 'Bingo',
              },
            ],
          },
        },
      },
    });

    expect(isLocalActivityMarkerEvent(event)).toBe(true);
  });

  it('should return true if the event has activity_type in its payload', () => {
    const event = createEvent({
      ...baseEvent,
      eventType: 'MarkerRecorded',
      markerRecordedEventAttributes: {
        markerName: 'LocalActivity',
        details: {
          data: {
            payloads: [
              {
                activity_type: 'Bingo',
              },
            ],
          },
        },
      },
    });

    expect(isLocalActivityMarkerEvent(event)).toBe(true);
  });
});
