import { isActivityTaskCanceledEvent, isActivityTaskFailedEvent, isActivityTaskTimedOutEvent, isChildWorkflowExecutionCanceledEvent, isChildWorkflowExecutionFailedEvent, isChildWorkflowExecutionTerminatedEvent, isChildWorkflowExecutionTimedOutEvent, isSignalExternalWorkflowExecutionFailedEvent, isTimerCanceledEvent, isWorkflowExecutionCanceledEvent, isWorkflowExecutionFailedEvent, isWorkflowExecutionTerminatedEvent, isWorkflowExecutionTimedOutEvent, isWorkflowTaskTimedOutEvent, isWorkflowTaskFailedEvent, } from '../../utilities/is-event-type';
import { isEventGroup } from './';
export const eventIsFailureOrTimedOut = (event) => {
    return (isActivityTaskTimedOutEvent(event) ||
        isActivityTaskFailedEvent(event) ||
        isWorkflowExecutionFailedEvent(event) ||
        isWorkflowExecutionTimedOutEvent(event) ||
        isWorkflowTaskTimedOutEvent(event) ||
        isWorkflowTaskFailedEvent(event) ||
        isChildWorkflowExecutionFailedEvent(event) ||
        isChildWorkflowExecutionTimedOutEvent(event) ||
        isSignalExternalWorkflowExecutionFailedEvent(event));
};
export const eventOrGroupIsFailureOrTimedOut = (event) => {
    if (isEventGroup(event))
        return event.isFailureOrTimedOut;
    return eventIsFailureOrTimedOut(event);
};
export const eventIsCanceled = (event) => {
    return (isActivityTaskCanceledEvent(event) ||
        isTimerCanceledEvent(event) ||
        isWorkflowExecutionCanceledEvent(event) ||
        isChildWorkflowExecutionCanceledEvent(event));
};
export const eventOrGroupIsCanceled = (event) => {
    if (isEventGroup(event))
        return event.isCanceled;
    return eventIsCanceled(event);
};
export const eventIsTerminated = (event) => {
    return (isWorkflowExecutionTerminatedEvent(event) ||
        isChildWorkflowExecutionTerminatedEvent(event));
};
export const eventOrGroupIsTerminated = (event) => {
    if (isEventGroup(event))
        return event.isTerminated;
    return eventIsTerminated(event);
};
