// eslint-disable-next-line @typescript-eslint/triple-slash-reference

import { expect } from 'vitest';
import { describe, it } from 'vitest';
import {
  isLocalActivityMarkerEvent,
  isUpsertWorkflowSearchAttributesEvent,
  // isUpsertWorkflowSearchAttributesEvent,
} from './is-event-type';
import type { UpsertWorkflowSearchAttributesEvent } from '../../types/events';
import { toEvent } from '../models/event-history';

import type { EventType } from './is-event-type';

const baseEvent = {
  id: '1',
  eventTime: '2022-12-12T00:17:18.840595463Z',
  version: '0',
  taskId: '28312355',
} as const;

const workflowTaskStarted: EventType = 'WorkflowTaskStarted';

describe('isLocalActivityMarkerEvent', () => {
  it('should return false if it is not a MarkerRecordedEvent', () => {
    const event = toEvent({
      historyEvent: {
        ...baseEvent,
        eventType: workflowTaskStarted,
        workflowTaskStartedEventAttributes: {
          scheduledEventId: '10',
          identity: '50509@MacBook-Pro-2.lan1@',
          requestId: 'ba23ccc5-86f1-46cb-9a6b-a578b2d66ed8',
        },
      },
      namespace: 'default',
      settings: {},
      accessToken: '',
    });

    if (isUpsertWorkflowSearchAttributesEvent(event)) {
      // type stuff =  typeof event;
      //=== UpsertWorkflowSearchAttributesEvent;
    }

    expect(isLocalActivityMarkerEvent(event)).toBe(false);
  });

  it('should return false if the event does not have "markerRecordedEventAttributes"', () => {
    const event = toEvent({
      historyEvent: {
        ...baseEvent,
        eventType: 'MarkerRecorded',
        workflowTaskStartedEventAttributes: {
          scheduledEventId: '10',
          identity: '50509@MacBook-Pro-2.lan1@',
          requestId: 'ba23ccc5-86f1-46cb-9a6b-a578b2d66ed8',
        },
      },
      namespace: 'default',
      settings: {},
      accessToken: '',
    });

    expect(isLocalActivityMarkerEvent(event)).toBe(false);
  });

  it('should return false the markerName is not "LocalActivity"', () => {
    const event = toEvent({
      historyEvent: {
        ...baseEvent,
        eventType: 'MarkerRecorded',
        markerRecordedEventAttributes: {
          markerName: 'Version',
        },
      },
      namespace: 'default',
      settings: {},
      accessToken: '',
    });

    expect(isLocalActivityMarkerEvent(event)).toBe(false);
  });
});
