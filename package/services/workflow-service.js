import { toWorkflowExecution, toWorkflowExecutions, } from '../models/workflow-execution';
import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
import { toListWorkflowQuery } from '../utilities/query/list-workflow-query';
import { handleUnauthorizedOrForbiddenError } from '../utilities/handle-error';
export const fetchAllWorkflows = async (namespace, parameters, request = fetch, archived = false) => {
    var _a;
    const query = decodeURIComponent(parameters.query || toListWorkflowQuery(parameters, archived));
    const endpoint = archived
        ? 'workflows.archived'
        : 'workflows';
    let error = '';
    const onError = (err) => {
        var _a, _b;
        // Kick out to login if 401/403
        handleUnauthorizedOrForbiddenError(err);
        error =
            (_b = (_a = err === null || err === void 0 ? void 0 : err.body) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : `Error fetching workflows: ${err.status}: ${err.statusText}`;
    };
    const handleError = () => {
        // Handle when bad namespace is entered in URL and no status code is returned
        error = 'Failed to fetch workflows';
    };
    const { executions, nextPageToken } = (_a = (await requestFromAPI(routeForApi(endpoint, { namespace }), {
        params: { query },
        onError,
        handleError,
        request,
    }))) !== null && _a !== void 0 ? _a : { executions: [], nextPageToken: '' };
    return {
        workflows: toWorkflowExecutions({ executions }),
        nextPageToken: String(nextPageToken),
        error,
    };
};
export const fetchAllArchivedWorkflows = async (namespace, parameters, request = fetch) => {
    return fetchAllWorkflows(namespace, parameters, request, true);
};
export async function fetchWorkflow(parameters, request = fetch) {
    return requestFromAPI(routeForApi('workflow', parameters), { request }).then(toWorkflowExecution);
}
