import { searchAttributes } from '../stores/search-attributes';
import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
export const fetchSearchAttributes = async (settings, request = fetch) => {
    if (settings.runtimeEnvironment.isCloud)
        return;
    return await requestFromAPI(routeForApi('search-attributes'), {
        request,
    }).then((searchAttributesResponse) => {
        if (searchAttributesResponse === null || searchAttributesResponse === void 0 ? void 0 : searchAttributesResponse.keys) {
            searchAttributes.set(searchAttributesResponse.keys);
        }
        return searchAttributesResponse;
    });
};
