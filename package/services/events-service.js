import { paginated } from '../utilities/paginated';
import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
import { toEventHistory } from '../models/event-history';
import { isSortOrder } from '../utilities/is';
const getEndpointForSortOrder = (sortOrder) => {
    if (!isSortOrder(sortOrder))
        return 'events.descending';
    if (sortOrder === 'descending')
        return 'events.descending';
    if (sortOrder === 'ascending')
        return 'events.ascending';
    return 'events.descending';
};
export const fetchRawEvents = async ({ namespace, workflowId, runId, sort, onStart, onUpdate, onComplete, }) => {
    const endpoint = getEndpointForSortOrder(sort);
    const response = await paginated(async (token) => {
        return requestFromAPI(routeForApi(endpoint, { namespace, workflowId, runId }), {
            token,
            request: fetch,
        });
    }, { onStart, onUpdate, onComplete });
    return response.history.events;
};
export const fetchEvents = async (parameters) => {
    const { settings, namespace } = parameters;
    return fetchRawEvents(parameters).then((response) => toEventHistory({ response, namespace, settings }));
};
