import { cluster } from '../stores/cluster';
import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
export const fetchCluster = async (settings, request = fetch) => {
    if (settings.runtimeEnvironment.isCloud)
        return;
    return await requestFromAPI(routeForApi('cluster'), {
        request,
    }).then((clusterInformation) => {
        cluster.set(clusterInformation);
        return clusterInformation;
    });
};
