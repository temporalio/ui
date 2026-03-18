import { BROWSER } from 'esm-env';

import { getAuthUser } from '$lib/stores/auth-user';

type TokenProvider = {
  getAccessToken: () => Promise<string>;
  getIdToken: () => Promise<string | undefined>;
};

let provider: TokenProvider | null = null;

function getGlobalAccessToken(): (() => Promise<string>) | undefined {
  return (globalThis as Record<string, unknown>)?.AccessToken as
    | (() => Promise<string>)
    | undefined;
}

export function isCloudAuthProvider(): boolean {
  return !!getGlobalAccessToken();
}

export function initTokenProvider(): void {
  const globalAccessToken = getGlobalAccessToken();

  if (globalAccessToken) {
    provider = {
      getAccessToken: globalAccessToken,
      getIdToken: async () => undefined,
    };
  } else {
    provider = {
      getAccessToken: async () => getAuthUser().accessToken ?? '',
      getIdToken: async () => getAuthUser().idToken,
    };
  }
}

export async function getAccessToken(): Promise<string> {
  if (!BROWSER) return '';
  if (!provider) initTokenProvider();
  return provider!.getAccessToken();
}

export async function getIdToken(): Promise<string | undefined> {
  if (!BROWSER) return undefined;
  if (!provider) initTokenProvider();
  return provider!.getIdToken();
}
