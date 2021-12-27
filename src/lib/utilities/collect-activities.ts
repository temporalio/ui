type Activity = Record<ActivityType, HistoryEventWithId>;
type Activities = Record<string, Activity>;
type ActivityGroup = {
  name?: string;
  taskQueue?: string;
  events: Activities;
};

const set = (
  activities: ActivityGroup,
  activityId: string | Long,
  property: ActivityType,
  value: HistoryEventWithId,
): void => {
  const id = String(activityId);
  if (!activities[id]) {
    const events = {} as Activities;
    activities[id] = {
      events,
    } as ActivityGroup;
  }
  activities[id].events[property] = value;
};

const setMetadata = (
  activities: ActivityGroup,
  eventId: string | Long,
  scheduledEvent: HistoryEventWithId,
): void => {
  const id = String(eventId);
  const { activityType, taskQueue } =
    scheduledEvent.activityTaskScheduledEventAttributes;

  activities[id].name = activityType.name;
  activities[id].taskQueue = taskQueue.name;
};

export const collectActivities = (events: HistoryEventWithId[]) => {
  const activities: ActivityGroup = {
    events: {} as Activities,
  };

  for (const event of events) {
    if (event.eventType === 'ActivityTaskScheduled') {
      set(activities, event.id, event.eventType, event);
      setMetadata(activities, event.id, event);
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
