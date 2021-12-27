type Activity = Record<ActivityType, HistoryEventWithId>;
type Activities = Record<string, Activity>;

const set = (
  activities: Activities,
  activityId: string | Long,
  property: ActivityType,
  value: HistoryEventWithId,
): void => {
  const id = String(activityId);
  if (!activities[id]) activities[id] = {} as Activity;
  activities[id][property] = value;
};

export const collectActivities = (events: HistoryEventWithId[]) => {
  const activities: Activities = {};

  for (const event of events) {
    if (event.eventType === 'ActivityTaskScheduled') {
      set(activities, event.id, event.eventType, event);
    }

    if (event.eventType === 'ActivityTaskStarted') {
      set(
        activities,
        event.activityTaskStartedEventAttributes.scheduledEventId,
        event.eventType,
        event,
      );
    }

    if (event.eventType === 'ActivityTaskCanceled') {
      set(
        activities,
        event.activityTaskCanceledEventAttributes.scheduledEventId,
        event.eventType,
        event,
      );
    }

    if (event.eventType === 'ActivityTaskCancelRequested') {
      set(
        activities,
        event.activityTaskCancelRequestedEventAttributes.scheduledEventId,
        event.eventType,
        event,
      );
    }

    if (event.eventType === 'ActivityTaskFailed') {
      set(
        activities,
        event.activityTaskFailedEventAttributes.scheduledEventId,
        event.eventType,
        event,
      );
    }

    if (event.eventType === 'ActivityTaskTimedOut') {
      set(
        activities,
        event.activityTaskTimedOutEventAttributes.scheduledEventId,
        event.eventType,
        event,
      );
    }

    if (event.eventType === 'ActivityTaskCompleted') {
      set(
        activities,
        event.activityTaskCompletedEventAttributes.scheduledEventId,
        event.eventType,
        event,
      );
    }
  }

  return activities;
};
