import { requestFromAPI } from '../utilities/request-from-api';
import { routeForApi } from '../utilities/route-for-api';
export const fetchUser = async (request = fetch) => {
    const user = await requestFromAPI(routeForApi('user'), {
        request,
    });
    return {
        name: user === null || user === void 0 ? void 0 : user.Name,
        email: user === null || user === void 0 ? void 0 : user.Email,
        picture: user === null || user === void 0 ? void 0 : user.Picture,
    };
};
