import { isActivityTaskScheduledEvent, isMarkerRecordedEvent, isSignalExternalWorkflowExecutionInitiatedEvent, isStartChildWorkflowExecutionInitiatedEvent, isWorkflowExecutionSignaledEvent, isTimerStartedEvent, } from '../../utilities/is-event-type';
import { eventIsFailureOrTimedOut, eventIsCanceled, eventIsTerminated, } from './get-event-in-group';
import { getGroupId } from './get-group-id';
import { getEventGroupName } from './get-group-name';
import { getLastEvent } from './get-last-event';
const createGroupFor = (event) => {
    const id = getGroupId(event);
    const name = getEventGroupName(event);
    const { timestamp, category, classification } = event;
    const initialEvent = event;
    const events = new Map();
    const eventIds = new Set();
    events.set(event.id, event);
    eventIds.add(event.id);
    return {
        id,
        name,
        events,
        eventIds,
        initialEvent,
        timestamp,
        category,
        classification,
        get eventTime() {
            var _a;
            return (_a = this.lastEvent) === null || _a === void 0 ? void 0 : _a.eventTime;
        },
        get attributes() {
            var _a;
            return (_a = getLastEvent(this)) === null || _a === void 0 ? void 0 : _a.attributes;
        },
        get eventList() {
            return Array.from(this.events, ([_key, value]) => value);
        },
        get lastEvent() {
            return getLastEvent(this);
        },
        get isFailureOrTimedOut() {
            return Boolean(this.eventList.find(eventIsFailureOrTimedOut));
        },
        get isCanceled() {
            return Boolean(this.eventList.find(eventIsCanceled));
        },
        get isTerminated() {
            return Boolean(this.eventList.find(eventIsTerminated));
        },
    };
};
export const createEventGroup = (event) => {
    if (isActivityTaskScheduledEvent(event))
        return createGroupFor(event);
    if (isStartChildWorkflowExecutionInitiatedEvent(event))
        return createGroupFor(event);
    if (isTimerStartedEvent(event))
        return createGroupFor(event);
    if (isSignalExternalWorkflowExecutionInitiatedEvent(event))
        return createGroupFor(event);
    if (isWorkflowExecutionSignaledEvent(event))
        return createGroupFor(event);
    if (isMarkerRecordedEvent(event))
        return createGroupFor(event);
};
