import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
export async function getPollers(parameters, options = { returnAllPollers: false }, request = fetch) {
    const workflowPollers = await requestFromAPI(routeForApi('task-queue', parameters), { request, params: { taskQueueType: '1' } });
    const activityPollers = await requestFromAPI(routeForApi('task-queue', parameters), { request, params: { taskQueueType: '2' } });
    activityPollers.pollers.forEach((poller) => {
        poller.taskQueueTypes = ['ACTIVITY'];
    });
    workflowPollers.pollers.forEach((poller) => {
        poller.taskQueueTypes = ['WORKFLOW'];
    });
    const r = (type) => (pollers, poller) => {
        const currentPoller = pollers[poller.identity] || {
            lastAccessTime: undefined,
            taskQueueTypes: [],
        };
        pollers[poller.identity] = {
            lastAccessTime: !currentPoller.lastAccessTime ||
                currentPoller.lastAccessTime < poller.lastAccessTime
                ? poller.lastAccessTime
                : currentPoller.lastAccessTime,
            taskQueueTypes: currentPoller.taskQueueTypes.concat([type]),
        };
        return pollers;
    };
    activityPollers.pollers.filter((pollerA) => workflowPollers.pollers.some((pollerW) => {
        if (pollerA.identity === pollerW.identity) {
            pollerA.taskQueueTypes = [
                ...pollerW.taskQueueTypes,
                ...pollerA.taskQueueTypes,
            ];
            return pollerA;
        }
    }));
    activityPollers.pollers.reduce(r('ACTIVITY'), workflowPollers.pollers.reduce(r('WORKFLOW'), {}));
    const pollers = (options === null || options === void 0 ? void 0 : options.returnAllPollers) && !activityPollers.pollers.length
        ? workflowPollers.pollers
        : activityPollers.pollers;
    const taskQueueStatus = (options === null || options === void 0 ? void 0 : options.returnAllPollers) && !activityPollers.pollers.length
        ? workflowPollers.taskQueueStatus
        : activityPollers.taskQueueStatus;
    return {
        pollers,
        taskQueueStatus,
    };
}
