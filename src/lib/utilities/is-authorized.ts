export const isAuthorized = (settings: Settings, user: User): boolean => {
  return !settings.auth.enabled || Boolean(user?.accessToken);
};
