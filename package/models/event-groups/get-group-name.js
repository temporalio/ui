import { isActivityTaskScheduledEvent, isMarkerRecordedEvent, isSignalExternalWorkflowExecutionInitiatedEvent, isStartChildWorkflowExecutionInitiatedEvent, isWorkflowExecutionSignaledEvent, isTimerStartedEvent, } from '../../utilities/is-event-type';
export const getEventGroupName = (event) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (!event)
        return;
    if (isActivityTaskScheduledEvent(event)) {
        return (_b = (_a = event.activityTaskScheduledEventAttributes) === null || _a === void 0 ? void 0 : _a.activityType) === null || _b === void 0 ? void 0 : _b.name;
    }
    if (isTimerStartedEvent(event)) {
        return `Timer ${(_c = event.timerStartedEventAttributes) === null || _c === void 0 ? void 0 : _c.timerId} (${(_d = event.timerStartedEventAttributes) === null || _d === void 0 ? void 0 : _d.startToFireTimeout})`;
    }
    if (isSignalExternalWorkflowExecutionInitiatedEvent(event)) {
        return `Signal: ${(_e = event.signalExternalWorkflowExecutionInitiatedEventAttributes) === null || _e === void 0 ? void 0 : _e.signalName}`;
    }
    if (isWorkflowExecutionSignaledEvent(event)) {
        return `Signal received: ${(_f = event.workflowExecutionSignaledEventAttributes) === null || _f === void 0 ? void 0 : _f.signalName}`;
    }
    if (isMarkerRecordedEvent(event)) {
        return `Marker: ${(_g = event.markerRecordedEventAttributes) === null || _g === void 0 ? void 0 : _g.markerName}`;
    }
    if (isStartChildWorkflowExecutionInitiatedEvent(event)) {
        return `Child Workflow: ${(_j = (_h = event.startChildWorkflowExecutionInitiatedEventAttributes) === null || _h === void 0 ? void 0 : _h.workflowType) === null || _j === void 0 ? void 0 : _j.name}`;
    }
};
