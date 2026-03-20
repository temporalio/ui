import { getAuthUser } from '$lib/stores/auth-user';
import { consumeAuthCookies } from '$lib/utilities/auth-user-cookie';
import { ossPostResponse, ossPreRequest } from '$lib/utilities/oss-provider';
import { initTokenProvider } from '$lib/utilities/token-provider';

if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = function randomUUID() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => {
      const char = parseInt(c, 10);
      return (
        char ^
        ((crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (char / 4))
      ).toString(16);
    }) as `${string}-${string}-${string}-${string}-${string}`;
  };
}

consumeAuthCookies();

initTokenProvider({
  getAccessToken: async () => getAuthUser().accessToken ?? '',
  getIdToken: async () => getAuthUser().idToken,
  preRequest: ossPreRequest,
  postResponse: ossPostResponse,
});
