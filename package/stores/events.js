import { derived, readable, writable, get, } from 'svelte/store';
import { page } from '$app/stores';
import { fetchEvents, } from '../services/events-service';
import { eventCategoryParam, eventSortOrder } from './event-view';
import { decodeURIForSvelte } from '../utilities/encode-uri';
import { withLoading, delay } from '../utilities/stores/with-loading';
import { groupEvents } from '../models/event-groups';
import { refresh } from './workflow-run';
const emptyEvents = {
    events: [],
    eventGroups: [],
};
const namespace = derived([page], ([$page]) => {
    if ($page.params.namespace) {
        return decodeURIForSvelte($page.params.namespace);
    }
    return '';
});
const workflowId = derived([page], ([$page]) => {
    if ($page.params.workflow) {
        return decodeURIForSvelte($page.params.workflow);
    }
    return '';
});
const runId = derived([page], ([$page]) => {
    if ($page.params.run) {
        return decodeURIForSvelte($page.params.run);
    }
    return '';
});
const settings = derived([page], ([$page]) => $page.stuff.settings);
const emptyPrevious = {
    namespace: null,
    workflowId: null,
    runId: null,
    rawPayloads: null,
    sort: null,
};
const previous = writable(emptyPrevious);
export const clearPreviousEventParameters = () => {
    previous.set(emptyPrevious);
};
const isNewRequest = (params, previous) => {
    for (const required of ['namespace', 'workflowId', 'runId']) {
        if (!params[required])
            return false;
    }
    let matchedPrevious = true;
    const previousParameters = get(previous);
    for (const key of Object.keys(previousParameters)) {
        if (previousParameters[key] !== params[key]) {
            matchedPrevious = false;
            break;
        }
    }
    if (matchedPrevious)
        return false;
    previous.set(params);
    return true;
};
export const parameters = derived([namespace, workflowId, runId, eventSortOrder], ([$namespace, $workflowId, $runId, $sort]) => {
    return {
        namespace: $namespace,
        workflowId: $workflowId,
        runId: $runId,
        sort: $sort,
    };
});
export const parametersWithSettings = derived([parameters, settings, refresh], ([$parameters, $settings, $refresh]) => {
    return {
        ...$parameters,
        settings: $settings,
        refresh,
        $refresh,
    };
});
export const updateEventHistory = (set) => {
    return parametersWithSettings.subscribe(async (params) => {
        const { settings: _, ...rest } = params;
        if (isNewRequest(rest, previous)) {
            withLoading(loading, updating, async () => {
                var _a;
                const events = await fetchEvents(params);
                if ((_a = events === null || events === void 0 ? void 0 : events.events) === null || _a === void 0 ? void 0 : _a.length) {
                    set(events);
                }
                else {
                    setTimeout(() => {
                        set(events);
                    }, delay);
                }
            });
        }
    });
};
export const eventHistory = readable(emptyEvents, updateEventHistory);
export const timelineEvents = writable(null);
export const events = derived([eventHistory, eventCategoryParam, timelineEvents], ([$eventHistory, $category, $timelineEvents]) => {
    if ($timelineEvents) {
        return $timelineEvents;
    }
    const { events } = $eventHistory;
    if (!$category)
        return events;
    return events.filter((event) => event.category === $category);
});
export const eventGroups = derived([eventHistory, eventCategoryParam], ([$eventHistory, $category]) => {
    const { eventGroups } = $eventHistory;
    if (!$category)
        return eventGroups;
    return eventGroups.filter((event) => event.category === $category);
});
export const ascendingEventGroups = derived([eventHistory, eventSortOrder, eventCategoryParam], ([$eventHistory, $sortOrder, $category]) => {
    const { events } = $eventHistory;
    const _events = $sortOrder === 'descending' ? events.slice().reverse() : events;
    const eventGroups = groupEvents(_events);
    if (!$category)
        return eventGroups;
    return eventGroups.filter((event) => event.category === $category);
});
export const ascendingEvents = derived([eventHistory, eventSortOrder, eventCategoryParam], ([$eventHistory, $sortOrder, $category]) => {
    const { events } = $eventHistory;
    const _events = $sortOrder === 'descending' ? events.slice().reverse() : events;
    if (!$category)
        return _events;
    return _events.filter((event) => event.category === $category);
});
export const updating = writable(true);
export const loading = writable(true);
export const activeEvent = writable(null);
