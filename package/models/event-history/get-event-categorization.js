export const eventTypeCategorizations = {
    ActivityTaskCanceled: 'activity',
    ActivityTaskCancelRequested: 'activity',
    ActivityTaskCompleted: 'activity',
    ActivityTaskFailed: 'activity',
    ActivityTaskScheduled: 'activity',
    ActivityTaskStarted: 'activity',
    ActivityTaskTimedOut: 'activity',
    ChildWorkflowExecutionCanceled: 'child-workflow',
    ChildWorkflowExecutionCompleted: 'child-workflow',
    ChildWorkflowExecutionFailed: 'child-workflow',
    ChildWorkflowExecutionStarted: 'child-workflow',
    ChildWorkflowExecutionTerminated: 'child-workflow',
    ChildWorkflowExecutionTimedOut: 'child-workflow',
    StartChildWorkflowExecutionFailed: 'child-workflow',
    StartChildWorkflowExecutionInitiated: 'child-workflow',
    MarkerRecorded: 'marker',
    SignalExternalWorkflowExecutionFailed: 'signal',
    SignalExternalWorkflowExecutionInitiated: 'signal',
    WorkflowExecutionSignaled: 'signal',
    TimerCanceled: 'timer',
    TimerFired: 'timer',
    TimerStarted: 'timer',
    WorkflowExecutionCanceled: 'workflow',
    WorkflowExecutionCancelRequested: 'workflow',
    WorkflowExecutionCompleted: 'workflow',
    WorkflowExecutionContinuedAsNew: 'workflow',
    WorkflowExecutionFailed: 'workflow',
    WorkflowExecutionStarted: 'workflow',
    WorkflowExecutionTerminated: 'workflow',
    WorkflowExecutionTimedOut: 'workflow',
    WorkflowTaskCompleted: 'workflow',
    WorkflowTaskFailed: 'workflow',
    WorkflowTaskScheduled: 'workflow',
    WorkflowTaskStarted: 'workflow',
    WorkflowTaskTimedOut: 'workflow',
    ExternalWorkflowExecutionCancelRequested: 'workflow',
    ExternalWorkflowExecutionSignaled: 'workflow',
    RequestCancelExternalWorkflowExecutionFailed: 'workflow',
    RequestCancelExternalWorkflowExecutionInitiated: 'workflow',
    UpsertWorkflowSearchAttributes: 'command',
};
const categories = [
    'activity',
    'child-workflow',
    'command',
    'marker',
    'signal',
    'timer',
    'workflow',
];
export const allEventTypeOptions = [
    { label: 'All', option: undefined },
    { label: 'Activity', option: 'activity', color: '#8B5CF6' },
    { label: 'Child Workflow', option: 'child-workflow', color: '#F59E0B' },
    { label: 'Command', option: 'command', color: '#10B981' },
    { label: 'Marker', option: 'marker', color: '#EC4899' },
    { label: 'Signal', option: 'signal', color: '#DD6B20' },
    { label: 'Timer', option: 'timer', color: '#1D4ED8' },
    { label: 'Workflow', option: 'workflow', color: '#10B981' },
];
const compactEventTypes = [
    undefined,
    'activity',
    'signal',
    'timer',
];
export const compactEventTypeOptions = allEventTypeOptions.filter(({ option }) => compactEventTypes.includes(option));
const timelineEventTypes = [
    'activity',
    'child-workflow',
    'command',
    'marker',
    'signal',
    'timer',
];
export const timelineEventTypeOptions = allEventTypeOptions.filter(({ option }) => timelineEventTypes.includes(option));
export const getEventCategory = (eventType) => {
    return eventTypeCategorizations[eventType];
};
export const isCategoryType = (value) => {
    for (const category of categories) {
        if (value === category)
            return true;
    }
    return false;
};
export const getEventsInCategory = (events, category) => {
    if (!isCategoryType(category))
        return events;
    return events.filter((event) => event.category === category);
};
