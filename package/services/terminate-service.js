import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
export async function terminateWorkflow({ workflow, namespace, reason, }) {
    return await requestFromAPI(routeForApi('workflow.terminate', {
        namespace,
        workflowId: workflow.id,
        runId: workflow.runId,
    }), {
        options: { method: 'POST', body: JSON.stringify({ reason }) },
        shouldRetry: false,
        notifyOnError: false,
    });
}
