import { notifications } from '../stores/notifications';
import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
const emptyNamespace = {
    namespaces: [],
};
export async function fetchNamespaces(settings, request = fetch) {
    if (settings.runtimeEnvironment.isCloud) {
        return emptyNamespace;
    }
    const results = await requestFromAPI(routeForApi('namespaces'), {
        request,
        onError: () => notifications.add('error', 'Unable to fetch namespaces'),
    });
    return results !== null && results !== void 0 ? results : emptyNamespace;
}
