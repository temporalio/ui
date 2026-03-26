import { BROWSER } from 'esm-env';

export type RequestContext = {
  url: string;
  options: RequestInit;
};

export type PreRequestHook = (
  context: RequestContext,
) => Promise<RequestContext>;

export type PostResponseHook = (
  response: Response,
  context: RequestContext & { retry: () => Promise<Response> },
) => Promise<Response>;

export type CoreProvider = {
  getAccessToken: () => Promise<string>;
  getIdToken: () => Promise<string | undefined>;
  api: {
    preRequest: PreRequestHook;
    postResponse: PostResponseHook;
  };
  getDataEncoderEndpoint: (namespace: string) => Promise<string>;
  searchNamespaces: (query: string) => Promise<string[]>;
};

export type InitOptions = {
  getAccessToken: () => Promise<string>;
  getIdToken?: () => Promise<string | undefined>;
  api?: {
    preRequest?: PreRequestHook;
    postResponse?: PostResponseHook;
  };
  getDataEncoderEndpoint?: (namespace: string) => Promise<string>;
  searchNamespaces?: (query: string) => Promise<string[]>;
};

let provider: CoreProvider | null = null;

const passthrough: PreRequestHook = async (ctx) => ctx;
const passthroughResponse: PostResponseHook = async (res) => res;

export function initCoreProvider(options: InitOptions): void {
  provider = {
    getAccessToken: options.getAccessToken,
    getIdToken: options.getIdToken ?? (async () => undefined),
    api: {
      preRequest: options.api?.preRequest ?? passthrough,
      postResponse: options.api?.postResponse ?? passthroughResponse,
    },
    getDataEncoderEndpoint: options.getDataEncoderEndpoint ?? (async () => ''),
    searchNamespaces: options.searchNamespaces ?? (async () => []),
  };
}

export async function getAccessToken(): Promise<string> {
  if (!BROWSER || !provider) return '';
  return provider.getAccessToken();
}

export async function getIdToken(): Promise<string | undefined> {
  if (!BROWSER || !provider) return undefined;
  return provider.getIdToken();
}

export async function getDataEncoderEndpoint(
  namespace: string,
): Promise<string> {
  if (!BROWSER || !provider) return '';
  return provider.getDataEncoderEndpoint(namespace);
}

export async function searchNamespaces(query: string): Promise<string[]> {
  if (!BROWSER || !provider) return [];
  return provider.searchNamespaces(query);
}

export async function runPreRequest(
  context: RequestContext,
): Promise<RequestContext> {
  if (!provider) return context;
  return provider.api.preRequest(context);
}

export async function runPostResponse(
  response: Response,
  context: RequestContext & { retry: () => Promise<Response> },
): Promise<Response> {
  if (!provider) return response;
  return provider.api.postResponse(response, context);
}
