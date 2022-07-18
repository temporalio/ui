/// <reference types="@sveltejs/kit" />

declare module '@crownframework/svelte-error-boundary';
declare module '@sveltejs/svelte-virtual-list';

type NamespaceItem = { namespace: string; href: string; onClick: () => void };

type Optional<T extends unknown, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

interface Window {
  Prism: {
    highlightAll: () => void;
    highlightElement: (element: Element) => void;
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
  message?: string;
}

type Settings = {
  auth: {
    enabled: boolean;
    options: string[];
  };
  baseUrl: string;
  codec: {
    endpoint?: string;
    accessToken?: string;
  };
  defaultNamespace: string;
  showTemporalSystemNamespace: boolean;
  notifyOnNewVersion: boolean;
  feedbackURL: string;
  runtimeEnvironment: {
    isCloud: boolean;
    isLocal: boolean;
    envOverride: boolean;
  };
  version: string;
};

type User = {
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  updated_at?: string;
  sub?: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
type ClusterInformation = import('$lib/extra-types').GetClusterInfoResponse;

type TimeFormat = 'UTC' | 'relative' | 'local';

type SelectOptionValue = number | string | boolean;

type BooleanString = 'true' | 'false';

type OptionLabel = {
  label: string;
  option?: string;
};

type UiVersionInfo = {
  current: string;
  recommended: string;
};

type DataEncoderStatus = 'notRequested' | 'success' | 'error';

type Color =
  | 'blue'
  | 'blueGray'
  | 'gray'
  | 'orange'
  | 'red'
  | 'green'
  | 'red'
  | 'indigo'
  | 'yellow'
  | 'purple'
  | 'pink';
