import { writeActionsAreAllowed } from '../utilities/write-actions-are-allowed';
import { simplifyAttributes } from './event-history/simplify-attributes';
const toPendingActivities = (pendingActivity = []) => {
    return pendingActivity.map((activity) => {
        const attributes = simplifyAttributes(activity, true);
        const id = activity.activityId;
        return { ...attributes, id };
    });
};
export const toWorkflowExecution = (response) => {
    var _a, _b, _c, _d, _e, _f;
    const name = response.workflowExecutionInfo.type.name;
    const id = response.workflowExecutionInfo.execution.workflowId;
    const runId = response.workflowExecutionInfo.execution.runId;
    const startTime = String(response.workflowExecutionInfo.startTime);
    const endTime = String(response.workflowExecutionInfo.closeTime);
    const status = response.workflowExecutionInfo.status;
    const isRunning = response.workflowExecutionInfo.status === 'Running';
    const historyEvents = response.workflowExecutionInfo.historyLength;
    const url = `/workflows/${id}/${runId}`;
    const taskQueue = (_b = (_a = response === null || response === void 0 ? void 0 : response.executionConfig) === null || _a === void 0 ? void 0 : _a.taskQueue) === null || _b === void 0 ? void 0 : _b.name;
    const parentNamespaceId = (_c = response === null || response === void 0 ? void 0 : response.workflowExecutionInfo) === null || _c === void 0 ? void 0 : _c.parentNamespaceId;
    const parent = (_d = response === null || response === void 0 ? void 0 : response.workflowExecutionInfo) === null || _d === void 0 ? void 0 : _d.parentExecution;
    const stateTransitionCount = response.workflowExecutionInfo.stateTransitionCount;
    const defaultWorkflowTaskTimeout = (_e = response.executionConfig) === null || _e === void 0 ? void 0 : _e.defaultWorkflowTaskTimeout;
    const pendingActivities = toPendingActivities(response.pendingActivities);
    const pendingChildren = (_f = response === null || response === void 0 ? void 0 : response.pendingChildren) !== null && _f !== void 0 ? _f : [];
    return {
        name,
        id,
        runId,
        startTime,
        endTime,
        status,
        historyEvents,
        url,
        taskQueue,
        pendingActivities,
        pendingChildren,
        parentNamespaceId,
        parent,
        stateTransitionCount,
        isRunning,
        defaultWorkflowTaskTimeout,
        get canBeTerminated() {
            return isRunning && writeActionsAreAllowed();
        },
    };
};
export const toWorkflowExecutions = (response) => {
    return (response.executions || []).map((workflowExecutionInfo) => toWorkflowExecution({ workflowExecutionInfo }));
};
