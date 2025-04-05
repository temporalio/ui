import type { IconName } from '$lib/holocene/icon';

export type NamespaceListItem = {
  namespace: string;
  onClick: (namspace: string) => void;
};

export type Optional<T, K extends keyof T = keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type Replace<T, U extends { [key: string]: unknown }> = Omit<
  T,
  keyof U
> &
  U;

export type Only<O extends object, K extends keyof O> = {
  [X in keyof Pick<O, K>]-?: true;
} & {
  [X in keyof Omit<O, K>]: never;
};

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U;

/**
 * Given an object with nested properties
 * returns a Union of the valid nested paths concatenated with a `.`
 * @example
 * ```
 * const myNestedObject = {
 *   a: { b: 'c' },
 *   b: 'c',
 * }
 *
 * type MyNestedObject = Leaves<typeof myNestedObject>; // 'b' | 'a.b';
 * ```
 */
export type Leaves<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never
        ? ''
        : `.${Leaves<T[K]>}`}`;
    }[keyof T]
  : never;

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
  bannerText: string;
  baseUrl: string;
  codec: {
    endpoint?: string;
    passAccessToken?: boolean;
    includeCredentials?: boolean;
  };
  defaultNamespace: string;
  disableWriteActions: boolean;
  workflowTerminateDisabled: boolean;
  workflowCancelDisabled: boolean;
  workflowSignalDisabled: boolean;
  workflowUpdateDisabled: boolean;
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
export type SystemInformation = import('$lib/types').GetSystemInfoResponse;

export type SelectOptionValue = number | string | boolean | undefined;

export type BooleanString = 'true' | 'false';

export type DataEncoderStatus = 'notRequested' | 'success' | 'error';

export type NavLinkListItem = {
  href: string;
  icon: IconName;
  label: string;
  tooltip?: string;
  external?: boolean;
  divider?: boolean;
  enabled?: boolean;
  hidden?: boolean;
  animate?: boolean;
  isActive?: (path: string) => boolean;
};
