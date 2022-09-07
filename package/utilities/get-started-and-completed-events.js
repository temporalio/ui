import { isWorkflowExecutionCompletedEvent } from './is-event-type';
const completedEventTypes = [
    'WorkflowExecutionFailed',
    'WorkflowExecutionCompleted',
    'WorkflowExecutionContinuedAsNew',
    'WorkflowExecutionTimedOut',
    'WorkflowExecutionCanceled',
    'WorkflowExecutionTerminated',
];
const isCompletionEvent = (event) => {
    for (const completionType of completedEventTypes) {
        if (event.eventType === completionType)
            return true;
    }
    return false;
};
const getWorkflowCompletedEvent = (events) => {
    for (const event of events) {
        if (isCompletionEvent(event))
            return event;
    }
};
const getEventResult = (event) => {
    if (isWorkflowExecutionCompletedEvent(event)) {
        if (event.attributes.result === null)
            return null;
        return event.attributes.result.payloads;
    }
    return event.attributes;
};
export const getWorkflowStartedAndCompletedEvents = (events) => {
    var _a, _b, _c;
    let input;
    let results;
    const workflowStartedEvent = events === null || events === void 0 ? void 0 : events.find((event) => {
        return !!event.workflowExecutionStartedEventAttributes;
    });
    const workflowCompletedEvent = getWorkflowCompletedEvent(events);
    if (workflowStartedEvent) {
        input = JSON.stringify((_c = (_b = (_a = workflowStartedEvent === null || workflowStartedEvent === void 0 ? void 0 : workflowStartedEvent.workflowExecutionStartedEventAttributes) === null || _a === void 0 ? void 0 : _a.input) === null || _b === void 0 ? void 0 : _b.payloads) !== null && _c !== void 0 ? _c : null);
    }
    if (workflowCompletedEvent) {
        results = JSON.stringify(getEventResult(workflowCompletedEvent));
    }
    return {
        input,
        results,
    };
};
