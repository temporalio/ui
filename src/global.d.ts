/// <reference types="@sveltejs/kit" />

declare module '@crownframework/svelte-error-boundary';
declare module '@sveltejs/svelte-virtual-list';

type Optional<T extends unknown, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

interface Window {
  Prism: {
    highlightAll: () => void;
    highlightElement: (element: Element) => void;
  };
}

interface ImportMeta {
  env: {
    VITE_API: string;
  };
}

type Eventual<T> = T | PromiseLike<T>;

type NamespaceScopedRequest = { namespace: string };

type NextPageToken = Uint8Array | string;
type WithNextPageToken = { nextPageToken?: NextPageToken };
type WithoutNextPageToken<T> = Omit<T, keyof WithNextPageToken>;
type NextPageTokens = {
  open: NextPageToken;
  closed: NextPageToken;
};

type PaginationCallbacks<T> = {
  onStart?: () => void;
  onUpdate?: (
    full: WithoutNextPageToken<T>,
    current: WithoutNextPageToken<T>,
  ) => void;
  onComplete?: (finalProps: WithoutNextPageToken<T>) => void;
  onError?: (error: unknown) => void;
};

interface NetworkError {
  statusCode: number;
  statusText: string;
  response: Response;
}

interface RequestOutput {
  status?: number;
  body?: ResponseBody;
  headers?: Headers | Partial<ResponseHeaders>;
}

type Settings = {
  auth: {
    enabled: boolean;
    options: string[];
  };
  baseUrl: string;
  defaultNamespace: string;
  runtimeEnvironment: {
    isCloud: boolean;
    isLocal: boolean;
    envOverride: boolean;
  };
};

type User = {
  email: string;
  name: string;
  picture: string;
};

type ClusterInformation = import('$types').GetClusterInfoResponse;

type TimeFormat = 'UTC' | 'relative' | 'local';

type SelectOptionValue = number | string | boolean;
