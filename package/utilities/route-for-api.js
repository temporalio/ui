import { getApiOrigin } from './get-api-origin';
import { publicPath } from './get-public-path';
const replaceNamespaceInApiUrl = (apiUrl, namespace) => {
    return apiUrl.replace('%namespace%', namespace);
};
const base = (namespace) => {
    var _a;
    let baseUrl = '';
    if (((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.AppConfig) === null || _a === void 0 ? void 0 : _a.apiUrl) && namespace) {
        baseUrl = replaceNamespaceInApiUrl(globalThis.AppConfig.apiUrl, namespace);
    }
    else {
        baseUrl = getApiOrigin();
    }
    if (baseUrl.endsWith('/'))
        baseUrl = baseUrl.slice(0, -1);
    baseUrl = `${baseUrl}${publicPath}`;
    return baseUrl;
};
const withBase = (endpoint, namespace) => {
    if (endpoint.startsWith('/'))
        endpoint = endpoint.slice(1);
    return `${base(namespace)}/api/v1/${endpoint}`;
};
const encode = (parameters) => {
    return Object.keys(parameters !== null && parameters !== void 0 ? parameters : {}).reduce((acc, key) => {
        acc[key] = encodeURIComponent(encodeURIComponent(parameters[key]));
        return acc;
    }, {
        namespace: '',
        workflowId: '',
        scheduleId: '',
        runId: '',
        queue: '',
    });
};
export function routeForApi(route, parameters, shouldEncode = true) {
    if (shouldEncode)
        parameters = encode(parameters);
    const routes = {
        cluster: '/cluster',
        'events.ascending': `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/workflows/${parameters === null || parameters === void 0 ? void 0 : parameters.workflowId}/runs/${parameters === null || parameters === void 0 ? void 0 : parameters.runId}/events`,
        'events.descending': `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/workflows/${parameters === null || parameters === void 0 ? void 0 : parameters.workflowId}/runs/${parameters === null || parameters === void 0 ? void 0 : parameters.runId}/events/reverse`,
        namespaces: '/namespaces',
        query: `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/workflows/${parameters === null || parameters === void 0 ? void 0 : parameters.workflowId}/runs/${parameters === null || parameters === void 0 ? void 0 : parameters.runId}/query`,
        'schedule.delete': `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/schedules/${parameters === null || parameters === void 0 ? void 0 : parameters.scheduleId}`,
        schedule: `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/schedules/${parameters === null || parameters === void 0 ? void 0 : parameters.scheduleId}`,
        schedules: `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/schedules`,
        'search-attributes': '/search-attributes',
        settings: '/settings',
        'task-queue': `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/task-queues/${parameters === null || parameters === void 0 ? void 0 : parameters.queue}`,
        user: '/me',
        'workflow.terminate': `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/workflows/${parameters === null || parameters === void 0 ? void 0 : parameters.workflowId}/runs/${parameters === null || parameters === void 0 ? void 0 : parameters.runId}/terminate`,
        workflow: `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/workflows/${parameters === null || parameters === void 0 ? void 0 : parameters.workflowId}/runs/${parameters === null || parameters === void 0 ? void 0 : parameters.runId}`,
        'workflows.archived': `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/workflows/archived`,
        workflows: `/namespaces/${parameters === null || parameters === void 0 ? void 0 : parameters.namespace}/workflows`,
    };
    return withBase(routes[route], parameters === null || parameters === void 0 ? void 0 : parameters.namespace);
}
