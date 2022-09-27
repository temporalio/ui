import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

export const fetchUser = async (request = fetch): Promise<User> => {
  const route = await routeForApi('user');
  const user: { Name: string; Email: string; Picture: string } =
    await requestFromAPI(route, {
      request,
    });

  return {
    name: user?.Name,
    email: user?.Email,
    picture: user?.Picture,
  };
};
