export { getGroupForEvent } from './get-group-for-event';
export declare const groupEvents: (events: CommonHistoryEvent[]) => EventGroups;
export declare const isEventGroup: (eventOrGroup: unknown) => eventOrGroup is EventGroup;
export declare const isEventGroups: (eventsOrGroups: unknown[]) => eventsOrGroups is EventGroups;
