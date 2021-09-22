import { derived, get, Readable } from 'svelte/store';
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
type ActivityStore = Readable<Activity[]> & {
  getActivity: (id: string | number) => Readable<Activity>;
};

const setActivityId = (activities: ActivitiesMap) => (id: string) => {
  if (!activities[id]) activities[id] = {};
  activities[id].id = id;
};

const setActivityStatus =
  (activities: ActivitiesMap) => (id: string, status: ActivityStatus) => {
    if (!activities[id]) activities[id] = {};
    activities[id].status = status;
  };

const addToActivities =
  (activities: ActivitiesMap) =>
  (
    id: string,
    property: keyof Omit<Activity, 'id' | 'status'>,
    event: HistoryEvent,
  ) => {
    if (!activities[id]) activities[id] = {};
    activities[id][property] = event;
  };

export const createActivityStore = <
  E extends HistoryEvent[],
  S extends Readable<E>,
>(
  eventStore: S,
): ActivityStore => {
  const store = derived(
    eventStore,
    (events) => {
      const activities: ActivitiesMap = {};
      const add = addToActivities(activities);
      const setId = setActivityId(activities);
      const setStatus = setActivityStatus(activities);

      for (const event of events) {
        if (isActivityTaskScheduledEvent(event)) {
          const id = event.activityTaskScheduledEventAttributes.activityId;
          add(id, 'activityTaskScheduledEvent', event);
          setId(id);
          setStatus(id, 'Started');
        }

        if (isActivityTaskStartedEvent(event)) {
          const id = String(
            event.activityTaskStartedEventAttributes.scheduledEventId,
          );
          add(id, 'activityTaskStartedEvent', event);
          setStatus(id, 'Started');
        }

        if (isActivityTaskCompletedEvent(event)) {
          const id = String(
            event.activityTaskCompletedEventAttributes.scheduledEventId,
          );
          add(id, 'activityTaskCompletedEvent', event);
          setStatus(id, 'Completed');
        }

        if (isActivityTaskFailedEvent(event)) {
          const id = String(
            event.activityTaskFailedEventAttributes.scheduledEventId,
          );
          add(id, 'activityTaskFailedEvent', event);
          setStatus(id, 'Failed');
        }

        if (isActivityTaskTimedOutEvent(event)) {
          const id = String(
            event.activityTaskTimedOutEventAttributes.scheduledEventId,
          );
          add(id, 'activityTaskTimedOutEvent', event);
          setStatus(id, 'TimedOut');
        }

        if (isActivityTaskCancelRequestedEvent(event)) {
          const id = String(
            event.activityTaskCancelRequestedEventAttributes.scheduledEventId,
          );
          add(id, 'activityTaskCancelRequestedEvent', event);
          setStatus(id, 'CancelRequested');
        }

        if (isActivityTaskCanceledEvent(event)) {
          const id = String(
            event.activityTaskCanceledEventAttributes.scheduledEventId,
          );
          add(id, 'activityTaskCanceledEvent', event);
          setStatus(id, 'Canceled');
        }
      }
      return activities;
    },
    {},
  );

  const activities = derived(store, ($store) => Object.values($store));

  return {
    ...activities,
    getActivity: (id) => derived(store, ($store) => get(store)[id] || {}),
  };
};
