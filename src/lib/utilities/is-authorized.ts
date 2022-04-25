export const isAuthorized = (
  settings: Settings,
  user: { name: string; email: string; picture: string },
): boolean => {
  return !settings.auth.enabled || Boolean(user?.email);
};
