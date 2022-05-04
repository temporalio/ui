import { isActivityTaskTimedOutEvent } from '$lib/utilities/is-event-type';
import { isEventGroup } from '$lib/models/event-groups';

export const groupHasActivityTimedOut = (eventGroup: EventGroup): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groupEvents = Array.from(eventGroup.events, ([key, value]) => value);
  return Boolean(groupEvents.find(isActivityTaskTimedOutEvent));
};

export const eventOrGroupHasActivityTimedOut = (
  event: IterableEvent,
) => {
  if (isEventGroup(event)) return groupHasActivityTimedOut(event);
  return isActivityTaskTimedOutEvent(event as WorkflowEvent)
}
