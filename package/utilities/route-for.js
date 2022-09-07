import { browser } from '$app/env';
import { toURL } from './to-url';
import { publicPath } from './get-public-path';
import { encodeURIForSvelte } from './encode-uri';
export const isEventView = (view) => {
    if (view === 'feed')
        return true;
    if (view === 'compact')
        return true;
    if (view === 'json')
        return true;
    return false;
};
export const routeForNamespaces = () => {
    return `${publicPath}/namespaces`;
};
export const routeForNamespace = ({ namespace, }) => {
    return `${publicPath}/namespaces/${namespace}`;
};
export const routeForWorkflows = (parameters) => {
    return `${routeForNamespace(parameters)}/workflows`;
};
export const routeForArchivalWorkfows = (parameters) => {
    return `${routeForNamespace(parameters)}/archival`;
};
export const routeForWorkflow = ({ workflow, run, ...parameters }) => {
    const wid = encodeURIForSvelte(workflow);
    return `${routeForWorkflows(parameters)}/${wid}/${run}`;
};
export const routeForSchedules = (parameters) => {
    return `${routeForNamespace(parameters)}/schedules`;
};
export const routeForScheduleCreate = ({ namespace, }) => {
    return `${routeForSchedules({ namespace })}/new`;
};
export const routeForSchedule = ({ scheduleId, namespace, }) => {
    const sid = encodeURIForSvelte(scheduleId);
    return `${routeForSchedules({ namespace })}/${sid}`;
};
export const routeForEventHistory = ({ view, queryParams, ...parameters }) => {
    const eventHistoryPath = `${routeForWorkflow(parameters)}/history`;
    if (!view || !isEventView(view))
        return `${eventHistoryPath}/feed`;
    return toURL(`${eventHistoryPath}/${view}`, queryParams);
};
export const routeForWorkers = (parameters) => {
    return `${routeForWorkflow(parameters)}/workers`;
};
export const routeForTaskQueue = (parameters) => {
    return `${routeForNamespace({
        namespace: parameters.namespace,
    })}/task-queues/${parameters.queue}`;
};
export const routeForStackTrace = (parameters) => {
    return `${routeForWorkflow(parameters)}/stack-trace`;
};
export const routeForWorkflowQuery = (parameters) => {
    return `${routeForWorkflow(parameters)}/query`;
};
export const routeForPendingActivities = (parameters) => {
    return `${routeForWorkflow(parameters)}/pending-activities`;
};
export const routeForAuthentication = (parameters) => {
    var _a;
    const { settings, searchParams: currentSearchParams, originUrl } = parameters;
    const login = new URL(`${publicPath}/auth/sso`, settings.baseUrl);
    let opts = (_a = settings.auth.options) !== null && _a !== void 0 ? _a : [];
    opts = [...opts, 'returnUrl'];
    opts.forEach((option) => {
        const searchParam = currentSearchParams.get(option);
        if (searchParam) {
            login.searchParams.set(option, searchParam);
        }
    });
    if (!login.searchParams.get('returnUrl') && originUrl) {
        login.searchParams.set('returnUrl', originUrl);
    }
    return login.toString();
};
export const routeForLoginPage = (isBrowser = browser) => {
    if (isBrowser) {
        const login = new URL('login', window.location.origin);
        login.searchParams.set('returnUrl', window.location.href);
        return login.toString();
    }
    return `${publicPath}/login`;
};
export const routeForImport = ({ importType, view, }) => {
    if (importType === 'events' && view) {
        return `${publicPath}/import/${importType}/namespace/workflow/run/history/${view}`;
    }
    return `${publicPath}/import/${importType}`;
};
export const hasParameters = (...required) => (parameters) => {
    for (const parameter of required) {
        if (!parameters[parameter])
            return false;
    }
    return true;
};
export const isNamespaceParameter = hasParameters('namespace');
export const isWorkflowParameters = hasParameters('namespace', 'workflow', 'run');
export const isEventHistoryParameters = hasParameters('namespace', 'workflow', 'run', 'view', 'queryParams');
export const isEventParameters = hasParameters('namespace', 'workflow', 'run', 'view', 'eventId');
