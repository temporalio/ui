import { requestFromAPI } from '$lib/utilities/request-from-api';

export const fetchUser = async (request = fetch): Promise<User> => {
  const user: { Name: string; Email: string; Picture: string } =
    await requestFromAPI('/me', {
      request,
    });

  return {
    name: user?.Name,
    email: user?.Email,
    picture: user?.Picture,
  };
};
