import { page } from '$app/state';

import { getAuthUser } from '$lib/stores/auth-user';
import type {
  PostResponseHook,
  PreRequestHook,
} from '$lib/utilities/core-provider';

import { refreshTokens } from './auth-refresh';
import { getCodecEndpoint } from './get-codec';

export function getCsrfToken(): string | undefined {
  try {
    const csrfCookie = '_csrf=';
    const cookies = document.cookie.split(';');
    const csrf = cookies.find((c) => c.includes(csrfCookie));
    if (csrf) {
      return csrf.trim().slice(csrfCookie.length);
    }
  } catch (error) {
    console.error(error);
  }
  return undefined;
}

export const ossPreRequest: PreRequestHook = async (context) => {
  const headers: Record<string, string> =
    (context.options.headers as Record<string, string>) ?? {};

  const user = getAuthUser();

  if (user.accessToken) {
    headers['Authorization'] = `Bearer ${user.accessToken}`;
  }

  if (user.idToken) {
    headers['Authorization-Extras'] = user.idToken;
  }

  const csrf = getCsrfToken();
  if (csrf && !headers['X-CSRF-TOKEN']) {
    headers['X-CSRF-TOKEN'] = csrf;
  }

  return {
    ...context,
    options: {
      ...context.options,
      credentials: 'include' as RequestCredentials,
      headers,
    },
  };
};

export const ossPostResponse: PostResponseHook = async (response, context) => {
  if (response.status !== 401) return response;

  const refreshed = await refreshTokens();
  if (refreshed) {
    return context.retry();
  }

  return response;
};

export async function ossGetDataEncoderEndpoint(
  _namespace: string,
): Promise<string> {
  const settings = page.data?.settings;
  return getCodecEndpoint(settings);
}
