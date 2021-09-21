import { derived, Readable } from 'svelte/store';
import {
  isActivityTaskScheduledEvent,
  isActivityTaskStartedEvent,
  isActivityTaskCompletedEvent,
  isActivityTaskFailedEvent,
  isActivityTaskTimedOutEvent,
  isActivityTaskCancelRequestedEvent,
  isActivityTaskCanceledEvent,
} from '$lib/utilities/is-event-type';

type ActivitiesMap = { [key: string]: Activity };

const addToActivities =
  (activities: ActivitiesMap) =>
  (id: string, property: keyof Activity, event: HistoryEvent) => {
    if (!activities[id]) activities[id] = {};
    activities[id][property] = event;
  };

export const createActivityStore = <
  E extends HistoryEvent[],
  S extends Readable<E>,
>(
  eventStore: S,
): Readable<Activity[]> => {
  return derived(eventStore, (events) => {
    const activities: ActivitiesMap = {};
    const add = addToActivities(activities);

    for (const event of events) {
      if (isActivityTaskScheduledEvent(event)) {
        const id = event.activityTaskScheduledEventAttributes.activityId;
        add(id, 'activityTaskScheduledEvent', event);
      }

      if (isActivityTaskStartedEvent(event)) {
        const id = String(
          event.activityTaskStartedEventAttributes.scheduledEventId,
        );
        add(id, 'activityTaskStartedEvent', event);
      }

      if (isActivityTaskCompletedEvent(event)) {
        const id = String(
          event.activityTaskCompletedEventAttributes.scheduledEventId,
        );
        add(id, 'activityTaskCompletedEvent', event);
      }

      if (isActivityTaskFailedEvent(event)) {
        const id = String(
          event.activityTaskFailedEventAttributes.scheduledEventId,
        );
        add(id, 'activityTaskFailedEvent', event);
      }

      if (isActivityTaskTimedOutEvent(event)) {
        const id = String(
          event.activityTaskTimedOutEventAttributes.scheduledEventId,
        );
        add(id, 'activityTaskTimedOutEvent', event);
      }

      if (isActivityTaskCancelRequestedEvent(event)) {
        const id = String(
          event.activityTaskCancelRequestedEventAttributes.scheduledEventId,
        );
        add(id, 'activityTaskCancelRequestedEvent', event);
      }

      if (isActivityTaskCanceledEvent(event)) {
        const id = String(
          event.activityTaskCanceledEventAttributes.scheduledEventId,
        );
        add(id, 'activityTaskCanceledEvent', event);
      }

      return Object.values(activities);
    }
  });
};
