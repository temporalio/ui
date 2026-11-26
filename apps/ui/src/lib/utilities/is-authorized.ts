import type { Settings, User } from '$lib/types/global';

export const isAuthorized = (settings: Settings, user: User): boolean => {
  return !settings.auth.enabled || Boolean(user?.accessToken);
};
