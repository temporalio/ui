import { requestFromAPI } from '$lib/utilities/request-from-api';
import { ApiRoutes } from '$lib/utilities/route-for-api';

export const fetchUser = async (request = fetch): Promise<User> => {
  const user: { Name: string; Email: string; Picture: string } =
    await requestFromAPI(ApiRoutes.user(), {
      request,
    });

  return {
    name: user?.Name,
    email: user?.Email,
    picture: user?.Picture,
  };
};
