import { derived, readable, writable } from 'svelte/store';
import { page } from '$app/stores';
import { fetchAllWorkflows } from '../services/workflow-service';
import { withLoading } from '../utilities/stores/with-loading';
export const refresh = writable(0);
const namespace = derived([page], ([$page]) => $page.params.namespace);
const query = derived([page], ([$page]) => $page.url.searchParams.get('query'));
const parameters = derived([namespace, query, refresh], ([$namespace, $query, $refresh]) => {
    return {
        namespace: $namespace,
        query: $query,
        refresh: $refresh,
    };
});
const updateWorkflows = (set) => {
    return parameters.subscribe(({ namespace, query }) => {
        withLoading(loading, updating, async () => {
            const { workflows, error } = await fetchAllWorkflows(namespace, {
                query,
            });
            set(workflows);
            if (error) {
                workflowError.set(error);
            }
            else {
                workflowError.set('');
            }
        });
    });
};
export const workflowsSearch = writable({
    parameters: {},
    searchType: 'basic',
});
export const updating = writable(true);
export const loading = writable(true);
export const workflowError = writable('');
export const workflows = readable([], updateWorkflows);
