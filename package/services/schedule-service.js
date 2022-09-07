import { v4 as uuidv4 } from 'uuid';
import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
export const fetchAllSchedules = async (namespace, request = fetch) => {
    var _a;
    let error = '';
    const onError = (err) => {
        var _a, _b;
        return (error =
            (_b = (_a = err === null || err === void 0 ? void 0 : err.body) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : `Error fetching schedules: ${err.status}: ${err.statusText}`);
    };
    const { schedules, nextPageToken } = (_a = (await requestFromAPI(routeForApi('schedules', { namespace }), {
        params: {},
        onError,
        request,
    }))) !== null && _a !== void 0 ? _a : { schedules: [], nextPageToken: '' };
    return {
        schedules,
        nextPageToken: String(nextPageToken),
        error,
    };
};
export async function fetchSchedule(parameters, request = fetch) {
    return requestFromAPI(routeForApi('schedule', parameters), { request });
}
export async function deleteSchedule(parameters, request = fetch) {
    return requestFromAPI(routeForApi('schedule.delete', parameters), {
        request,
        options: { method: 'DELETE' },
    });
}
export async function createSchedule({ namespace, body, }) {
    let error = '';
    const onError = (err) => {
        var _a, _b;
        return (error =
            (_b = (_a = err === null || err === void 0 ? void 0 : err.body) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : `Error creating schedule: ${err.status}: ${err.statusText}`);
    };
    const { conflictToken } = await requestFromAPI(routeForApi('schedules', {
        namespace,
    }), {
        options: {
            method: 'POST',
            body: JSON.stringify({
                request_id: uuidv4(),
                ...body,
            }),
        },
        shouldRetry: false,
        onError,
    });
    return { conflictToken, error };
}
export async function editSchedule({ namespace, scheduleId, body, }) {
    return await requestFromAPI(routeForApi('schedule', {
        namespace,
        scheduleId,
    }), {
        options: {
            method: 'POST',
            body: JSON.stringify({
                request_id: uuidv4(),
                ...body,
            }),
        },
        shouldRetry: false,
        onError: (error) => console.error(error),
    });
}
export async function pauseSchedule({ namespace, scheduleId, reason, }) {
    const options = {
        patch: {
            pause: reason,
        },
    };
    return await requestFromAPI(routeForApi('schedule', {
        namespace,
        scheduleId: scheduleId,
    }), {
        options: {
            method: 'PATCH',
            body: JSON.stringify({
                ...options,
                request_id: uuidv4(),
            }),
        },
        shouldRetry: false,
        onError: (error) => console.error(error),
    });
}
export async function unpauseSchedule({ namespace, scheduleId, reason, }) {
    const options = {
        patch: {
            unpause: reason,
        },
    };
    return await requestFromAPI(routeForApi('schedule', {
        namespace,
        scheduleId: scheduleId,
    }), {
        options: {
            method: 'PATCH',
            body: JSON.stringify({
                ...options,
                request_id: uuidv4(),
            }),
        },
        shouldRetry: false,
    });
}
