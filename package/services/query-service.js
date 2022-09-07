import { isTemporalAPIError, requestFromAPI, } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
import { getQueryTypesFromError } from '../utilities/get-query-types-from-error';
import { atob } from '../utilities/atob';
const formatParameters = async (namespace, workflow) => {
    workflow = await workflow;
    return {
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
    };
};
async function fetchQuery({ workflow, namespace, queryType }, request = fetch, onError) {
    workflow = await workflow;
    const parameters = await formatParameters(namespace, workflow);
    return await requestFromAPI(routeForApi('query', parameters), {
        options: {
            method: 'POST',
            body: JSON.stringify({
                execution: {
                    workflowId: workflow.id,
                    runId: workflow.runId,
                },
                query: {
                    queryType,
                },
            }),
        },
        request,
        onError,
        notifyOnError: false,
    });
}
export async function getQueryTypes(options, request = fetch) {
    return new Promise((resolve, reject) => {
        fetchQuery({ ...options, queryType: '@@temporal-internal__list' }, request, (response) => {
            if (isTemporalAPIError(response.body) &&
                response.body.message.includes('@@temporal-internal__list')) {
                resolve(getQueryTypesFromError(response.body.message));
            }
            else {
                reject(response);
            }
        });
    });
}
export async function getQuery(options, request = fetch) {
    return fetchQuery(options, request).then((execution) => {
        const { queryResult } = execution !== null && execution !== void 0 ? execution : { queryResult: { payloads: [] } };
        let data = queryResult.payloads;
        try {
            if (data[0]) {
                data = atob(queryResult.payloads[0].data);
            }
            return JSON.parse(data);
        }
        catch {
            if (typeof data !== 'string') {
                return JSON.stringify(data);
            }
            return data;
        }
    });
}
export async function getWorkflowStackTrace(options, request = fetch) {
    return getQuery({ ...options, queryType: '__stack_trace' }, request);
}
