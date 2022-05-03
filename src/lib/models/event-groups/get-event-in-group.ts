import { isActivityTaskTimedOutEvent } from '$lib/utilities/is-event-type';

export const groupHasActivityTimedOut = (eventGroup: EventGroup): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const groupEvents = Array.from(eventGroup.events, ([key, value]) => value);
  return Boolean(groupEvents.find(isActivityTaskTimedOutEvent));
};
