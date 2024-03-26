import type { Settings, User } from '$lib/types/global';
import { OIDCFlow } from '$lib/types/global';

export const isAuthorized = (settings: Settings, user: User): boolean => {
  return (
    !settings.auth.enabled ||
    Boolean(
      (settings.auth.flow == OIDCFlow.AuthorizationCode && user?.accessToken) ||
        (settings.auth.flow == OIDCFlow.Implicit && user?.idToken),
    )
  );
};
