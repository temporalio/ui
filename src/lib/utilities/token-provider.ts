import { BROWSER } from 'esm-env';

/**
 * Context passed to {@link PreRequestHook} and {@link PostResponseHook}.
 * Contains everything about the outgoing request so hooks can inspect
 * or modify any part of it.
 */
export type RequestContext = {
  url: string;
  options: RequestInit;
};

/**
 * Called before every API request. Return a modified {@link RequestContext}
 * to attach headers, rewrite the URL, alter the body, etc.
 */
export type PreRequestHook = (
  context: RequestContext,
) => Promise<RequestContext>;

/**
 * Called after every API response. Receives the response plus a `retry`
 * callback that re-runs the request through the full pre-request pipeline.
 * Return the original response to pass it through, or call `retry()` to
 * re-execute (e.g. after refreshing tokens on a 401).
 */
export type PostResponseHook = (
  response: Response,
  context: RequestContext & { retry: () => Promise<Response> },
) => Promise<Response>;

type TokenProvider = {
  getAccessToken: () => Promise<string>;
  getIdToken: () => Promise<string | undefined>;
  preRequest: PreRequestHook;
  postResponse: PostResponseHook;
};

/**
 * Configuration for {@link initTokenProvider}.
 *
 * All behavior is dependency-injected — the provider does not know whether
 * it is running in a cloud or self-hosted environment. Callers supply
 * their own token acquisition, request decoration, and response handling.
 *
 * Called once from `hooks.client.ts` before any API requests are made.
 *
 * A future improvement would be to move the cookie→store handoff to a
 * dedicated `/auth/callback` SvelteKit route so no caller needs to deal
 * with the Go server's cookie transport mechanism directly.
 */
type InitOptions = {
  /**
   * Returns the current access token for the authenticated user.
   *
   * This is the primary token used for `Authorization: Bearer` headers on
   * API requests. It is also called directly by the codec server
   * (`data-encoder.ts`) when `passAccessToken` is enabled.
   *
   * **Cloud:** Supply the embedding environment's token function (e.g.
   * `globalThis.AccessToken`). It handles refresh internally — calling it
   * always returns a valid token.
   *
   * **Self-hosted OIDC:** Read from the `authUser` Svelte store, which is
   * backed by `persistStore` (localStorage). The store is populated on
   * init by {@link consumeAuthCookies} and updated after each token
   * refresh.
   */
  getAccessToken: () => Promise<string>;

  /**
   * Returns the current ID token, used for the `Authorization-Extras`
   * header. Optional — defaults to returning `undefined`.
   *
   * Only relevant for self-hosted OIDC flows where the Go server returns
   * both an access token and an ID token in the `user*` cookies.
   */
  getIdToken?: () => Promise<string | undefined>;

  /**
   * Hook called before every API request made by `request-from-api`.
   *
   * Receives the full {@link RequestContext} (url, headers, body, method,
   * etc.) and returns a modified copy. Use this to attach auth headers,
   * inject tracing IDs, rewrite URLs, or inspect the outgoing request.
   *
   * If not provided, requests pass through unmodified.
   *
   * @example
   * ```ts
   * preRequest: async (ctx) => {
   *   const token = await getAccessToken();
   *   const headers = ctx.options.headers as Record<string, string>;
   *   headers['Authorization'] = `Bearer ${token}`;
   *   return { ...ctx, options: { ...ctx.options, headers } };
   * }
   * ```
   */
  preRequest?: PreRequestHook;

  /**
   * Hook called after every API response from `request-from-api`.
   *
   * Receives the {@link Response} and a context object that includes a
   * `retry()` callback. Calling `retry()` re-runs the request through
   * the full pre-request pipeline (so retried requests get fresh headers).
   *
   * Use this to handle 401s, trigger token refresh, or implement custom
   * retry logic. Return the original response to pass it through.
   *
   * If not provided, responses pass through unmodified.
   *
   * @example
   * ```ts
   * postResponse: async (response, ctx) => {
   *   if (response.status === 401) {
   *     const refreshed = await refreshTokens();
   *     if (refreshed) return ctx.retry();
   *   }
   *   return response;
   * }
   * ```
   */
  postResponse?: PostResponseHook;
};

let provider: TokenProvider | null = null;

const passthrough: PreRequestHook = async (ctx) => ctx;
const passthroughResponse: PostResponseHook = async (res) => res;

export function initTokenProvider(options: InitOptions): void {
  provider = {
    getAccessToken: options.getAccessToken,
    getIdToken: options.getIdToken ?? (async () => undefined),
    preRequest: options.preRequest ?? passthrough,
    postResponse: options.postResponse ?? passthroughResponse,
  };
}

/** Returns the current access token, or empty string during SSR. */
export async function getAccessToken(): Promise<string> {
  if (!BROWSER || !provider) return '';
  return provider.getAccessToken();
}

/** Returns the current ID token, or undefined during SSR / if not available. */
export async function getIdToken(): Promise<string | undefined> {
  if (!BROWSER || !provider) return undefined;
  return provider.getIdToken();
}

/**
 * Runs the pre-request hook registered at init.
 * Called by `request-from-api` before every fetch.
 */
export async function runPreRequest(
  context: RequestContext,
): Promise<RequestContext> {
  if (!provider) return context;
  return provider.preRequest(context);
}

/**
 * Runs the post-response hook registered at init.
 * Called by `request-from-api` after every fetch.
 */
export async function runPostResponse(
  response: Response,
  context: RequestContext & { retry: () => Promise<Response> },
): Promise<Response> {
  if (!provider) return response;
  return provider.postResponse(response, context);
}
