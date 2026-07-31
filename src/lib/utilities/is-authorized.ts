import type { Settings } from '$lib/types/global';

export const isAuthorized = (
  settings: { auth: Pick<Settings['auth'], 'enabled'> },
  user: object,
): boolean => {
  return (
    !settings.auth.enabled || Boolean('accessToken' in user && user.accessToken)
  );
};
