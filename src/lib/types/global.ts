export type NamespaceListItem = {
  namespace: string;
  href: (namspace: string) => string;
  onClick: (namspace: string) => void;
};

export type Optional<T, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type Replace<T, U extends { [key: string]: unknown }> = Omit<
  T,
  keyof U
> &
  U;

export type Eventual<T> = T | PromiseLike<T>;

export type NamespaceScopedRequest = { namespace: string };

export type NextPageToken = Uint8Array | string;
export type WithNextPageToken = { nextPageToken?: NextPageToken };
export type WithoutNextPageToken<T> = Omit<T, keyof WithNextPageToken>;

export type PaginationCallbacks<T> = {
  onStart?: () => void;
  onUpdate?: (
    full: WithoutNextPageToken<T>,
    current: WithoutNextPageToken<T>,
  ) => void;
  onComplete?: (finalProps: WithoutNextPageToken<T>) => void;
  onError?: (error: unknown) => void;
};

export interface NetworkError {
  statusCode: number;
  statusText: string;
  response: Response;
  message?: string;
}

export type Settings = {
  auth: {
    enabled: boolean;
    options: string[];
  };
  baseUrl: string;
  codec: {
    endpoint?: string;
    passAccessToken?: boolean;
    includeCredentials?: boolean;
    decodeEventHistoryDownload?: boolean;
  };
  defaultNamespace: string;
  disableWriteActions: boolean;
  workflowTerminateDisabled: boolean;
  workflowCancelDisabled: boolean;
  workflowSignalDisabled: boolean;
  workflowResetDisabled: boolean;
  hideWorkflowQueryErrors: boolean;
  batchActionsDisabled: boolean;
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

export type User = {
  accessToken?: string;
  idToken?: string;
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
export type ClusterInformation = import('$lib/types').GetClusterInfoResponse;

export type TimeFormat = 'UTC' | 'relative' | 'local';

export type SelectOptionValue = number | string | boolean;

export type BooleanString = 'true' | 'false';

export type UiVersionInfo = {
  current: string;
  recommended: string;
};

export type DataEncoderStatus = 'notRequested' | 'success' | 'error';

export type Color =
  | 'blue'
  | 'lightBlue'
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
